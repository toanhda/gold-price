import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PriceTrendArrow } from '../components/PriceTrendArrow'
import { TradingViewSpotGoldChart } from '../components/TradingViewSpotGoldChart'
import { useGoldPrices } from '../hooks/useGoldPrices'

/** Trang bài viết GiaVang (cùng biểu đồ Spot gold — widget TradingView) */
const CHART_SOURCE_PAGE =
  'https://giavang.net/bieu-do-gia-vang-the-gioi-spot-gold/'

function formatNowVi(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return `${time} Ngày ${d.getDate()} Tháng ${d.getMonth() + 1} Năm ${d.getFullYear()}`
}

/** Giá lưu là VNĐ/chỉ (đủ đồng) */
function formatPriceVnd(n: number): string {
  return Math.round(n).toLocaleString('vi-VN')
}

export function GoldBoardPage() {
  const { rows, remoteReady } = useGoldPrices()
  const [now, setNow] = useState(formatNowVi)
  const [isFs, setIsFs] = useState(!!document.fullscreenElement)
  useEffect(() => {
    const t = setInterval(() => setNow(formatNowVi()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.()
    } else {
      void document.exitFullscreen?.()
    }
  }

  if (!remoteReady) {
    return (
      <div className="gold-board gold-board--loading">
        <p className="gold-board__loading-text">Đang tải giá…</p>
      </div>
    )
  }

  return (
    <div className="gold-board">
      <button
        type="button"
        className="gold-board__fs"
        onClick={toggleFullscreen}
        title={isFs ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        aria-label={isFs ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
      >
        {isFs ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
        )}
      </button>

      <Link className="gold-board__admin-link" to="/admin">
        <span className="gold-board__admin-icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </span>
        Quản trị
      </Link>

      <header className="gold-board__header">
        <div className="gold-board__header-accent" aria-hidden />
        <h1 className="gold-board__title">
          <span className="gold-board__title-prefix">Doanh nghiệp</span>
          <span className="gold-board__title-name">VÀNG BẠC KIM PHÁT</span>
        </h1>
        <p className="gold-board__subtitle">KÍNH CHÀO QUÝ KHÁCH</p>
      </header>

      <div className="gold-board__body">
        <div className="gold-board__table-wrap">
          <div className="gold-board__panel gold-board__panel--table">
            <table className="gold-table">
            <thead>
              <tr>
                <th>LOẠI VÀNG</th>
                <th>GIÁ MUA</th>
                <th>GIÁ BÁN</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="gold-table__label">{r.label}</td>
                  <td className="gold-table__num">
                    {formatPriceVnd(r.buy)}
                  </td>
                  <td className="gold-table__num">
                    {formatPriceVnd(r.sell)}
                  </td>
                  <td className="gold-table__trend-cell">
                    <PriceTrendArrow trend={r.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
            <p className="gold-board__unit-note">Đơn vị: VNĐ/chỉ</p>
          </div>
        </div>

        <aside className="gold-board__aside">
          <div className="gold-board__clock-card">
            <span className="gold-board__clock-label">Thời gian</span>
            <div className="gold-board__clock">{now}</div>
          </div>
          <div className="gold-board__chart gold-board__panel gold-board__panel--chart">
            <div className="gold-board__chart-head">
              Biểu đồ giá vàng thế giới — Spot gold
            </div>
            <div className="gold-board__chart-frame">
              <TradingViewSpotGoldChart />
            </div>
            <div className="gold-board__chart-foot">
              <p className="gold-board__chart-foot-text">
                Cùng widget TradingView (XAUUSD) như{' '}
                <a
                  href={CHART_SOURCE_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GiaVang.Net
                </a>
                .
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="gold-board__footer">
        <div className="gold-board__footer-inner">
          <p className="gold-board__footer-tag">
            Doanh nghiệp VÀNG BẠC KIM PHÁT <span className="gold-board__footer-dot">·</span> Uy tín{' '}
            <span className="gold-board__footer-dot">·</span> Chất lượng
          </p>
          <p className="gold-board__hotline">
            <span className="gold-board__hotline-label">Hotline</span>
            <span className="gold-board__hotline-num">0336.222.090</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
