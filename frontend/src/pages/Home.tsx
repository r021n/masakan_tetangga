import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Masakan Tetangga</h1>
      <p className="max-w-md text-muted-foreground">
        Platform berbagi masakan rumahan berbasis lokasi. Temukan masakan lezat
        dari tetanggamu atau bagikan masakanmu sendiri.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/register">Daftar Sekarang</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/login">Masuk</Link>
        </Button>
      </div>
    </div>
  );
}
