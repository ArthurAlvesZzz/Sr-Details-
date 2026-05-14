export const safeText = (value: unknown): string => String(value ?? '');

export const normalizeText = (value: unknown): string =>
  safeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export function safeArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

export function safeIncludes<T>(value: T[] | string | undefined | null, search: T | string): boolean {
  if (Array.isArray(value)) return value.includes(search as T);
  if (typeof value === 'string') return value.includes(String(search));
  return false;
}

export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
