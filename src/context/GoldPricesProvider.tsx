import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { GoldPricesContext } from './GoldPricesContext'
import {
  type GoldRow,
  loadRows,
  saveRows,
  STORAGE_KEY,
} from '../lib/pricesStorage'

export function GoldPricesProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState(() => loadRows())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) {
        setRows(loadRows())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback((next: GoldRow[]) => {
    saveRows(next)
    setRows(next)
  }, [])

  return (
    <GoldPricesContext.Provider value={{ rows, persist }}>
      {children}
    </GoldPricesContext.Provider>
  )
}
