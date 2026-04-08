import { useEffect, useRef, useState } from 'react'
import {
  fetchGiaVangSpotGoldEntryHtml,
  GIAVANG_SPOT_GOLD_URL,
} from '../lib/giavangWp'

function injectHtmlAndRunScripts(container: HTMLElement, html: string) {
  container.innerHTML = html
  container.querySelectorAll('script').forEach((oldScript) => {
    const next = document.createElement('script')
    for (const attr of oldScript.attributes) {
      next.setAttribute(attr.name, attr.value)
    }
    next.textContent = oldScript.textContent
    oldScript.replaceWith(next)
  })
}

/**
 * Toàn bộ HTML trong `penci-entry-content entry-content` của trang Spot gold GiaVang
 * (lấy qua `GET /wp-json/wp/v2/pages?slug=...` → `content.rendered`).
 */
export function GiaVangEntryContent() {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setStatus('loading')
      setErrorMsg(null)
      try {
        const raw = await fetchGiaVangSpotGoldEntryHtml()
        if (cancelled) return
        setHtml(raw)
        setStatus('ok')
      } catch (e) {
        if (cancelled) return
        setErrorMsg(e instanceof Error ? e.message : 'Lỗi tải')
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!html) return
    const el = ref.current
    if (!el) return
    injectHtmlAndRunScripts(el, html)
    return () => {
      el.innerHTML = ''
    }
  }, [html])

  return (
    <div className="gold-board__giavang-wrap">
      {status === 'loading' && (
        <p className="gold-board__giavang-status">Đang tải nội dung từ GiaVang.Net…</p>
      )}
      {status === 'error' && (
        <p className="gold-board__giavang-status gold-board__giavang-status--error">
          <span>{errorMsg ?? 'Không tải được nội dung.'}</span>{' '}
          <a href={GIAVANG_SPOT_GOLD_URL} target="_blank" rel="noopener noreferrer">
            Mở trên GiaVang.Net
          </a>
        </p>
      )}
      {html && (
        <div
          ref={ref}
          className="penci-entry-content entry-content gold-board__giavang-entry"
        />
      )}
    </div>
  )
}
