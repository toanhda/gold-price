import type { PriceTrend } from '../lib/pricesStorage'

type Props = {
  trend: PriceTrend
}

/** Mũi tên dày, xanh tăng / đỏ giảm — hiển thị TV */
export function PriceTrendArrow({ trend }: Props) {
  if (trend === 'up') {
    return (
      <span className="gold-table__trend-wrap" title="Tăng">
        <svg
          className="gold-table__trend gold-table__trend--up"
          viewBox="0 0 48 48"
          aria-hidden
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M24 6L44 32H30v10H18V32H4L24 6z"
          />
        </svg>
      </span>
    )
  }
  return (
    <span className="gold-table__trend-wrap" title="Giảm">
      <svg
        className="gold-table__trend gold-table__trend--down"
        viewBox="0 0 48 48"
        aria-hidden
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M24 42L4 16h14V6h12v10h14L24 42z"
        />
      </svg>
    </span>
  )
}
