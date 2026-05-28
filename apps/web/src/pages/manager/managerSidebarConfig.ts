import type { SidebarConfig } from '../../components/layout/sidebar/types'

export const managerSidebarConfig: SidebarConfig = {
  profileRole: 'Quản lý phòng khám',
  activeLabel: 'Dashboard',
  groups: [
    {
      title: 'Tổng quan',
      items: [{ label: 'Dashboard', icon: 'grid', href: '/manager/dashboard' }],
    },
    {
      title: 'Quản trị',
      items: [
        { label: 'Quản lý bác sĩ', icon: 'users', href: '/manager/doctors' },
        { label: 'Quản lý bệnh nhân', icon: 'users' },
      ],
    },
    {
      title: 'Vận hành phòng khám',
      items: [
        { label: 'Lịch làm việc', icon: 'clock' },
        { label: 'Lịch hẹn khám', icon: 'calendar' },
        { label: 'Chi nhánh', icon: 'building' },
        { label: 'Danh mục dịch vụ', icon: 'list' },
      ],
    },
    {
      title: 'Chatbot & AI',
      items: [{ label: 'Giám sát Chatbot', icon: 'bot', href: '/manager/chatbot-monitor' }],
    },
    {
      title: 'Báo cáo - Thống kê',
      items: [{ label: 'Báo cáo - Thống kê', icon: 'chart', href: '/manager/report' }],
    },
  ],
}
