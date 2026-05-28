import type { ReactNode } from 'react'
import type { SidebarIconName } from './types'

type SidebarIconProps = {
  name: SidebarIconName
}

export function SidebarIcon({ name }: SidebarIconProps) {
  const paths: Record<SidebarIconName, ReactNode> = {
    grid: (
      <>
        <rect x="4" y="4" width="5" height="5" rx="1" />
        <rect x="15" y="4" width="5" height="5" rx="1" />
        <rect x="4" y="15" width="5" height="5" rx="1" />
        <rect x="15" y="15" width="5" height="5" rx="1" />
      </>
    ),
    users: (
      <>
        <path d="M9.5 11.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
        <path d="M3.5 20c.7-3.9 2.7-5.9 6-5.9s5.3 2 6 5.9" />
        <path d="M17 10.8a2.8 2.8 0 1 0-1.2-5.3" />
        <path d="M15.9 14.2c2.6.5 4.1 2.4 4.6 5.8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v4.8l3.2 1.9" />
      </>
    ),
    calendar: (
      <>
        <rect x="4.5" y="5.5" width="15" height="14" rx="2" />
        <path d="M8 3.5v4M16 3.5v4M4.5 10h15" />
      </>
    ),
    'calendar-check': (
      <>
        <rect x="4.5" y="5.5" width="15" height="14" rx="2" />
        <path d="M8 3.5v4M16 3.5v4M4.5 10h15M8.2 15l2.2 2.1 5.2-5" />
      </>
    ),
    building: (
      <>
        <rect x="5.5" y="4" width="9.5" height="16" rx="1.5" />
        <path d="M15 9h4v11M8.5 8h3.5M8.5 12h3.5M8.5 16h3.5" />
      </>
    ),
    list: (
      <>
        <path d="M8 6.5h11M8 12h11M8 17.5h11" />
        <path d="m4 6.5.7.7L6.2 5.5M4 12l.7.7 1.5-1.7M4 17.5l.7.7 1.5-1.7" />
      </>
    ),
    bot: (
      <>
        <rect x="5" y="8" width="14" height="10" rx="2.5" />
        <path d="M12 8V5M9.2 13h.01M14.8 13h.01M8 18l-1.5 2M16 18l1.5 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4.5 20V5M4.5 20h15" />
        <path d="M8.5 16v-4M12.5 16V8M16.5 16v-6" />
      </>
    ),
    message: (
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-5 4V6.5Z" />
    ),
  }

  return (
    <svg className="sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

