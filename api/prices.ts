import type { VercelRequest, VercelResponse } from '@vercel/node'

const ROW_IDS = ['24k', '23k', '610', '10k', 'silver'] as const
const ROW_LABELS: Record<(typeof ROW_IDS)[number], string> = {
  '24k': 'VÀNG 24K',
  '23k': 'VÀNG 23K',
  '610': 'VÀNG 610',
  '10k': 'VÀNG 10K',
  silver: 'BẠC',
}

type PriceTrend = 'up' | 'down' | 'flat'

type GoldRow = {
  id: string
  label: string
  buy: number
  sell: number
  trend: PriceTrend
}

function normalizeTrend(v: unknown): PriceTrend {
  if (v === 'up') return 'up'
  if (v === 'flat') return 'flat'
  return 'down'
}

function normalizeRowsFromBody(rows: unknown): GoldRow[] | null {
  if (!Array.isArray(rows) || rows.length !== ROW_IDS.length) return null
  const out: GoldRow[] = []
  for (let i = 0; i < ROW_IDS.length; i++) {
    const id = ROW_IDS[i]
    const item = rows[i]
    if (!item || typeof item !== 'object') return null
    const o = item as Record<string, unknown>
    if (o.id !== id) return null
    if (typeof o.buy !== 'number' || typeof o.sell !== 'number') return null
    if (!Number.isFinite(o.buy) || !Number.isFinite(o.sell)) return null
    if (
      o.trend !== undefined &&
      o.trend !== 'up' &&
      o.trend !== 'down' &&
      o.trend !== 'flat'
    ) {
      return null
    }
    out.push({
      id,
      label: ROW_LABELS[id],
      buy: Math.max(0, Math.round(o.buy)),
      sell: Math.max(0, Math.round(o.sell)),
      trend: normalizeTrend(o.trend),
    })
  }
  return out
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminSecret = process.env.ADMIN_SECRET

  if (!supabaseUrl || !serviceKey || !adminSecret) {
    return res.status(503).json({ error: 'Server not configured' })
  }

  let body: { secret?: string; rows?: unknown }
  try {
    body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (body.secret !== adminSecret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const normalized = normalizeRowsFromBody(body.rows)
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid rows' })
  }

  /** Upsert: tạo dòng id=1 nếu chưa có — không cần chạy INSERT trong SQL trước */
  const upsert = await fetch(`${supabaseUrl}/rest/v1/prices`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 1,
      payload: normalized,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!upsert.ok) {
    const text = await upsert.text()
    return res.status(500).json({ error: text || 'Database error' })
  }

  return res.status(200).json({ ok: true })
}
