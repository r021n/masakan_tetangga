import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import { useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMapStore } from "@/stores/mapStore";
import { useMasakanRadius } from "@/hooks/useMasakan";
import MasakanMarker from "@/components/map/MasakanMarker";
import RadiusControl from "@/components/map/RadiusControl";
import TombolLokasiSaya from "@/components/map/TombolLokasiSaya";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  KATEGORI_LABEL,
  STATUS_LABEL,
  type DataMasakan,
} from "@/types/masakan";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { List, MapPin } from "lucide-react";

// --- Komponen Internal ---

function PendeteksiGeserPeta() {
  const setPusatPeta = useMapStore((s) => s.setPusatPeta);

  useMapEvents({
    moveend: (e) => {
      const peta = e.target;
      const pusat = peta.getCenter();
      setPusatPeta({ lintang: pusat.lat, bujur: pusat.lng });
    },
  });

  return null;
}

function MarkerLokasiPengguna() {
  const lokasiPengguna = useMapStore((s) => s.lokasiPengguna);

  if (!lokasiPengguna) return null;

  const ikon = L.divIcon({
    className: "marker-pengguna",
    html: `<div style="
      width: 18px; height: 18px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <Marker
      position={[lokasiPengguna.lintang, lokasiPengguna.bujur]}
      icon={ikon}
    >
      <Popup>
        <span className="text-sm font-medium">Lokasi kamu</span>
      </Popup>
    </Marker>
  );
}

function KartuMasakanMini({ masakan: m }: { masakan: DataMasakan }) {
  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{m.nama}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {STATUS_LABEL[m.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="secondary" className="text-xs">
            {KATEGORI_LABEL[m.kategori]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Rp {m.harga.toLocaleString("id-ID")}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {m.porsi} porsi
          </Badge>
        </div>
        {m.jarak !== undefined && (
          <p className="text-xs text-muted-foreground mb-1">
            Jarak: {(m.jarak / 1000).toFixed(1)} km
          </p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {m.alamat}
        </p>
        <Button
          size="xs"
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/masakan/${m.id}`)}
        >
          Lihat Detail
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Komponen Utama ---

export default function PetaMasakan() {
  const lokasiPengguna = useMapStore((s) => s.lokasiPengguna);
  const setLokasiPengguna = useMapStore((s) => s.setLokasiPengguna);
  const setPusatPeta = useMapStore((s) => s.setPusatPeta);
  const pusatPeta = useMapStore((s) => s.pusatPeta);
  const radius = useMapStore((s) => s.radius);
  const setSedangMencariLokasi = useMapStore((s) => s.setSedangMencariLokasi);
  const sedangMencariLokasi = useMapStore((s) => s.sedangMencariLokasi);

  const queryParams = useMemo(
    () => ({
      lintang: pusatPeta.lintang,
      bujur: pusatPeta.bujur,
      radius,
    }),
    [pusatPeta.lintang, pusatPeta.bujur, radius],
  );

  const {
    data: daftarMasakan,
    isLoading: isLoadingMasakan,
    isFetching: isFetchingMasakan,
  } = useMasakanRadius(queryParams);

  // Ambil lokasi pengguna saat halaman pertama kali dimuat
  useEffect(() => {
    if (lokasiPengguna || sedangMencariLokasi) return;

    if (!navigator.geolocation) {
      toast.info(
        "Browser kamu tidak mendukung geolokasi. Menggunakan lokasi default.",
      );
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
        setSedangMencariLokasi(false);
      },
      () => {
        setSedangMencariLokasi(false);
        toast.info(
          "Tidak bisa mengambil lokasi otomatis. Menggunakan lokasi default Jakarta.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      <MapContainer
        center={[pusatPeta.lintang, pusatPeta.bujur]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <PendeteksiGeserPeta />

        <MarkerLokasiPengguna />

        {lokasiPengguna && (
          <Circle
            center={[lokasiPengguna.lintang, lokasiPengguna.bujur]}
            radius={radius}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "6 4",
            }}
          />
        )}

        {daftarMasakan?.map((m) => (
          <MasakanMarker key={m.id} masakan={m} />
        ))}

        <div className="absolute top-4 right-4 z-[1000]">
          <TombolLokasiSaya />
        </div>

        <div className="absolute bottom-4 left-4 z-[1000]">
          <RadiusControl />
        </div>
      </MapContainer>

      {isFetchingMasakan && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Badge variant="secondary" className="shadow-lg">
            Memperbarui...
          </Badge>
        </div>
      )}

      {/* Panel samping desktop: daftar masakan */}
      <div className="absolute top-4 left-4 z-[1000] w-80 max-h-[calc(100vh-128px)] overflow-y-auto hidden lg:block">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Masakan di Sekitar
              {daftarMasakan && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {daftarMasakan.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMasakan && (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            )}
            {daftarMasakan && daftarMasakan.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Tidak ada masakan ditemukan dalam radius{" "}
                {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}.
              </p>
            )}
            <div className="space-y-3">
              {daftarMasakan?.map((m) => (
                <KartuMasakanMini key={m.id} masakan={m} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tombol toggle panel mobile */}
      <div className="absolute bottom-20 right-4 z-[1000] lg:hidden">
        <Button
          size="sm"
          variant="secondary"
          className="shadow-lg rounded-full w-12 h-12 p-0"
          onClick={() => {
            const panel = document.getElementById("panel-mobile-masakan");
            if (panel) {
              panel.classList.toggle("translate-y-full");
              panel.classList.toggle("translate-y-0");
            }
          }}
        >
          <List className="w-5 h-5" />
        </Button>
      </div>

      {/* Panel bawah mobile: daftar masakan */}
      <div
        id="panel-mobile-masakan"
        className="absolute bottom-0 left-0 right-0 z-[1000] bg-card border-t rounded-t-2xl shadow-lg max-h-[50vh] overflow-y-auto translate-y-full transition-transform duration-300 lg:hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Masakan di Sekitar
            </h2>
            {daftarMasakan && (
              <Badge variant="secondary">{daftarMasakan.length}</Badge>
            )}
          </div>
          {isLoadingMasakan && (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          )}
          {daftarMasakan && daftarMasakan.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tidak ada masakan ditemukan.
            </p>
          )}
          <div className="space-y-3">
            {daftarMasakan?.map((m) => (
              <KartuMasakanMini key={m.id} masakan={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
