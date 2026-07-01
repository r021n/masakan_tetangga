export interface DataMasakan {
  id: string;
  penjualId: string;
  nama: string;
  deskripsi: string;
  harga: number;
  porsi: number;
  kategori: KategoriMasakan;
  lokasi: { x: number; y: number };
  alamat: string;
  status: StatusMasakan;
  batasWaktu: string;
  createdAt: string;
  updatedAt: string;
  jarak?: number;
}

export interface DataMasakan {
  id: string;
  penjualId: string;
  nama: string;
  deskripsi: string;
  harga: number;
  porsi: number;
  kategori: KategoriMasakan;
  lokasi: { x: number; y: number };
  alamat: string;
  status: StatusMasakan;
  batasWaktu: string;
  createdAt: string;
  updatedAt: string;
  jarak?: number;
}

export type KategoriMasakan =
  | "makanan_berat"
  | "makanan_ringan"
  | "minuman"
  | "kue"
  | "lainnya";

export type StatusMasakan = "tersedia" | "dipesan" | "habis";

export const KATEGORI_LABEL: Record<KategoriMasakan, string> = {
  makanan_berat: "Makanan Berat",
  makanan_ringan: "Makanan Ringan",
  minuman: "Minuman",
  kue: "Kue",
  lainnya: "Lainnya",
};

export const STATUS_LABEL: Record<StatusMasakan, string> = {
  tersedia: "Tersedia",
  dipesan: "Dipesan",
  habis: "Habis",
};
