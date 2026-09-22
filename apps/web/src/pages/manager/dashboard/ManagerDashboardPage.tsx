import type { ReactNode } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { useApi } from '../../../api/useApi'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, MessageMetricIcon, PulseMetricIcon, UsersMetricIcon } from '../../../components/ui/metricIcons'
import { managerSidebarConfig } from '../managerSidebarConfig'
import './ManagerDashboardPage.css'

interface DashboardData {
  patients: number
  doctors: number
  appointmentsToday: number
  openConsultations: number
  completedConsultations: number
  appointmentsByStatus: Array<{ status: string; count: number }>
}

const statusColors = ['#4a93ff', '#25a867', '#d88400', '#d94f70', '#7f6ad8'] as const
const statusLabels: Record<string, string> = {
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
  CONFIRMED: 'Đã xác nhận',
  IN_PROGRESS: 'Đang thực hiện',
  PENDING: 'Đang chờ',
}

function StateCard({ children, role }: { children: ReactNode; role?: 'alert' | 'status' }) {
  return <section className="dashboard-card dashboard-state-card" role={role}>{children}</section>
}

export function ManagerDashboardPage() {
  const { data, error, loading, reload } = useApi<DashboardData>('/manager/dashboard')
  const statusData = (data?.appointmentsByStatus || []).filter((item) => item.count > 0)
  const metrics = data ? [
    { label: 'Tổng bệnh nhân', value: data.patients, icon: <UsersMetricIcon />, iconClassName: 'metric-icon-blue' },
    { label: 'Tổng bác sĩ', value: data.doctors, icon: <PulseMetricIcon />, iconClassName: 'metric-icon-green' },
    { label: 'Lịch hẹn hôm nay', value: data.appointmentsToday, icon: <ClockMetricIcon />, iconClassName: 'metric-icon-yellow' },
    { label: 'Ca tư vấn đang mở', value: data.openConsultations, icon: <MessageMetricIcon />, iconClassName: 'metric-icon-pink' },
  ] : []

  return (
    <div className="desktop-shell-page manager-dashboard-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main manager-dashboard-main" aria-label="Nội dung chính">
        <section className="manager-dashboard-content" aria-busy={loading}>
          <div className="dashboard-heading-row">
            <div><h1>Dashboard</h1><p>Thống kê vận hành hiện tại từ hệ thống Serene Health.</p></div>
          </div>

          {loading ? <StateCard role="status">Đang tải dữ liệu dashboard...</StateCard> : null}
          {error ? <StateCard role="alert"><h2>Không thể tải dashboard</h2><p>{error.message}</p><button className="dashboard-retry-button" onClick={reload} type="button">Thử lại</button></StateCard> : null}
          {!loading && !error && !data ? <StateCard role="status">Không có dữ liệu dashboard từ máy chủ.</StateCard> : null}
          {!loading && !error && data ? (
            <>
              <div className="metrics-grid">
                {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
              </div>
              <div className="dashboard-grid dashboard-grid-real">
                <section className="dashboard-card result-card">
                  <h2>Trạng thái lịch hẹn</h2>
                  {statusData.length ? (
                    <div className="result-card-body">
                      <div className="donut-frame" role="img" aria-label="Biểu đồ phân bổ trạng thái lịch hẹn">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart accessibilityLayer>
                            <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={47} outerRadius={72} paddingAngle={3} stroke="#fff" strokeWidth={3}>
                              {statusData.map((entry, index) => <Cell fill={statusColors[index % statusColors.length]} key={entry.status} />)}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} lịch hẹn`, statusLabels[String(name)] || String(name)]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <ul className="result-legend" role="list">
                        {statusData.map((item, index) => (
                          <li className="legend-item" key={item.status}>
                            <span aria-hidden="true" style={{ backgroundColor: statusColors[index % statusColors.length] }} />
                            <p>{statusLabels[item.status] || item.status}</p>
                            <strong>{item.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : <p className="dashboard-empty-copy">Chưa có lịch hẹn trong kỳ hiện tại.</p>}
                </section>
                <section className="dashboard-card result-card consultation-summary-card">
                  <h2>Tình trạng tư vấn</h2>
                  <dl className="dashboard-summary-list">
                    <div><dt>Đang mở</dt><dd>{data.openConsultations.toLocaleString('vi-VN')}</dd></div>
                    <div><dt>Đã hoàn thành</dt><dd>{data.completedConsultations.toLocaleString('vi-VN')}</dd></div>
                  </dl>
                  <small>Dashboard chỉ hiển thị số liệu máy chủ cung cấp; không suy đoán doanh thu hay số liệu giả.</small>
                </section>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  )
}
