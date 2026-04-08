import { useEffect, useRef } from 'react'

const TV_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

/**
 * Cấu hình trùng khối TradingView trên
 * https://giavang.net/bieu-do-gia-vang-the-gioi-spot-gold/
 * (symbol FOREXCOM:XAUUSD, múi giờ VN, v.v.)
 */
const TV_CONFIG = {
  autosize: true,
  symbol: 'FOREXCOM:XAUUSD',
  interval: '5',
  timezone: 'Asia/Ho_Chi_Minh',
  theme: 'dark',
  style: '1',
  locale: 'vi_VN',
  allow_symbol_change: true,
  save_image: false,
  details: true,
  hotlist: true,
  calendar: false,
  hide_volume: true,
  support_host: 'https://www.tradingview.com',
} as const

export function TradingViewSpotGoldChart() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'

    const copyright = document.createElement('div')
    copyright.className = 'tradingview-widget-copyright'
    copyright.innerHTML =
      '<a href="https://vn.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Theo dõi mọi thị trường trên TradingView</span></a>'

    const script = document.createElement('script')
    script.src = TV_SCRIPT
    script.type = 'text/javascript'
    script.async = true
    script.appendChild(
      document.createTextNode(JSON.stringify(TV_CONFIG)),
    )

    container.appendChild(widget)
    container.appendChild(copyright)
    container.appendChild(script)
    root.appendChild(container)

    return () => {
      root.removeChild(container)
    }
  }, [])

  return <div ref={ref} className="gold-board__chart-tv-root" />
}
