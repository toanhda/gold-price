export type GoldRow = {
  id: string
  label: string
  buy: number
  sell: number
}

export const STORAGE_KEY = 'gold-price-board-v1'

export const DEFAULT_ROWS: GoldRow[] = [
  { id: '24k', label: 'VÀNG 24K', buy: 15500, sell: 15900 },
  { id: '23k', label: 'VÀNG 23K', buy: 15400, sell: 15850 },
  { id: '610', label: 'VÀNG 610', buy: 9000, sell: 10000 },
  { id: '10k', label: 'VÀNG 10K', buy: 6100, sell: 7100 },
  { id: 'silver', label: 'BẠC', buy: 130, sell: 230 },
]

function isGoldRow(x: unknown): x is GoldRow {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.label === 'string' &&
    typeof o.buy === 'number' &&
    typeof o.sell === 'number' &&
    Number.isFinite(o.buy) &&
    Number.isFinite(o.sell)
  )
}

export function loadRows(): GoldRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_ROWS]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_ROWS.length) {
      return [...DEFAULT_ROWS]
    }
    const rows: GoldRow[] = []
    for (let i = 0; i < DEFAULT_ROWS.length; i++) {
      const d = DEFAULT_ROWS[i]
      const item = parsed[i]
      if (!isGoldRow(item) || item.id !== d.id) {
        return [...DEFAULT_ROWS]
      }
      rows.push({
        ...d,
        label: d.label,
        buy: item.buy,
        sell: item.sell,
      })
    }
    return rows
  } catch {
    return [...DEFAULT_ROWS]
  }
}

export function saveRows(rows: GoldRow[]): void {
  const payload = rows.map((r) => ({
    id: r.id,
    label: r.label,
    buy: r.buy,
    sell: r.sell,
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
