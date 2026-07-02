import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  KATEGORI_LABEL,
  STATUS_LABEL,
  type DataMasakan,
} from "@/types/masakan";
import { useNavigate } from "react-router";

interface MasakanMarkerProps {
  masakan: DataMasakan;
}

function KontenPopup({ masakan }: { masakan: DataMasakan }) {
  const navigate = useNavigate();
  const peta = useMap();

  return (
    <div className="w-56 space-y-2">
      <h3 className="font-semibold text-sm">{masakan.nama}</h3>
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-xs">
          {KATEGORI_LABEL[masakan.kategori]}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Rp {masakan.harga.toLocaleString("id-ID")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {STATUS_LABEL[masakan.status]}
        </Badge>
      </div>
      {masakan.jarak !== undefined && (
        <p className="text-xs text-muted-foreground">
          Jarak: {(masakan.jarak / 1000).toFixed(1)} km
        </p>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {masakan.deskripsi}
      </p>
      <div className="flex gap-2 pt-1">
        <Button size="xs" onClick={() => navigate(`/masakan/${masakan.id}`)}>
          Detail
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => peta.flyTo([masakan.lokasi.x, masakan.lokasi.y], 16)}
        >
          Lihat di Peta
        </Button>
      </div>
    </div>
  );
}

export default function MasakanMarker({ masakan }: MasakanMarkerProps) {
  const [markerSiap, setMarkerSiap] = useState(false);
  const idUnik = useMemo(
    () => `marker-${masakan.id}-${crypto.randomUUID().slice(0, 8)}`,
    [masakan.id],
  );

  const ikon = useMemo(() => {
    const warna =
      masakan.status === "tersedia"
        ? "#22c55e"
        : masakan.status === "dipesan"
          ? "#f59e0b"
          : "#6b7280";

    return L.divIcon({
      className: "custom-marker",
      html: `<div id="${idUnik}" style="
        width: 32px; height: 32px;
        background: ${warna};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -36],
    });
  }, [masakan.status, idUnik]);

  return (
    <>
      <Marker
        position={[masakan.lokasi.x, masakan.lokasi.y]}
        icon={ikon}
        eventHandlers={{
          add: () => setMarkerSiap(true),
          remove: () => setMarkerSiap(false),
        }}
      >
        <Popup maxWidth={280} minWidth={240} closeButton>
          <KontenPopup masakan={masakan} />
        </Popup>
      </Marker>
      {markerSiap &&
        createPortal(
          <div
            style={{
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(45deg)",
              color: "white",
              fontSize: 10,
              fontWeight: "bold",
            }}
          >
            Rp
          </div>,
          document.getElementById(idUnik)!,
        )}
    </>
  );
}
