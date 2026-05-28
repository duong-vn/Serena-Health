import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SystemLogo } from '../../components/brand/SystemLogo'
import sereneBotIcon from '../../assets/auth/serene-bot.svg'
import plusIcon from '../../assets/auth/plus.svg'
import globeIcon from '../../assets/auth/globe.svg'
import './AuthPage.css'

type AuthMode = 'login' | 'forgot' | 'signup' | 'forgotLoading' | 'forgotSuccess'
type AccountRole = 'doctor' | 'manager'

type Account = {
  email: string
  phone: string
  fullName: string
  password: string
  role: AccountRole
}

type LoginForm = {
  identifier: string
  password: string
  remember: boolean
}

type ForgotForm = {
  identifier: string
  sentPassword: string
}

type SignupForm = {
  email: string
  phone: string
  fullName: string
  gender: string
  birthday: string
  password: string
  confirmPassword: string
}

type FormErrors<T extends string> = Partial<Record<T, string>>

const DEFAULT_PASSWORD = '12345678'

const initialAccounts: Account[] = [
  {
    email: 'doctor@gmail.com',
    phone: '0900000001',
    fullName: 'Bac si',
    password: DEFAULT_PASSWORD,
    role: 'doctor',
  },
  {
    email: 'manager@gmail.com',
    phone: '0900000002',
    fullName: 'Manager',
    password: DEFAULT_PASSWORD,
    role: 'manager',
  },
]

const initialLoginForm: LoginForm = {
  identifier: '',
  password: '',
  remember: false,
}

const initialForgotForm: ForgotForm = {
  identifier: '',
  sentPassword: '',
}

const initialSignupForm: SignupForm = {
  email: '',
  phone: '',
  fullName: '',
  gender: '',
  birthday: '',
  password: '',
  confirmPassword: '',
}

function findAccount(accounts: Account[], identifier: string) {
  const normalized = identifier.trim().toLowerCase()

  return accounts.find(
    (account) => account.email.toLowerCase() === normalized || account.phone === normalized,
  )
}

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function phoneLooksValid(phone: string) {
  return /^\d{10}$/.test(phone.trim())
}

function identifierLooksValid(identifier: string) {
  const value = identifier.trim()
  return emailLooksValid(value) || phoneLooksValid(value)
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="auth-field-error">{message}</p>
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  placeholder: string
  type?: string
  error?: string
  helper?: string
  compact?: boolean
  autoComplete?: string
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  onChange: (value: string) => void
  onFocus?: () => void
}

