import { Router, Request, Response } from "express";
import { db } from "../db";
import { masakan } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
  buatMasakanSchema,
  updateMasakanSchema,
  queryRadiusSchema,
} from "../schemas/masakan";
import { eq, and, sql, getTableColumns } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getParam } from "../utils/params";

const router = Router();

const { gambar, ...kolomTanpaGambar } = getTableColumns(masakan);

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
      ...kolomTanpaGambar,
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
    .select(kolomTanpaGambar)
    .from(masakan)
    .where(eq(masakan.penjualId, req.user!.id))
    .orderBy(sql`${masakan.createdAt} DESC`);

  res.json({ data: daftar });
});

// GET /api/masakan/:id — Ambil detail satu masakan
router.get("/api/masakan/:id", async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const hasil = await db
    .select(kolomTanpaGambar)
    .from(masakan)
    .where(eq(masakan.id, id))
    .limit(1);

  if (!hasil.length) {
    res.status(404).json({ message: "Masakan tidak ditemukan" });
    return;
  }

  res.json({ data: hasil[0] });
});

// GET /api/masakan/:id/gambar Ambil data biner gambar langsung dari database
router.get("/api/masakan/:id/gambar", async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const hasil = await db
    .select({ gambar: masakan.gambar })
    .from(masakan)
    .where(eq(masakan.id, id))
    .limit(1);

  if (!hasil.length || !hasil[0].gambar) {
    res.status(404).json({ message: "Gambar tidak ditemukan" });
    return;
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.send(hasil[0].gambar);
});

// POST /api/masakan — Buat masakan baru
router.post(
  "/api/masakan",
  requireAuth,
  upload.single("gambar"),
  async (req: Request, res: Response) => {
    const dataPreprocessed = {
      ...req.body,
      harga: req.body.harga !== undefined ? Number(req.body.harga) : undefined,
      porsi: req.body.porsi !== undefined ? Number(req.body.porsi) : undefined,
      lintang:
        req.body.lintang !== undefined ? Number(req.body.lintang) : undefined,
      bujur: req.body.bujur !== undefined ? Number(req.body.bujur) : undefined,
    };

    const parsed = buatMasakanSchema.safeParse(dataPreprocessed);
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
        gambar: req.file ? req.file.buffer : null,
        createdAt: sekarang,
        updatedAt: sekarang,
      })
      .returning();

    const { gambar: _, ...baruTanpaGambar } = baru;
    res.status(201).json({ data: baruTanpaGambar });
  },
);

// PUT /api/masakan/:id — Update masakan
router.put(
  "/api/masakan/:id",
  requireAuth,
  upload.single("gambar"),
  async (req: Request, res: Response) => {
    const id = getParam(req.params, "id");

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

    // Lakukan konversi data bertipe angka secara manual sebelum validasi Zod.
    const dataPreprocessed = {
      ...req.body,
      harga: req.body.harga !== undefined ? Number(req.body.harga) : undefined,
      porsi: req.body.porsi !== undefined ? Number(req.body.porsi) : undefined,
      lintang:
        req.body.lintang !== undefined ? Number(req.body.lintang) : undefined,
      bujur: req.body.bujur !== undefined ? Number(req.body.bujur) : undefined,
    };

    const parsed = updateMasakanSchema.safeParse(dataPreprocessed);
    if (!parsed.success) {
      res.status(400).json({
        message: "Data masakan tidak valid",
        errors: parsed.error.flatten().fieldErrors,
      });
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

    if (req.file) {
      dataUpdate.gambar = req.file.buffer;
    }

    const [diperbarui] = await db
      .update(masakan)
      .set(dataUpdate)
      .where(eq(masakan.id, id))
      .returning();

    const { gambar: _, ...diperbaruiTanpaGambar } = diperbarui;
    res.json({ data: diperbaruiTanpaGambar });
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
