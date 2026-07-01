import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBuatMasakan } from "@/hooks/useMasakan";
import { KATEGORI_LABEL, type KategoriMasakan } from "@/types/masakan";

const buatMasakanSchema = z.object({
  nama: z
    .string()
    .min(3, "Nama masakan minimal 3 karakter")
    .max(100, "Nama masakan maksimal 100 karakter"),
  deskripsi: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  harga: z.coerce
    .number()
    .int("Harga harus bilangan bulat")
    .min(0, "Harga tidak boleh negatif"),
  porsi: z.coerce
    .number()
    .int("Porsi harus bilangan bulat")
    .min(1, "Minimal 1 porsi"),
  kategori: z.enum([
    "makanan_berat",
    "makanan_ringan",
    "minuman",
    "kue",
    "lainnya",
  ]),
  lintang: z.coerce
    .number()
    .min(-90, "Latitude tidak valid")
    .max(90, "Latitude tidak valid"),
  bujur: z.coerce
    .number()
    .min(-180, "Longitude tidak valid")
    .max(180, "Longitude tidak valid"),
  alamat: z
    .string()
    .min(5, "Alamat minimal 5 karakter")
    .max(500, "Alamat maksimal 500 karakter"),
  batasWaktu: z.string().min(1, "Batas waktu wajib diisi"),
});

type BuatMasakanForm = z.infer<typeof buatMasakanSchema>;

export default function BuatMasakan() {
  const navigate = useNavigate();
  const buatMasakan = useBuatMasakan();
  const [kategoriValue, setKategoriValue] =
    useState<KategoriMasakan>("makanan_berat");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buatMasakanSchema),
    defaultValues: {
      kategori: "makanan_berat",
      porsi: 1,
    },
  });

  const onSubmit = async (data: BuatMasakanForm) => {
    try {
      await buatMasakan.mutateAsync(data);
      toast.success("Masakan berhasil diposting");
      navigate("/masakan/saya", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat masakan");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Posting Masakan Baru</CardTitle>
          <CardDescription>
            Bagikan masakan buatanmu kepada tetangga sekitar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Masakan</Label>
              <Input
                id="nama"
                placeholder="Contoh: Nasi Goreng Kampung"
                {...register("nama")}
              />
              {errors.nama && (
                <p className="text-sm text-red-500">{errors.nama.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                placeholder="Ceritakan tentang masakanmu..."
                rows={4}
                {...register("deskripsi")}
              />
              {errors.deskripsi && (
                <p className="text-sm text-red-500">
                  {errors.deskripsi.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="harga">Harga (Rp)</Label>
                <Input
                  id="harga"
                  type="number"
                  placeholder="15000"
                  {...register("harga")}
                />
                {errors.harga && (
                  <p className="text-sm text-red-500">{errors.harga.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="porsi">Jumlah Porsi</Label>
                <Input
                  id="porsi"
                  type="number"
                  placeholder="5"
                  {...register("porsi")}
                />
                {errors.porsi && (
                  <p className="text-sm text-red-500">{errors.porsi.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={kategoriValue}
                onValueChange={(val) => {
                  setKategoriValue(val as KategoriMasakan);
                  setValue("kategori", val as KategoriMasakan);
                }}
              >
                <SelectTrigger id="kategori">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(KATEGORI_LABEL) as [
                      KategoriMasakan,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kategori && (
                <p className="text-sm text-red-500">
                  {errors.kategori.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lintang">Latitude</Label>
                <Input
                  id="lintang"
                  type="number"
                  step="any"
                  placeholder="-6.2088"
                  {...register("lintang")}
                />
                {errors.lintang && (
                  <p className="text-sm text-red-500">
                    {errors.lintang.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bujur">Longitude</Label>
                <Input
                  id="bujur"
                  type="number"
                  step="any"
                  placeholder="106.8456"
                  {...register("bujur")}
                />
                {errors.bujur && (
                  <p className="text-sm text-red-500">{errors.bujur.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat Lengkap</Label>
              <Textarea
                id="alamat"
                placeholder="Jl. Merdeka No. 10, RT 01 RW 02, Kelurahan..."
                rows={2}
                {...register("alamat")}
              />
              {errors.alamat && (
                <p className="text-sm text-red-500">{errors.alamat.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batasWaktu">Batas Waktu Ketersediaan</Label>
              <Input
                id="batasWaktu"
                type="datetime-local"
                {...register("batasWaktu")}
              />
              {errors.batasWaktu && (
                <p className="text-sm text-red-500">
                  {errors.batasWaktu.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={buatMasakan.isPending}
              >
                {buatMasakan.isPending ? "Menyimpan..." : "Posting Masakan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
