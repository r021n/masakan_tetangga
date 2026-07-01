import { z } from "zod";

export const kategoriEnum = z.enum([
  "makanan_berat",
  "makanan_ringan",
  "minuman",
  "kue",
  "lainnya",
]);

export const statusEnum = z.enum(["tersedia", "dipesan", "habis"]);

export const buatMasakanSchema = z.object({
  nama: z
    .string()
    .min(3, "Nama masakan minimal 3 karakter")
    .max(100, "Nama masakan maksimal 100 karakter"),
  deskripsi: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  harga: z
    .number()
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif"),
  porsi: z
    .number()
    .int("Porsi harus bilangan bulat")
    .min(1, "Minimal 1 porsi")
    .max(999, "Maksimal 999 porsi"),
  kategori: kategoriEnum,
  lintang: z
    .number()
    .min(-90, "Latitude tidak valid")
    .max(90, "Latitude tidak valid"),
  bujur: z
    .number()
    .min(-180, "Longitude tidak valid")
    .max(180, "Longitude tidak valid"),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  batasWaktu: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, "Batas waktu harus berupa tanggal valid di masa depan"),
});

export const updateMasakanSchema = buatMasakanSchema.partial();

export const queryRadiusSchema = z.object({
  lintang: z.coerce.number().min(-90).max(90),
  bujur: z.coerce.number().min(-180).max(180),
  radius: z.coerce
    .number()
    .int()
    .min(100, "Radius minimal 100 meter")
    .max(50000, "Radius maksimal 50 km"),
  kategori: kategoriEnum.optional(),
  status: statusEnum.optional(),
});

export type BuatMasakanInput = z.infer<typeof buatMasakanSchema>;
export type UpdateMasakanInput = z.infer<typeof updateMasakanSchema>;
export type QueryRadiusInput = z.infer<typeof queryRadiusSchema>;
