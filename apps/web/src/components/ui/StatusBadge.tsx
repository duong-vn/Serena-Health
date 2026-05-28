import './StatusBadge.css';

type StatusBadgeProps = {
  status:
  'online' | 'offline' | 'busy'
  | 'waiting' | 'completed' | 'in-progress' | 'priority'; // Của Patient
}

const statusLabels = {
  online: 'Hoạt động',
  offline: 'Ngoại tuyến',
  busy: 'Đang khám',

  waiting: 'Đang chờ',
  completed: 'Đã kết thúc',
  'in-progress': 'Đang khám',
  priority: 'Ưu tiên cao',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge-${status}`}>{statusLabels[status]}</span>
}
