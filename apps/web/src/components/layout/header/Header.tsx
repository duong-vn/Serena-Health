import { useAuth } from '../../../auth/AuthContext'
import './Header.css'

interface HeaderProps {
  profileRole: string
}

export function Header({ profileRole }: HeaderProps) {
  const { logout, user } = useAuth()

  return (
    <header className="app-header">
      <div className="header-profile">
        <button className="notification-button" type="button" aria-label="Thông báo" disabled title="Thông báo chưa được hỗ trợ">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </button>
        <div className="profile-text">
          <strong title={user?.fullName}>{user?.fullName || 'Người dùng'}</strong>
          <span>{profileRole}</span>
        </div>
        <div className="profile-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
        </div>
        <button className="header-logout-button" onClick={logout} type="button">Đăng xuất</button>
      </div>
    </header>
  )
}
