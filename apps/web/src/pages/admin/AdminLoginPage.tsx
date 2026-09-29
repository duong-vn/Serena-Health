import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { SystemLogo } from '../../components/brand/SystemLogo'
import './AdminPages.css'

export function AdminLoginPage() {
  const { user, loading, login, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <main className="admin-auth-state" role="status">Đang xác thực phiên đăng nhập...</main>
  if (user?.role === 'MANAGER') return <Navigate to="/admin/settings" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const signedIn = await login(email.trim(), password)
      if (signedIn.role !== 'MANAGER') {
        logout()
        setError('Tài khoản này không có quyền quản trị.')
        return
      }
      navigate('/admin/settings', { replace: true })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Không thể đăng nhập. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="admin-login-page">
    <div className="admin-login-card">
      <div className="admin-brand"><SystemLogo /><span>Serene Health</span></div>
      <p className="admin-eyebrow">QUẢN TRỊ HỆ THỐNG</p>
      <h1>Đăng nhập quản trị</h1>
      <p className="admin-muted">Đăng nhập để quản lý cấu hình chatbot.</p>
      <form onSubmit={submit}>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="admin-password">Mật khẩu</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="admin-primary-button" type="submit" disabled={submitting}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
      </form>
      <Link className="admin-text-link" to="/login">Về đăng nhập thông thường</Link>
    </div>
  </main>
}
