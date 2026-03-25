import { createContext } from 'react'
import type { GoldRow } from '../lib/pricesStorage'

export type GoldPricesContextValue = {
  rows: GoldRow[]
  persist: (rows: GoldRow[]) => void
}

export const GoldPricesContext = createContext<GoldPricesContextValue | null>(
  null,
)
