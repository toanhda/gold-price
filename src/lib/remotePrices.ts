import {
  type GoldRow,
  normalizeRowsFromUnknown,
} from './pricesStorage'

export function isRemoteConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
}

/** Đọc giá từ Supabase (RLS: mọi người được SELECT) */
export async function fetchRemoteRows(): Promise<GoldRow[] | null> {
  if (!isRemoteConfigured()) return null
  const base = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  try {
    const res = await fetch(
      `${base}/rest/v1/prices?id=eq.1&select=payload`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { payload?: unknown }[]
    const payload = data[0]?.payload
    return normalizeRowsFromUnknown(payload)
  } catch {
    return null
  }
}
