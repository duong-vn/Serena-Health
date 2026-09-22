import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { useApi } from '../../../api/useApi'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { managerSidebarConfig } from '../managerSidebarConfig'
import './ManagerReportAnalysisPage.css'

import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, MessageMetricIcon, PulseMetricIcon, UsersMetricIcon } from '../../../components/ui/metricIcons'

interface DashboardData {
  patients: number
  doctors: number
  appointmentsToday: number
  openConsultations: number
  completedConsultations: number
  appointmentsByStatus: Array<{ status: string; count: number }>
}

const statusColors = ['#adecbb', '#fb93a3', '#ffdf7d', '#8dc1ff', '#d88400']
const statusLabels: Record<string, string> = {
  CANCELLED: 'Đã hủy',
  COMPLETED: 'Hoàn thành',
  CONFIRMED: 'Đã xác nhận',
  IN_PROGRESS: 'Đang xử lý',
  PENDING: 'Đang chờ',
}

export function ManagerReportAnalysisPage() {
  const { data, error, loading, reload } = useApi<DashboardData>('/manager/dashboard')
  const statusData = (data?.appointmentsByStatus || []).filter((item) => item.count > 0)

  const metrics = data ? [
    { label: 'Tổng số bệnh nhân', value: data.patients.toLocaleString('vi-VN'), iconClassName: 'metric-icon-blue', icon: <UsersMetricIcon /> },
    { label: 'Tổng số bác sĩ', value: data.doctors.toLocaleString('vi-VN'), iconClassName: 'metric-icon-yellow', icon: <PulseMetricIcon /> },
    { label: 'Lịch hẹn hôm nay', value: data.appointmentsToday.toLocaleString('vi-VN'), iconClassName: 'metric-icon-pink', icon: <ClockMetricIcon /> },
    { label: 'Ca tư vấn hoàn tất', value: data.completedConsultations.toLocaleString('vi-VN'), iconClassName: 'metric-icon-green', icon: <MessageMetricIcon /> },
  ] : []

  return (
    <div className="desktop-shell-page manager-report-analysis-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main manager-report-analysis-main" aria-label="Báo cáo - Thống kê">
        <section className="report-page-content" aria-busy={loading}>
          <div className="report-heading-row">
            <div>
              <h1>Báo cáo - Thống kê</h1>
              <p>Tổng hợp dữ liệu vận hành thực tế được ghi nhận từ hệ thống.</p>
            </div>
          </div>

          {loading ? <p className="doctor-data-state" role="status">Đang tải dữ liệu báo cáo...</p> : null}
          {error ? (
            <div className="doctor-data-state" role="alert">
              <p>{error.message}</p>
              <button className="dashboard-retry-button" onClick={reload} type="button">Thử lại</button>
            </div>
          ) : null}

          {!loading && !error && data ? (
            <>
              <div className="metrics-grid report-metrics-grid">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>

              <div className="report-charts-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
                <section className="dashboard-card pie-chart-card">
                  <h2>Phân bổ lịch hẹn theo trạng thái</h2>
                  {statusData.length ? (
                    <div className="pie-chart-body">
                      <div className="pie-frame" role="img" aria-label="Biểu đồ phân bổ lịch hẹn">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart accessibilityLayer>
                            <Pie
                              data={statusData}
                              dataKey="count"
                              nameKey="status"
                              innerRadius={0}
                              outerRadius={75}
                              stroke="#fff"
                              strokeWidth={2}
                            >
                              {statusData.map((entry, index) => (
                                <Cell fill={statusColors[index % statusColors.length]} key={entry.status} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} lịch hẹn`, statusLabels[String(name)] || String(name)]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <ul className="pie-legend" role="list">
                        {statusData.map((item, index) => (
                          <li className="legend-row" key={item.status}>
                            <span aria-hidden="true" style={{ backgroundColor: statusColors[index % statusColors.length] }} />
                            <p>{statusLabels[item.status] || item.status}</p>
                            <strong>{item.count}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : <p className="dashboard-empty-copy">Chưa có lịch hẹn nào được ghi nhận.</p>}
                </section>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  )
}
