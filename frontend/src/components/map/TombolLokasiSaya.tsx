import { useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/stores/mapStore";
import { toast } from "sonner";
import { LocateFixed } from "lucide-react";

export default function TombolLokasiSaya() {
  const peta = useMap();
  const setLokasiPengguna = useMapStore((s) => s.setLokasiPengguna);
  const setPusatPeta = useMapStore((s) => s.setPusatPeta);
  const sedangMencariLokasi = useMapStore((s) => s.sedangMencariLokasi);
  const setSedangMencariLokasi = useMapStore((s) => s.setSedangMencariLokasi);
  const lokasiPengguna = useMapStore((s) => s.lokasiPengguna);

  const handleCariLokasi = () => {
    if (!navigator.geolocation) {
      toast.error("Browser kamu tidak mendukung geolokasi");
      return;
    }

    setSedangMencariLokasi(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lokasiBaru = {
          lintang: pos.coords.latitude,
          bujur: pos.coords.longitude,
        };
        setLokasiPengguna(lokasiBaru);
        setPusatPeta(lokasiBaru);
        peta.flyTo([lokasiBaru.lintang, lokasiBaru.bujur], 14);
        setSedangMencariLokasi(false);
        toast.success("Lokasi berhasil didapatkan");
      },
      () => {
        setSedangMencariLokasi(false);
        toast.error(
          "Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <Button
      size="sm"
      variant={lokasiPengguna ? "default" : "secondary"}
      onClick={handleCariLokasi}
      disabled={sedangMencariLokasi}
      className="shadow-lg"
    >
      <LocateFixed className="w-4 h-4 mr-1" />
      {sedangMencariLokasi ? "Mencari..." : "Lokasi Saya"}
    </Button>
  );
}
