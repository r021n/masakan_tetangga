import { useMapStore } from "@/stores/mapStore";
import { Slider } from "@/components/ui/slider";

const NILAI_RADIUS = [500, 1000, 2000, 3000, 5000, 10000, 20000, 50000];

function formatRadius(r: number) {
  if (r >= 1000) return `${r / 1000} km`;
  return `${r} m`;
}

export default function RadiusControl() {
  const radius = useMapStore((s) => s.radius);
  const setRadius = useMapStore((s) => s.setRadius);

  const indeksSekarang = NILAI_RADIUS.indexOf(radius);
  const indeksSlider = indeksSekarang >= 0 ? indeksSekarang : 4;

  const handleChange = (nilai: number[]) => {
    setRadius(NILAI_RADIUS[nilai[0]]);
  };

  return (
    <div className="bg-card border rounded-lg shadow-lg p-4 w-full max-w-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Radius Pencarian</span>
        <span className="text-sm font-bold">{formatRadius(radius)}</span>
      </div>
      <Slider
        value={[indeksSlider]}
        min={0}
        max={NILAI_RADIUS.length - 1}
        step={1}
        onValueChange={handleChange}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        {NILAI_RADIUS.map((r) => (
          <span key={r}>{formatRadius(r)}</span>
        ))}
      </div>
    </div>
  );
}
