import { create } from "zustand";

interface LokasiState {
  lintang: number;
  bujur: number;
}

interface MapState {
  lokasiPengguna: LokasiState | null;
  radius: number;
  pusatPeta: LokasiState;
  sedangMencariLokasi: boolean;

  setLokasiPengguna: (lokasi: LokasiState) => void;
  setRadius: (radius: number) => void;
  setPusatPeta: (lokasi: LokasiState) => void;
  setSedangMencariLokasi: (loading: boolean) => void;
}

const PUSAT_DEFAULT = { lintang: -6.2088, bujur: 106.8456 };

export const useMapStore = create<MapState>((set) => ({
  lokasiPengguna: null,
  radius: 5000,
  pusatPeta: PUSAT_DEFAULT,
  sedangMencariLokasi: false,

  setLokasiPengguna: (lokasi) =>
    set({ lokasiPengguna: lokasi, pusatPeta: lokasi }),
  setRadius: (radius) => set({ radius }),
  setPusatPeta: (lokasi) => set({ pusatPeta: lokasi }),
  setSedangMencariLokasi: (loading) => set({ sedangMencariLokasi: loading }),
}));
