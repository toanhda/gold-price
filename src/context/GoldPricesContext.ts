import { createContext } from 'react'
import type { GoldRow } from '../lib/pricesStorage'

export type PersistOptions = {
  /** Mật khẩu admin — cần khi lưu lên Supabase qua Vercel API */
  writeSecret?: string
}

export type GoldPricesContextValue = {
  rows: GoldRow[]
  persist: (rows: GoldRow[], opts?: PersistOptions) => Promise<void>
  remoteReady: boolean
}

export const GoldPricesContext = createContext<GoldPricesContextValue | null>(
  null,
)
