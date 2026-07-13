import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DataMasakan } from "@/types/masakan";

interface MasakanListResponse {
  data: DataMasakan[];
}

interface MasakanDetailResponse {
  data: DataMasakan;
}

// interface BuatMasakanPayload {
//   nama: string;
//   deskripsi: string;
//   harga: number;
//   porsi: number;
//   kategori: string;
//   lintang: number;
//   bujur: number;
//   alamat: string;
//   batasWaktu: string;
// }

// interface UpdateMasakanPayload extends Partial<BuatMasakanPayload> {}

interface RadiusQueryParams {
  lintang: number;
  bujur: number;
  radius: number;
  kategori?: string;
  status?: string;
}

// Ambil daftar masakan milik user login
export function useMasakanSaya() {
  return useQuery({
    queryKey: ["masakan", "saya"],
    queryFn: () => api.get<MasakanListResponse>("/api/masakan"),
    select: (res) => res.data,
  });
}

// Cari masakan dalam radius tertentu
export function useMasakanRadius(params: RadiusQueryParams | null) {
  return useQuery({
    queryKey: ["masakan", "radius", params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        lintang: String(params!.lintang),
        bujur: String(params!.bujur),
        radius: String(params!.radius),
      });
      if (params!.kategori) searchParams.set("kategori", params!.kategori);
      if (params!.status) searchParams.set("status", params!.status);
      return api.get<MasakanListResponse>(
        `/api/masakan/radius?${searchParams.toString()}`,
      );
    },
    select: (res) => res.data,
    enabled: params !== null,
  });
}

// Detail satu masakan
export function useMasakanDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["masakan", id],
    queryFn: () => api.get<MasakanDetailResponse>(`/api/masakan/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// Buat masakan baru
export function useBuatMasakan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) =>
      api.post<MasakanDetailResponse>("/api/masakan", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masakan"] });
    },
  });
}

// Update masakan
export function useUpdateMasakan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData }) =>
      api.put<MasakanDetailResponse>(`/api/masakan/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masakan"] });
    },
  });
}

// Hapus masakan
export function useHapusMasakan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ message: string }>(`/api/masakan/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masakan"] });
    },
  });
}
