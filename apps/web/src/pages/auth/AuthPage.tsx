import { useState, type FormEvent } from 'react'

import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { SystemLogo } from '../../components/brand/SystemLogo'
import './AuthPage.css'

type AuthMode = 'login' | 'forgot' | 'signup'

interface LoginForm {
  email: string
  password: string
}

interface SignupForm {
  email: string
  phone: string
  fullName: string
  gender: string
  birthday: string
  password: string
  confirmPassword: string
}

type FormErrors<T extends string> = Partial<Record<T, string>>

const initialLoginForm: LoginForm = { email: '', password: '' }
const initialSignupForm: SignupForm = {
  birthday: '',
  confirmPassword: '',
  email: '',
  fullName: '',
  gender: '',
  password: '',
  phone: '',
}

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function phoneLooksValid(phone: string) {
  return /^0[35789]\d{8}$/.test(phone.trim())
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="auth-field-error" role="alert">{message}</p> : null
}

interface TextFieldProps {
  id: string
  label: string
  value: string
  placeholder: string
  type?: string
  error?: string
  compact?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  onChange: (value: string) => void
}

function TextField({ id, label, value, placeholder, type = 'text', error, compact, autoComplete, inputMode, onChange }: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className={compact ? 'auth-field auth-field-compact' : 'auth-field'}>
      <label htmlFor={id}>{label}</label>
      <div className={isPassword ? 'auth-password-input' : undefined}>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={error ? 'is-invalid' : ''}
        id={id}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={isPassword && showPassword ? 'text' : type}
        value={value}
      />
      {isPassword && (
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={`${showPassword ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
          aria-controls={id}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {showPassword && <path d="m3 3 18 18" />}
          </svg>
        </button>
      )}
      </div>
      {error ? <p className="auth-field-error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  )
}

function BrandIllustration() {
  return (
    <section className="auth-brand-panel" aria-label="Serene Health">
      <div className="auth-wordmark"><SystemLogo className="auth-brand-logo" /><span>serene<span className="auth-wordmark-light"> health</span></span></div>
      <div className="auth-brand-story">
        <h1>Một khởi đầu<br />nhẹ nhàng cho<br /><em>sức khỏe của bạn.</em></h1>
        <p>Trợ lý y tế thông minh, đồng hành cùng bạn<br className="auth-desktop-break" /> trên hành trình chăm sóc sức khỏe.</p>
      </div>
      <div className="auth-garden" aria-hidden="true">
        <div className="auth-garden-orbit" />
        <div className="auth-garden-sun" />
        <div className="auth-garden-arch">
          <div className="auth-plant">
            <span className="auth-leaf auth-leaf-one" /><span className="auth-leaf auth-leaf-two" />
            <span className="auth-leaf auth-leaf-three" /><span className="auth-leaf auth-leaf-four" />
            <span className="auth-leaf auth-leaf-five" /><span className="auth-leaf auth-leaf-six" />
          </div>
        </div>
        <div className="auth-garden-ground" />
      </div>
      <div className="auth-brand-footer"><span>Chăm sóc sức khỏe, theo cách của bạn.</span><span aria-hidden="true">Serene Health</span></div>
    </section>
  )
}

function AuthHeader({ mode }: { mode: AuthMode }) {
  const title = mode === 'login' ? 'Chào mừng trở lại' : mode === 'signup' ? 'Bắt đầu hành trình của bạn' : 'Bạn cần hỗ trợ?'
  const description = mode === 'login' ? 'Đăng nhập để tiếp tục chăm sóc sức khỏe của bạn.' : mode === 'signup' ? 'Tạo tài khoản bệnh nhân để sử dụng dịch vụ.' : 'Chúng tôi sẽ hướng dẫn bạn bước tiếp theo.'
  return (
    <header className="auth-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  )
}

function apiMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'
}

export function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm)
  const [signupForm, setSignupForm] = useState<SignupForm>(initialSignupForm)
  const [loginErrors, setLoginErrors] = useState<FormErrors<keyof LoginForm>>({})
  const [signupErrors, setSignupErrors] = useState<FormErrors<keyof SignupForm>>({})
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function showMode(nextMode: AuthMode) {
    setMode(nextMode)
    setStatus('')
    setLoginErrors({})
    setSignupErrors({})
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = loginForm.email.trim()
    const errors: FormErrors<keyof LoginForm> = {}
    if (!email) errors.email = 'Vui lòng nhập email.'
    else if (!emailLooksValid(email)) errors.email = 'Email không đúng định dạng.'
    if (!loginForm.password) errors.password = 'Vui lòng nhập mật khẩu.'
    if (Object.keys(errors).length) {
      setLoginErrors(errors)
      return
    }

    setSubmitting(true)
    setStatus('')
    try {
      await login(email, loginForm.password)
    } catch (error) {
      setStatus(apiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = signupForm.email.trim()
    const phone = signupForm.phone.trim()
    const fullName = signupForm.fullName.trim()
    const errors: FormErrors<keyof SignupForm> = {}
    if (!email) errors.email = 'Vui lòng nhập email.'
    else if (!emailLooksValid(email)) errors.email = 'Email không đúng định dạng.'
    if (phone && !phoneLooksValid(phone)) errors.phone = 'Số điện thoại phải đủ 10 số.'
    if (!fullName) errors.fullName = 'Vui lòng nhập họ và tên.'
    else if (fullName.length < 2 || fullName.length > 160) errors.fullName = 'Họ và tên phải từ 2 đến 160 kí tự.'
    if (!signupForm.password) errors.password = 'Vui lòng nhập mật khẩu.'
    else if (signupForm.password.length < 10 || signupForm.password.length > 128 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(signupForm.password)) errors.password = 'Mật khẩu cần 10–128 kí tự, có chữ hoa, chữ thường và chữ số.'
    if (signupForm.confirmPassword !== signupForm.password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    if (Object.keys(errors).length) {
      setSignupErrors(errors)
      return
    }

    setSubmitting(true)
    setStatus('')
    try {
      await register({
        birthday: signupForm.birthday || undefined,
        email,
        fullName,
        gender: signupForm.gender || undefined,
        password: signupForm.password,
        phone: phone || undefined,
      })
    } catch (error) {
      setStatus(apiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  function renderLogin() {
    return (
      <form className="auth-modal-form auth-login-form" onSubmit={submitLogin} noValidate>
        {status ? <p className="auth-request-error" role="alert">{status}</p> : null}
        <TextField autoComplete="email" error={loginErrors.email} id="login-email" inputMode="email" label="Email" onChange={(email) => { setLoginForm((current) => ({ ...current, email })); setLoginErrors((current) => ({ ...current, email: undefined })) }} placeholder="email@example.com" type="email" value={loginForm.email} />
        <TextField autoComplete="current-password" error={loginErrors.password} id="login-password" label="Mật khẩu" onChange={(password) => { setLoginForm((current) => ({ ...current, password })); setLoginErrors((current) => ({ ...current, password: undefined })) }} placeholder="Nhập mật khẩu" type="password" value={loginForm.password} />
        <div className="auth-login-options" style={{ justifyContent: 'flex-end' }}>
          <button className="auth-link-button" onClick={() => showMode('forgot')} type="button">Quên mật khẩu?</button>
        </div>
        <button className="auth-primary-button" disabled={submitting} type="submit">{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        <div className="auth-divider" />
        <p className="auth-register-prompt"><span>Chưa có tài khoản bệnh nhân? </span><button className="auth-inline-link" onClick={() => showMode('signup')} type="button">Đăng ký ngay</button></p>
      </form>
    )
  }

  function renderForgot() {
    return (
      <div className="auth-modal-form auth-forgot-form">
        <button className="auth-back-button" onClick={() => showMode('login')} type="button"><span aria-hidden="true">‹</span>Quay lại trang đăng nhập</button>
        <h3>Khôi phục mật khẩu</h3>
        <div className="auth-unavailable-state" role="status">
          <p>Tính năng khôi phục mật khẩu chưa được hỗ trợ.</p>
          <p>Vui lòng liên hệ quản trị viên phòng khám để được xác minh và hỗ trợ an toàn.</p>
        </div>
      </div>
    )
  }

  function renderSignup() {
    const update = <Key extends keyof SignupForm>(field: Key, value: SignupForm[Key]) => {
      setSignupForm((current) => ({ ...current, [field]: value }))
      setSignupErrors((current) => ({ ...current, [field]: undefined }))
    }
    return (
      <form className="auth-modal-form auth-signup-form" onSubmit={submitSignup} noValidate>
        <button className="auth-back-button" onClick={() => showMode('login')} type="button"><span aria-hidden="true">‹</span>Quay lại trang đăng nhập</button>
        <h3>Đăng ký tài khoản bệnh nhân</h3>
        {status ? <p className="auth-request-error" role="alert">{status}</p> : null}
        <div className="auth-signup-grid">
          <TextField autoComplete="email" compact error={signupErrors.email} id="signup-email" inputMode="email" label="Email" onChange={(value) => update('email', value)} placeholder="email@example.com" type="email" value={signupForm.email} />
          <TextField autoComplete="tel" compact error={signupErrors.phone} id="signup-phone" inputMode="tel" label="Số điện thoại (không bắt buộc)" onChange={(value) => update('phone', value.replace(/\D/g, '').slice(0, 10))} placeholder="10 chữ số (03/05/07/08/09...)" value={signupForm.phone} />
          <TextField autoComplete="name" compact error={signupErrors.fullName} id="signup-full-name" label="Họ và tên" onChange={(value) => update('fullName', value)} placeholder="Nhập họ và tên" value={signupForm.fullName} />
          <label className="auth-field auth-field-compact" htmlFor="signup-gender">
            <span>Giới tính (không bắt buộc)</span>
            <select
              aria-describedby={signupErrors.gender ? 'signup-gender-error' : undefined}
              aria-invalid={Boolean(signupErrors.gender)}
              id="signup-gender"
              onChange={(event) => update('gender', event.target.value)}
              value={signupForm.gender}
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
            {signupErrors.gender ? <p className="auth-field-error" id="signup-gender-error" role="alert">{signupErrors.gender}</p> : null}
          </label>
          <TextField autoComplete="bday" compact error={signupErrors.birthday} id="signup-birthday" label="Ngày sinh (không bắt buộc)" onChange={(value) => update('birthday', value)} placeholder="" type="date" value={signupForm.birthday} />
          <TextField autoComplete="new-password" compact error={signupErrors.password} id="signup-password" label="Mật khẩu" onChange={(value) => update('password', value)} placeholder="10–128 kí tự, gồm chữ hoa, chữ thường, số" type="password" value={signupForm.password} />
          <TextField autoComplete="new-password" compact error={signupErrors.confirmPassword} id="signup-confirm-password" label="Xác nhận mật khẩu" onChange={(value) => update('confirmPassword', value)} placeholder="Nhập lại mật khẩu" type="password" value={signupForm.confirmPassword} />
        </div>
        <button className="auth-primary-button" disabled={submitting} type="submit">{submitting ? 'Đang đăng ký...' : 'Đăng ký'}</button>
      </form>
    )
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <BrandIllustration />
        <section className="auth-content-panel">
          <div className="auth-form-stage">
            <div className="auth-mobile-brand">
              <SystemLogo className="auth-mobile-logo" />
              <span>serene<span className="auth-wordmark-light"> health</span></span>
            </div>
            <AuthHeader mode={mode} />
            <section className={`auth-modal auth-modal-${mode}`} aria-label="Biểu mẫu xác thực">
              {mode === 'login' ? renderLogin() : null}
              {mode === 'forgot' ? renderForgot() : null}
              {mode === 'signup' ? renderSignup() : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
