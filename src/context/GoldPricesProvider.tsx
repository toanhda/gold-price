import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { GoldPricesContext } from './GoldPricesContext'
import {
  type GoldRow,
  loadRows,
  saveRows,
  STORAGE_KEY,
} from '../lib/pricesStorage'
import { fetchRemoteRows, isRemoteConfigured } from '../lib/remotePrices'

export function GoldPricesProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<GoldRow[]>(() => loadRows())
  const [remoteReady, setRemoteReady] = useState(!isRemoteConfigured())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isRemoteConfigured()) {
        setRemoteReady(true)
        return
      }
      const remote = await fetchRemoteRows()
      if (cancelled) return
      if (remote) {
        saveRows(remote)
        setRows(remote)
      }
      setRemoteReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) {
        setRows(loadRows())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persist = useCallback(async (next: GoldRow[], opts?: { writeSecret?: string }) => {
    saveRows(next)
    setRows(next)
    if (!isRemoteConfigured()) return
    if (!opts?.writeSecret) return
    const res = await fetch('/api/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: opts.writeSecret, rows: next }),
    })
    if (!res.ok) {
      let msg = 'Lưu server thất bại'
      try {
        const j = (await res.json()) as { error?: string }
        if (j.error) msg = j.error
      } catch {
        /* ignore */
      }
      throw new Error(msg)
    }
  }, [])

  return (
    <GoldPricesContext.Provider value={{ rows, persist, remoteReady }}>
      {children}
    </GoldPricesContext.Provider>
  )
}
