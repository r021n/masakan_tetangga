import { Router, Request, Response } from "express";
import { db } from "../db";
import { masakan } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import {
  buatMasakanSchema,
  updateMasakanSchema,
  queryRadiusSchema,
} from "../schemas/masakan";
import { eq, and, sql, getTableColumns } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getParam } from "../utils/params";

const router = Router();

// GET /api/masakan/radius — Cari masakan dalam radius tertentu dari titik pusat
router.get("/api/masakan/radius", async (req: Request, res: Response) => {
  const parsed = queryRadiusSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      message: "Parameter query tidak valid",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { lintang, bujur, radius, kategori, status } = parsed.data;

  const titikPusat = sql`ST_SetSRID(ST_MakePoint(${bujur}, ${lintang}), 4326)`;

  const kondisi: any[] = [
    sql`ST_DWithin(${masakan.lokasi}::geography, ${titikPusat}::geography, ${radius})`,
  ];

  if (kategori) {
    kondisi.push(eq(masakan.kategori, kategori));
  }

  if (status) {
    kondisi.push(eq(masakan.status, status));
  }

  const hasil = await db
    .select({
      ...getTableColumns(masakan),
      jarak: sql<number>`ST_Distance(${masakan.lokasi}::geography, ${titikPusat}::geography)`,
    })
    .from(masakan)
    .where(and(...kondisi))
    .orderBy(
      sql`ST_Distance(${masakan.lokasi}::geography, ${titikPusat}::geography)`,
    )
    .limit(50);

  res.json({ data: hasil });
});

// GET /api/masakan — Ambil semua masakan milik user yang sedang login
router.get("/api/masakan", requireAuth, async (req: Request, res: Response) => {
  const daftar = await db
    .select()
    .from(masakan)
    .where(eq(masakan.penjualId, req.user!.id))
    .orderBy(sql`${masakan.createdAt} DESC`);

  res.json({ data: daftar });
});

// GET /api/masakan/:id — Ambil detail satu masakan
router.get("/api/masakan/:id", async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const hasil = await db
    .select()
    .from(masakan)
    .where(eq(masakan.id, id))
    .limit(1);

  if (!hasil.length) {
    res.status(404).json({ message: "Masakan tidak ditemukan" });
    return;
  }

  res.json({ data: hasil[0] });
});

// POST /api/masakan — Buat masakan baru
router.post(
  "/api/masakan",
  requireAuth,
  async (req: Request, res: Response) => {
    const parsed = buatMasakanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Data masakan tidak valid",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { lintang, bujur, batasWaktu, ...dataLainnya } = parsed.data;

    const id = randomUUID();
    const sekarang = new Date();

    const [baru] = await db
      .insert(masakan)
      .values({
        id,
        penjualId: req.user!.id,
        ...dataLainnya,
        lokasi: { x: bujur, y: lintang },
        batasWaktu: new Date(batasWaktu),
        createdAt: sekarang,
        updatedAt: sekarang,
      })
      .returning();

    res.status(201).json({ data: baru });
  },
);

// PUT /api/masakan/:id — Update masakan
router.put(
  "/api/masakan/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const id = getParam(req.params, "id");
    const parsed = updateMasakanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Data masakan tidak valid",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Cek kepemilikan
    const [dataLama] = await db
      .select({ penjualId: masakan.penjualId })
      .from(masakan)
      .where(eq(masakan.id, id))
      .limit(1);

    if (!dataLama) {
      res.status(404).json({ message: "Masakan tidak ditemukan" });
      return;
    }

    if (dataLama.penjualId !== req.user!.id) {
      res
        .status(403)
        .json({ message: "Kamu tidak bisa mengubah masakan milik orang lain" });
      return;
    }

    const { lintang, bujur, batasWaktu, ...dataLainnya } = parsed.data;

    const dataUpdate: Record<string, any> = { ...dataLainnya };

    if (lintang !== undefined && bujur !== undefined) {
      dataUpdate.lokasi = { x: bujur, y: lintang };
    } else if (lintang !== undefined || bujur !== undefined) {
      res
        .status(400)
        .json({ message: "Latitude dan longitude harus disertakan bersamaan" });
      return;
    }

    if (batasWaktu !== undefined) {
      dataUpdate.batasWaktu = new Date(batasWaktu);
    }

    const [diperbarui] = await db
      .update(masakan)
      .set(dataUpdate)
      .where(eq(masakan.id, id))
      .returning();

    res.json({ data: diperbarui });
  },
);

// DELETE /api/masakan/:id — Hapus masakan
router.delete(
  "/api/masakan/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    // Cek kepemilikan
    const id = getParam(req.params, "id");
    const [dataLama] = await db
      .select({ penjualId: masakan.penjualId })
      .from(masakan)
      .where(eq(masakan.id, id))
      .limit(1);

    if (!dataLama) {
      res.status(404).json({ message: "Masakan tidak ditemukan" });
      return;
    }

    if (dataLama.penjualId !== req.user!.id) {
      res.status(403).json({
        message: "Kamu tidak bisa menghapus masakan milik orang lain",
      });
      return;
    }

    await db.delete(masakan).where(eq(masakan.id, id));

    res.json({ message: "Masakan berhasil dihapus" });
  },
);

export default router;
