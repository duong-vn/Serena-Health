import { memo, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon'
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              logo_alignment?: 'left' | 'center'
              width?: number | string
              locale?: string
            },
          ) => void
          prompt?: () => void
        }
      }
    }
  }
}

interface GoogleLoginButtonProps {
  mode?: 'login' | 'signup'
  disabled?: boolean
  onSuccess: (credential: string) => void
  onError?: (message: string) => void
}

export const GoogleLoginButton = memo(function GoogleLoginButton({
  mode = 'login',
  disabled = false,
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  useEffect(() => {
    if (!clientId) return

    if (window.google?.accounts?.id) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => {
      onError?.('Không thể tải dịch vụ Google Sign-In')
    }
    document.head.appendChild(script)

    return () => {
      // Keep script in head once attached to prevent multiple script tags
    }
  }, [clientId, onError])

  useEffect(() => {
    if (!scriptLoaded || !clientId || !containerRef.current || !window.google?.accounts?.id) return

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential)
          } else {
            onError?.('Không nhận được thông tin xác thực từ Google')
          }
        },
      })

      containerRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(containerRef.current, {
        locale: 'vi',
        logo_alignment: 'left',
        shape: 'rectangular',
        size: 'large',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        theme: 'outline',
        width: 380,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khởi tạo Google'
      onError?.(message)
    }
  }, [scriptLoaded, clientId, mode, onSuccess, onError])

  function handleFallbackClick() {
    if (!clientId) {
      onError?.('Chưa cấu hình Google Client ID (VITE_GOOGLE_CLIENT_ID)')
      return
    }
    if (window.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt()
    }
  }

  const label = mode === 'signup' ? 'Đăng ký với Google' : 'Đăng nhập với Google'

  return (
    <div className="auth-google-wrapper">
      <div
        ref={containerRef}
        className="auth-google-official-btn"
        style={{ display: scriptLoaded && clientId ? 'flex' : 'none' }}
      />
      {(!scriptLoaded || !clientId) && (
        <button
          type="button"
          className="auth-google-btn"
          disabled={disabled}
          onClick={handleFallbackClick}
        >
          <svg className="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{label}</span>
        </button>
      )}
    </div>
  )
})
