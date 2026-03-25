import { useContext } from 'react'
import {
  GoldPricesContext,
  type GoldPricesContextValue,
} from '../context/GoldPricesContext'

export function useGoldPrices(): GoldPricesContextValue {
  const ctx = useContext(GoldPricesContext)
  if (!ctx) {
    throw new Error('useGoldPrices must be used within GoldPricesProvider')
  }
  return ctx
}
