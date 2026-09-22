import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../../auth/AuthContext'
import './Sidebar.css'
import { SidebarIcon } from './SidebarIcon'
import { SidebarLogo } from './SidebarLogo'
import type { SidebarConfig } from './types'

interface SidebarProps {
  config: SidebarConfig
  onItemClick?: (label: string) => void
}

export function Sidebar({ config, onItemClick }: SidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="app-sidebar">
      <div className="brand">
        <SidebarLogo />
        <div><strong>Serene Health</strong><span>Medical Platform</span></div>
      </div>

      <label className="sidebar-search" title="Tìm kiếm chưa được hỗ trợ">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></svg>
        <input type="search" placeholder="Tìm kiếm" aria-label="Tìm kiếm chưa được hỗ trợ" disabled />
      </label>

      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {config.groups.map((group) => (
          <section className="nav-group" key={group.title}>
            <h2>{group.title}</h2>
            <div className="nav-items">
              {group.items.map((item) => {
                const isActive = item.label === config.activeLabel || Boolean(item.href && location.pathname.startsWith(item.href))
                if (!item.href && !onItemClick) {
                  return (
                    <span aria-disabled="true" className="nav-item nav-item-disabled" key={item.label} title="Chức năng chưa được hỗ trợ">
                      <SidebarIcon name={item.icon} /><span>{item.label}</span>
                    </span>
                  )
                }
                return (
                  <Link
                    to={item.href || location.pathname}
                    className={isActive ? 'nav-item active' : 'nav-item'}
                    key={item.label}
                    onClick={(event) => {
                      if (!item.href && !onItemClick) event.preventDefault()
                      onItemClick?.(item.label)
                    }}
                  >
                    <SidebarIcon name={item.icon} /><span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </nav>

      <button className="logout-button" onClick={logout} type="button">Đăng xuất</button>
    </aside>
  )
}
