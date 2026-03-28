export type PriceTrend = 'up' | 'down'

export type GoldRow = {
  id: string
  label: string
  buy: number
  sell: number
  trend: PriceTrend
}

/** Giá lưu theo VNĐ đầy đủ / chỉ */
export const STORAGE_KEY = 'gold-price-board-v2'
const LEGACY_STORAGE_KEY = 'gold-price-board-v1'

export const DEFAULT_ROWS: GoldRow[] = [
  { id: '24k', label: 'VÀNG 24K', buy: 15_500_000, sell: 15_900_000, trend: 'down' },
  { id: '23k', label: 'VÀNG 23K', buy: 15_400_000, sell: 15_850_000, trend: 'down' },
  { id: '610', label: 'VÀNG 610', buy: 9_000_000, sell: 10_000_000, trend: 'down' },
  { id: '10k', label: 'VÀNG 10K', buy: 6_100_000, sell: 7_100_000, trend: 'down' },
  { id: 'silver', label: 'BẠC', buy: 130_000, sell: 230_000, trend: 'down' },
]

function normalizeTrend(v: unknown): PriceTrend {
  return v === 'up' ? 'up' : 'down'
}

function isGoldRow(x: unknown): x is GoldRow {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    typeof o.label !== 'string' ||
    typeof o.buy !== 'number' ||
    typeof o.sell !== 'number' ||
    !Number.isFinite(o.buy) ||
    !Number.isFinite(o.sell)
  ) {
    return false
  }
  if (
    o.trend !== undefined &&
    o.trend !== 'up' &&
    o.trend !== 'down'
  ) {
    return false
  }
  return true
}

function parseRowsFromJson(
  parsed: unknown,
  legacyThousands: boolean,
): GoldRow[] | null {
  if (!Array.isArray(parsed) || parsed.length !== DEFAULT_ROWS.length) {
    return null
  }
  const rows: GoldRow[] = []
  const mult = legacyThousands ? 1000 : 1
  for (let i = 0; i < DEFAULT_ROWS.length; i++) {
    const d = DEFAULT_ROWS[i]
    const item = parsed[i]
    if (!isGoldRow(item) || item.id !== d.id) {
      return null
    }
    rows.push({
      ...d,
      label: d.label,
      buy: Math.max(0, Math.round(item.buy * mult)),
      sell: Math.max(0, Math.round(item.sell * mult)),
      trend: normalizeTrend(item.trend),
    })
  }
  return rows
}

export function loadRows(): GoldRow[] {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY)
    if (v2) {
      const parsed = JSON.parse(v2) as unknown
      const rows = parseRowsFromJson(parsed, false)
      if (rows) return rows
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown
      const rows = parseRowsFromJson(parsed, true)
      if (rows) {
        saveRows(rows)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        return rows
      }
    }
  } catch {
    /* fall through */
  }
  return [...DEFAULT_ROWS]
}

export function saveRows(rows: GoldRow[]): void {
  const payload = rows.map((r) => ({
    id: r.id,
    label: r.label,
    buy: r.buy,
    sell: r.sell,
    trend: r.trend,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/** Dùng cho API / Supabase: chuẩn hóa mảng JSON thành GoldRow[] */
export function normalizeRowsFromUnknown(rows: unknown): GoldRow[] | null {
  if (!Array.isArray(rows) || rows.length !== DEFAULT_ROWS.length) {
    return null
  }
  const out: GoldRow[] = []
  for (let i = 0; i < DEFAULT_ROWS.length; i++) {
    const d = DEFAULT_ROWS[i]
    const item = rows[i]
    if (!isGoldRow(item) || item.id !== d.id) {
      return null
    }
    out.push({
      ...d,
      label: d.label,
      buy: Math.max(0, Math.round(item.buy)),
      sell: Math.max(0, Math.round(item.sell)),
      trend: normalizeTrend(item.trend),
    })
  }
  return out
}
