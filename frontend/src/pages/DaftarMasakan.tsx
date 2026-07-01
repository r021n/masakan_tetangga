import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMasakanSaya,
  useMasakanRadius,
  useHapusMasakan,
} from "@/hooks/useMasakan";
import {
  KATEGORI_LABEL,
  STATUS_LABEL,
  type DataMasakan,
  type KategoriMasakan,
} from "@/types/masakan";
import { toast } from "sonner";

function KartuMasakan({ masakan: m }: { masakan: DataMasakan }) {
  const hapusMasakan = useHapusMasakan();

  const handleHapus = async () => {
    if (!confirm(`Yakin ingin menghapus "${m.nama}"?`)) return;
    try {
      await hapusMasakan.mutateAsync(m.id);
      toast.success("Masakan berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus masakan");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{m.nama}</CardTitle>
            <CardDescription className="mt-1">
              {m.deskripsi.length > 100
                ? m.deskripsi.substring(0, 100) + "..."
                : m.deskripsi}
            </CardDescription>
          </div>
          <Badge variant="outline">{STATUS_LABEL[m.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{KATEGORI_LABEL[m.kategori]}</Badge>
          <Badge variant="secondary">
            Rp {m.harga.toLocaleString("id-ID")}
          </Badge>
          <Badge variant="secondary">{m.porsi} porsi</Badge>
        </div>
        {m.jarak !== undefined && (
          <p className="text-sm text-muted-foreground mb-2">
            Jarak: {(m.jarak / 1000).toFixed(1)} km
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-3">{m.alamat}</p>
        <p className="text-xs text-muted-foreground mb-3">
          Berlaku hingga: {new Date(m.batasWaktu).toLocaleString("id-ID")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/masakan/${m.id}`}>Detail</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleHapus}
            disabled={hapusMasakan.isPending}
          >
            Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DaftarMasakan() {
  const [tab, setTab] = useState<"saya" | "sekitar">("saya");
  const [lintang, setLintang] = useState("");
  const [bujur, setBujur] = useState("");
  const [radius, setRadius] = useState("5000");
  const [kategori, setKategori] = useState("");
  const [queryParams, setQueryParams] = useState<{
    lintang: number;
    bujur: number;
    radius: number;
    kategori?: string;
  } | null>(null);

  const { data: masakanSaya, isLoading: isLoadingSaya } = useMasakanSaya();
  const { data: masakanSekitar, isLoading: isLoadingSekitar } =
    useMasakanRadius(queryParams);

  const handleCari = () => {
    const lat = parseFloat(lintang);
    const lng = parseFloat(bujur);
    const rad = parseInt(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      toast.error("Masukkan koordinat dan radius yang valid");
      return;
    }

    setQueryParams({
      lintang: lat,
      bujur: lng,
      radius: rad,
      ...(kategori ? { kategori } : {}),
    });
  };

  const handleGunakanLokasiSaya = () => {
    if (!navigator.geolocation) {
      toast.error("Browser kamu tidak mendukung geolokasi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLintang(pos.coords.latitude.toString());
        setBujur(pos.coords.longitude.toString());
        toast.success("Lokasi berhasil didapatkan");
      },
      () => {
        toast.error(
          "Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.",
        );
      },
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Masakan</h1>
        <Button asChild>
          <Link to="/masakan/buat">+ Posting Masakan</Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={tab === "saya" ? "default" : "outline"}
          onClick={() => setTab("saya")}
        >
          Masakan Saya
        </Button>
        <Button
          variant={tab === "sekitar" ? "default" : "outline"}
          onClick={() => setTab("sekitar")}
        >
          Cari di Sekitar
        </Button>
      </div>

      {tab === "sekitar" && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="lintang-cari">Latitude</Label>
                <Input
                  id="lintang-cari"
                  type="number"
                  step="any"
                  placeholder="-6.2088"
                  value={lintang}
                  onChange={(e) => setLintang(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bujur-cari">Longitude</Label>
                <Input
                  id="bujur-cari"
                  type="number"
                  step="any"
                  placeholder="106.8456"
                  value={bujur}
                  onChange={(e) => setBujur(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius-cari">Radius (meter)</Label>
                <Input
                  id="radius-cari"
                  type="number"
                  placeholder="5000"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori-filter">Kategori</Label>
                <select
                  id="kategori-filter"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  <option value="">Semua</option>
                  {(
                    Object.entries(KATEGORI_LABEL) as [
                      KategoriMasakan,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCari}>Cari</Button>
              <Button variant="outline" onClick={handleGunakanLokasiSaya}>
                Gunakan Lokasi Saya
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "saya" && (
        <>
          {isLoadingSaya && <p className="text-muted-foreground">Memuat...</p>}
          {masakanSaya && masakanSaya.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Kamu belum memposting masakan apapun.
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {masakanSaya?.map((m) => (
              <KartuMasakan key={m.id} masakan={m} />
            ))}
          </div>
        </>
      )}

      {tab === "sekitar" && (
        <>
          {queryParams === null && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Masukkan koordinat dan radius lalu klik Cari untuk melihat
                masakan di sekitarmu.
              </CardContent>
            </Card>
          )}
          {isLoadingSekitar && (
            <p className="text-muted-foreground">Memuat...</p>
          )}
          {masakanSekitar && masakanSekitar.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Tidak ada masakan ditemukan dalam radius yang dipilih.
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {masakanSekitar?.map((m) => (
              <KartuMasakan key={m.id} masakan={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
