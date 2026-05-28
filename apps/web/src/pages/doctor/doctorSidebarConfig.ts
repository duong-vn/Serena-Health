import type { SidebarConfig } from '../../components/layout/sidebar/types'

export const doctorSidebarConfig: SidebarConfig = {
  profileRole: 'Bác sĩ',
  activeLabel: 'Tư vấn trực tiếp',
  groups: [
    {
      title: 'Tổng quan',
      items: [{ label: 'Dashboard', icon: 'grid' }],
    },
    {
      title: 'Khám & tư vấn',
      items: [
        { label: 'Tư vấn trực tiếp', icon: 'message' },
        { label: 'Danh sách bệnh nhân', icon: 'users' },
      ],
    },
    {
      title: 'Lịch trình',
      items: [
        { label: 'Lịch làm việc', icon: 'calendar' },
        { label: 'Lịch hẹn khám', icon: 'calendar-check' },
      ],
    },
  ],
}