function TextField({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  error,
  helper,
  compact,
  autoComplete,
  inputMode,
  onChange,
  onFocus,
}: TextFieldProps) {
  return (
    <label className={compact ? 'auth-field auth-field-compact' : 'auth-field'} htmlFor={id}>
      <span>{label}</span>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={error ? 'is-invalid' : ''}
        id={id}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {helper ? <p className="auth-field-helper">{helper}</p> : null}
      {error ? (
        <p className="auth-field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </label>
  )
}

function BrandIllustration() {
  return (
    <section className="auth-brand-panel" aria-label="Serene Health">
      <div className="brand-center">
        <div className="bot-badge">
          <div className="bot-face">
            <img src={sereneBotIcon} alt="" aria-hidden="true" />
          </div>
          <div className="bot-plus-card">
            <img src={plusIcon} alt="" aria-hidden="true" />
          </div>
          <div className="bot-globe-card">
            <img src={globeIcon} alt="" aria-hidden="true" />
          </div>
        </div>

        <div className="brand-text">
          <h1>Serene Health</h1>
          <p>Trợ lý y tế thông minh, đồng hành cùng sức khỏe của bạn</p>
        </div>

        <div className="brand-pills">
          <span>🤖 AI-Powered</span>
          <span>💙 Đáng tin cậy</span>
        </div>
      </div>
    </section>
  )
}

function AuthHeader() {
  return (
    <header className="auth-header">
      <SystemLogo className="auth-header-logo" />
      <h2>CHÀO MỪNG ĐẾN VỚI SERENE HEALTH</h2>
      <p>Đăng nhập để sử dụng dịch vụ của hệ thống</p>
    </header>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [layoutScale, setLayoutScale] = useState({ shell: 1, content: 1 })
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm)
  const [forgotForm, setForgotForm] = useState<ForgotForm>(initialForgotForm)
  const [signupForm, setSignupForm] = useState<SignupForm>(initialSignupForm)
  const [loginErrors, setLoginErrors] = useState<FormErrors<'identifier' | 'password'>>({})
  const [forgotErrors, setForgotErrors] = useState<FormErrors<'identifier' | 'sentPassword'>>({})
  const [signupErrors, setSignupErrors] = useState<FormErrors<keyof SignupForm>>({})
  const [forgotStatus, setForgotStatus] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [showToast, setShowToast] = useState(false)

  const accountByIdentifier = useMemo(
    () => findAccount(accounts, forgotForm.identifier),
    [accounts, forgotForm.identifier],
  )

  useEffect(() => {
    function updateLayoutScale() {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (viewportWidth <= 560) {
        setLayoutScale({
          shell: Math.min(viewportWidth / 390, viewportHeight / 844),
          content: 1,
        })
        return
      }

      if (viewportWidth <= 900) {
        setLayoutScale({
          shell: Math.min(viewportWidth / 720, viewportHeight / 1024),
          content: 1,
        })
        return
      }

      setLayoutScale({
        shell: 1,
        content: Math.min(1.16, Math.min(viewportWidth / 1440, viewportHeight / 820)),
      })
    }

    updateLayoutScale()
    window.addEventListener('resize', updateLayoutScale)

    return () => window.removeEventListener('resize', updateLayoutScale)
  }, [])

  useEffect(() => {
    if (mode !== 'forgotLoading') {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setMode('forgotSuccess')
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [mode])

  useEffect(() => {
    if (!showToast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setShowToast(false)
    }, 2600)

    return () => window.clearTimeout(timeoutId)
  }, [showToast])

  function resetToLogin(message = '') {
    setMode('login')
    setLoginForm(initialLoginForm)
    setForgotForm(initialForgotForm)
    setSignupForm(initialSignupForm)
    setLoginErrors({})
    setForgotErrors({})
    setSignupErrors({})
    setForgotStatus('')
    setLoginStatus(message)
  }

  function updateLoginField<Key extends keyof LoginForm>(field: Key, value: LoginForm[Key]) {
    setLoginForm((current) => ({ ...current, [field]: value }))
    setLoginErrors((current) => ({ ...current, [field]: undefined }))
  }

  function updateForgotField<Key extends keyof ForgotForm>(field: Key, value: ForgotForm[Key]) {
    setForgotForm((current) => ({ ...current, [field]: value }))
    setForgotErrors((current) => ({ ...current, [field]: undefined }))
    if (field === 'identifier') {
      setForgotStatus('')
    }
  }

  function updateSignupField<Key extends keyof SignupForm>(field: Key, value: SignupForm[Key]) {
    setSignupForm((current) => ({ ...current, [field]: value }))
    setSignupErrors((current) => ({ ...current, [field]: undefined }))
  }

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FormErrors<'identifier' | 'password'> = {}
    const identifier = loginForm.identifier.trim()

    if (!identifier) {
      errors.identifier = 'Vui lòng nhập email hoặc số điện thoại.'
    } else if (!identifierLooksValid(identifier)) {
      errors.identifier = 'Vui lòng nhập email hoặc số điện thoại hợp lệ.'
    }

    if (!loginForm.password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu.'
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors)
      return
    }

    const account = findAccount(accounts, identifier)
    if (!account) {
      setLoginErrors({
        identifier: 'Tài khoản không tồn tại. Vui lòng thử lại!',
      })
      return
    }

    if (loginForm.password.length < 8) {
      setLoginErrors({ password: 'Mật khẩu phải đủ 8 kí tự.' })
      return
    }

    if (account.password !== loginForm.password) {
      setLoginErrors({ password: 'Mật khẩu không chính xác. Vui lòng thử lại!' })
      return
    }

    setLoginErrors({})
    setLoginStatus('')
    setShowToast(true)
    window.setTimeout(() => {
      navigate(account.role === 'doctor' ? '/doctor/dashboard' : '/manager/dashboard')
    }, 650)
  }

  function sendRecoveryCode() {
    if (!forgotForm.identifier.trim()) {
      setForgotStatus('')
      setForgotErrors({ identifier: 'Vui lòng nhập email hoặc số điện thoại.' })
      return
    }

    if (!identifierLooksValid(forgotForm.identifier)) {
      setForgotStatus('')
      setForgotErrors({ identifier: 'Vui lòng nhập email hoặc số điện thoại hợp lệ.' })
      return
    }

    if (!accountByIdentifier) {
      setForgotStatus('')
      setForgotErrors({
        identifier: 'Email hoặc số điện thoại không tồn tại. Vui lòng thử lại!',
      })
      return
    }

    setForgotErrors((current) => ({ ...current, identifier: undefined }))
    setForgotStatus('Đã gửi mã khôi phục. Vui lòng kiểm tra email hoặc số điện thoại.')
  }

  function submitForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!forgotForm.identifier.trim()) {
      setForgotStatus('')
      setForgotErrors({ identifier: 'Vui lòng nhập email hoặc số điện thoại.' })
      return
    }

    const account = findAccount(accounts, forgotForm.identifier)
    if (!account) {
      setForgotStatus('')
      setForgotErrors({
        identifier: 'Email hoặc số điện thoại không tồn tại. Vui lòng thử lại!',
      })
      return
    }

    if (forgotForm.sentPassword !== account.password) {
      setForgotErrors({ sentPassword: 'Mật khẩu chưa chính xác. Vui lòng thử lại!' })
      return
    }

    setForgotErrors({})
    setForgotStatus('')
    setMode('forgotLoading')
  }

  function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors: FormErrors<keyof SignupForm> = {}
    const email = signupForm.email.trim()
    const phone = signupForm.phone.trim()
    const fullName = signupForm.fullName.trim()

    if (!email) {
      errors.email = 'Vui lòng nhập email.'
    } else if (!emailLooksValid(email)) {
      errors.email = 'Email không đúng định dạng, vui lòng nhập lại.'
    }

    if (!phone) {
      errors.phone = 'Vui lòng nhập số điện thoại.'
    } else if (!phoneLooksValid(phone)) {
      errors.phone = 'Số điện thoại phải đủ 10 số.'
    }

    const existedAccount = accounts.find(
      (account) => account.email.toLowerCase() === email.toLowerCase() || account.phone === phone,
    )

    if (existedAccount) {
      errors.email = 'Email hoặc số điện thoại đã tồn tại.'
    }

    if (!fullName) {
      errors.fullName = 'Vui lòng nhập họ và tên.'
    } else if (fullName.length > 255) {
      errors.fullName = 'Họ và tên giới hạn 255 kí tự.'
    }

    if (!signupForm.gender) {
      errors.gender = 'Vui lòng chọn giới tính.'
    }

    if (!signupForm.birthday) {
      errors.birthday = 'Vui lòng nhập ngày sinh.'
    }

    if (!signupForm.password) {
      errors.password = 'Vui lòng nhập mật khẩu.'
    } else if (signupForm.password.length < 8) {
      errors.password = 'Mật khẩu phải đủ 8 kí tự.'
    }

    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
    } else if (signupForm.confirmPassword !== signupForm.password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập.'
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors)
      return
    }

    setAccounts((current) => [
      ...current,
      {
        email,
        phone,
        fullName,
        password: signupForm.password,
        role: 'doctor',
      },
    ])
    resetToLogin('Đăng kí thành công, vui lòng đăng nhập.')
  }

  function renderLogin() {
    return (
      <form className="auth-modal-form auth-login-form" onSubmit={submitLogin} noValidate>
        {loginStatus ? <p className="auth-success-line">{loginStatus}</p> : null}
        <TextField
          autoComplete="username"
          error={loginErrors.identifier}
          id="login-identifier"
          inputMode="email"
          label="Email / Số điện thoại"
          onChange={(value) => updateLoginField('identifier', value)}
          onFocus={() => setLoginErrors((current) => ({ ...current, identifier: undefined }))}
          placeholder="Nhập email hoặc số điện thoại"
          value={loginForm.identifier}
        />
        <TextField
          autoComplete="current-password"
          error={loginErrors.password}
          id="login-password"
          label="Mật khẩu"
          onChange={(value) => updateLoginField('password', value)}
          onFocus={() => setLoginErrors((current) => ({ ...current, password: undefined }))}
          placeholder="Nhập mật khẩu"
          type="password"
          value={loginForm.password}
        />

        <div className="auth-login-options">
          <label className="auth-remember">
            <input
              checked={loginForm.remember}
              onChange={(event) => updateLoginField('remember', event.target.checked)}
              type="checkbox"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <button className="auth-link-button" onClick={() => setMode('forgot')} type="button">
            Quên mật khẩu?
          </button>
        </div>

        <button className="auth-primary-button" type="submit">
          Đăng nhập
        </button>
        <div className="auth-divider" />
        <p className="auth-register-prompt">
          <span>Chưa có tài khoản? </span>
          <button className="auth-inline-link" onClick={() => setMode('signup')} type="button">
            Đăng kí ngay
          </button>
        </p>
      </form>
    )
  }

  function renderForgot() {
    return (
      <form className="auth-modal-form auth-forgot-form" onSubmit={submitForgot} noValidate>
        <button className="auth-back-button" onClick={() => resetToLogin()} type="button">
          <span aria-hidden="true">‹</span>
          Quay lại trang đăng nhập
        </button>
        <h3>Quên mật khẩu</h3>
        <div className="auth-recovery-row">
          <TextField
            autoComplete="username"
            error={forgotErrors.identifier}
            id="forgot-identifier"
            inputMode="email"
            label="Email / Số điện thoại khôi phục"
            onChange={(value) => updateForgotField('identifier', value)}
            onFocus={() => setForgotErrors((current) => ({ ...current, identifier: undefined }))}
            placeholder="Nhập email hoặc số điện thoại"
            value={forgotForm.identifier}
          />
          <button className="auth-send-code-button" onClick={sendRecoveryCode} type="button">
            Gửi mã
          </button>
        </div>
        {forgotStatus ? <p className="auth-success-line forgot-status">{forgotStatus}</p> : null}
        <TextField
          autoComplete="new-password"
          error={forgotErrors.sentPassword}
          helper="Mật khẩu mới được hệ thống gửi về email hoặc số điện thoại khôi phục của bạn."
          id="forgot-password"
          label="Mật khẩu mới"
          onChange={(value) => updateForgotField('sentPassword', value)}
          onFocus={() => setForgotErrors((current) => ({ ...current, sentPassword: undefined }))}
          placeholder="Nhập mật khẩu mới được gửi"
          type="password"
          value={forgotForm.sentPassword}
        />
        <button className="auth-primary-button" type="submit">
          Xác nhận
        </button>
      </form>
    )
  }

  function renderForgotLoading() {
    return (
      <div className="auth-modal-state">
        <div className="auth-loader" aria-label="Đang xử lý" />
        <p>Đang xác nhận mật khẩu mới...</p>
      </div>
    )
  }

  function renderForgotSuccess() {
    return (
      <div className="auth-modal-state">
        <h3>Đã đổi mật khẩu thành công</h3>
        <p>Bạn có thể quay lại trang đăng nhập và sử dụng mật khẩu mới.</p>
        <button className="auth-primary-button auth-wide-button" onClick={() => resetToLogin()} type="button">
          Quay lại trang đăng nhập
        </button>
      </div>
    )
  }

  function renderSignup() {
    return (
      <form className="auth-modal-form auth-signup-form" onSubmit={submitSignup} noValidate>
        <button className="auth-back-button" onClick={() => resetToLogin()} type="button">
          <span aria-hidden="true">‹</span>
          Quay lại trang đăng nhập
        </button>
        <h3>Đăng kí tài khoản</h3>
        <div className="auth-signup-grid">
          <TextField
            autoComplete="email"
            compact
            error={signupErrors.email}
            id="signup-email"
            inputMode="email"
            label="Email"
            onChange={(value) => updateSignupField('email', value)}
            placeholder="email@example.com"
            type="email"
            value={signupForm.email}
          />
          <TextField
            autoComplete="tel"
            compact
            error={signupErrors.phone}
            id="signup-phone"
            inputMode="tel"
            label="Số điện thoại"
            onChange={(value) => updateSignupField('phone', value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10 chữ số"
            value={signupForm.phone}
          />
          <TextField
            autoComplete="name"
            compact
            error={signupErrors.fullName}
            id="signup-full-name"
            label="Họ và tên"
            onChange={(value) => updateSignupField('fullName', value)}
            placeholder="Nhập họ và tên"
            value={signupForm.fullName}
          />
          <label className="auth-field auth-field-compact" htmlFor="signup-gender">
            <span>Giới tính</span>
            <select
              aria-invalid={Boolean(signupErrors.gender)}
              className={signupErrors.gender ? 'is-invalid' : ''}
              id="signup-gender"
              onChange={(event) => updateSignupField('gender', event.target.value)}
              onFocus={() => setSignupErrors((current) => ({ ...current, gender: undefined }))}
              value={signupForm.gender}
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            <FieldError message={signupErrors.gender} />
          </label>
          <TextField
            autoComplete="bday"
            compact
            error={signupErrors.birthday}
            id="signup-birthday"
            label="Ngày sinh"
            onChange={(value) => updateSignupField('birthday', value)}
            placeholder="dd/mm/yyyy"
            type="date"
            value={signupForm.birthday}
          />
          <TextField
            autoComplete="new-password"
            compact
            error={signupErrors.password}
            id="signup-password"
            label="Mật khẩu"
            onChange={(value) => updateSignupField('password', value)}
            placeholder="Tối thiểu 8 kí tự"
            type="password"
            value={signupForm.password}
          />
          <TextField
            autoComplete="new-password"
            compact
            error={signupErrors.confirmPassword}
            id="signup-confirm-password"
            label="Xác nhận mật khẩu"
            onChange={(value) => updateSignupField('confirmPassword', value)}
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={signupForm.confirmPassword}
          />
        </div>
        <button className="auth-primary-button" type="submit">
          Đăng kí
        </button>
      </form>
    )
  }

  return (
    <main
      className="auth-page"
      style={
        {
          '--auth-shell-scale': layoutScale.shell,
          '--auth-content-scale': layoutScale.content,
        } as CSSProperties
      }
    >
      {showToast ? <div className="auth-toast">Đăng nhập thành công!</div> : null}
      <div className="auth-shell">
        <BrandIllustration />
        <section className="auth-content-panel">
          <div className="auth-form-stage">
            <AuthHeader />
            <section className={`auth-modal auth-modal-${mode}`} aria-label="Biểu mẫu xác thực">
              {mode === 'login' ? renderLogin() : null}
              {mode === 'forgot' ? renderForgot() : null}
              {mode === 'forgotLoading' ? renderForgotLoading() : null}
              {mode === 'forgotSuccess' ? renderForgotSuccess() : null}
              {mode === 'signup' ? renderSignup() : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}
