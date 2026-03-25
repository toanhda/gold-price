import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoldPrices } from '../hooks/useGoldPrices'
import type { GoldRow } from '../lib/pricesStorage'

const AUTH_KEY = 'gold-admin-auth'
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
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [draft, setDraft] = useState<GoldRow[]>(() => cloneRows(rows))
  const [saved, setSaved] = useState(false)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (user === USER && pass === PASS) {
      sessionStorage.setItem(AUTH_KEY, '1')
      setAuthed(true)
      setDraft(cloneRows(rows))
      setPass('')
    } else {
      setLoginError('Sai tên đăng nhập hoặc mật khẩu.')
    }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
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

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    persist(cloneRows(draft))
    setSaved(true)
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
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-page__actions">
            <button type="submit" className="admin-page__btn">
              Lưu giá
            </button>
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
