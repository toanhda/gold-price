import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoldPrices } from '../hooks/useGoldPrices'
import { isRemoteConfigured } from '../lib/remotePrices'
import type { GoldRow, PriceTrend } from '../lib/pricesStorage'

const AUTH_KEY = 'gold-admin-auth'
/** Lưu session để sau F5 vẫn gọi được API lưu giá (chỉ tab hiện tại) */
const WRITE_KEY = 'gold-admin-write-secret'
const USER = 'admin'
const PASS = '123456'

function cloneRows(rows: GoldRow[]): GoldRow[] {
  return rows.map((r) => ({ ...r }))
}

export function AdminPage() {
  const { rows, persist } = useGoldPrices()
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === '1',
  )
  const [writeSecret, setWriteSecret] = useState<string | null>(() =>
    sessionStorage.getItem(AUTH_KEY) === '1'
      ? sessionStorage.getItem(WRITE_KEY)
      : null,
  )
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [draft, setDraft] = useState<GoldRow[]>(() => cloneRows(rows))
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (user === USER && pass === PASS) {
      sessionStorage.setItem(AUTH_KEY, '1')
      sessionStorage.setItem(WRITE_KEY, pass)
      setWriteSecret(pass)
      setAuthed(true)
      setDraft(cloneRows(rows))
      setPass('')
    } else {
      setLoginError('Sai tên đăng nhập hoặc mật khẩu.')
    }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    sessionStorage.removeItem(WRITE_KEY)
    setWriteSecret(null)
    setAuthed(false)
    setUser('')
    setPass('')
  }

  const updateCell = (
    index: number,
    field: 'buy' | 'sell',
    raw: string,
  ) => {
    const n = raw === '' ? NaN : Number(raw)
    setDraft((prev) => {
      const next = cloneRows(prev)
      const row = next[index]
      if (!row) return prev
      const val = !Number.isFinite(n) ? 0 : Math.max(0, Math.round(n))
      next[index] =
        field === 'buy' ? { ...row, buy: val } : { ...row, sell: val }
      return next
    })
    setSaved(false)
  }

  const updateTrend = (index: number, trend: PriceTrend) => {
    setDraft((prev) => {
      const next = cloneRows(prev)
      const row = next[index]
      if (!row) return prev
      next[index] = { ...row, trend }
      return next
    })
    setSaved(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError('')
    try {
      await persist(cloneRows(draft), {
        writeSecret: writeSecret ?? undefined,
      })
      setSaved(true)
    } catch (err) {
      setSaved(false)
      setSaveError(err instanceof Error ? err.message : 'Không lưu được.')
    }
  }

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-page__card">
          <p className="admin-page__eyebrow">Doanh nghiệp Vàng Bạc Kim Phát</p>
          <h1 className="admin-page__h1">Đăng nhập quản trị</h1>
          <form onSubmit={login} className="admin-page__form">
            <label className="admin-page__field">
              Tên đăng nhập
              <input
                type="text"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </label>
            <label className="admin-page__field">
              Mật khẩu
              <input
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </label>
            {loginError ? (
              <p className="admin-page__error" role="alert">
                {loginError}
              </p>
            ) : null}
            <button type="submit" className="admin-page__btn">
              Đăng nhập
            </button>
          </form>
          <p className="admin-page__back">
            <Link to="/">← Về bảng giá</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-page__card admin-page__card--wide">
        <div className="admin-page__toolbar">
          <h1 className="admin-page__h1">Cập nhật giá</h1>
          <button type="button" className="admin-page__btn ghost" onClick={logout}>
            Đăng xuất
          </button>
        </div>
        <p className="admin-page__hint">
          Nhập giá đủ <strong>VNĐ/chỉ</strong> (ví dụ 15.500.000 — có thể gõ
          không dấu chấm).
          {isRemoteConfigured() ? (
            <>
              {' '}
              <strong>Đồng bộ cloud đang bật:</strong> Lưu sẽ cập nhật giá cho
              mọi người xem site.
            </>
          ) : null}
        </p>
        <form onSubmit={save}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>
                  Giá mua <span className="admin-table__unit">(VNĐ/chỉ)</span>
                </th>
                <th>
                  Giá bán <span className="admin-table__unit">(VNĐ/chỉ)</span>
                </th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((r, i) => (
                <tr key={r.id}>
                  <td>{r.label}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="admin-table__input"
                      value={r.buy}
                      onChange={(e) => updateCell(i, 'buy', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="admin-table__input"
                      value={r.sell}
                      onChange={(e) => updateCell(i, 'sell', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-table__select"
                      value={r.trend}
                      onChange={(e) =>
                        updateTrend(i, e.target.value as PriceTrend)
                      }
                      aria-label={`Trạng thái ${r.label}`}
                    >
                      <option value="down">Giảm</option>
                      <option value="flat">Đứng giá</option>
                      <option value="up">Tăng</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-page__actions">
            <button type="submit" className="admin-page__btn">
              Lưu giá
            </button>
            {saveError ? (
              <span className="admin-page__error" role="alert">
                {saveError}
              </span>
            ) : null}
            {saved ? (
              <span className="admin-page__ok">Đã lưu.</span>
            ) : null}
            <Link className="admin-page__view" to="/">
              Xem màn hình chính →
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
