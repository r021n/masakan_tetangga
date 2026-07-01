export function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0]; // ambil elemen pertama jika array
  }
  if (typeof value === "string") {
    return value;
  }
  throw new Error(`Parameter "${key}" tidak ditemukan`);
}
