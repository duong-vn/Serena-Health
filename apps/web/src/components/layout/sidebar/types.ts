export type SidebarIconName =
  | 'grid'
  | 'users'
  | 'clock'
  | 'calendar'
  | 'calendar-check'
  | 'building'
  | 'list'
  | 'bot'
  | 'chart'
  | 'message'

export type SidebarItem = {
  label: string
  icon: SidebarIconName
  href?: string
}

export type SidebarGroup = {
  title: string
  items: SidebarItem[]
}

export type SidebarConfig = {
  profileRole: string
  activeLabel: string
  groups: SidebarGroup[]
}

