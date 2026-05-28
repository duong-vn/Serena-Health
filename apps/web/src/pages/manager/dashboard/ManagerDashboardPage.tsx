import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { managerSidebarConfig } from '../managerSidebarConfig'
import './ManagerDashboardPage.css'

import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, CurrencyMetricIcon, MessageMetricIcon, PulseMetricIcon } from '../../../components/ui/metricIcons'
import { FilterButton } from '../../../components/ui/FilterButton'

const metrics: Array<{
  label: string
  value: string
  delta: string
  iconClassName: string
  icon: ReactNode
}> = [
  {
    label: 'Số lượt tư vấn Chatbot',
    value: '52',
    delta: '+11.3% so với hôm qua',
    iconClassName: 'metric-icon-blue',
    icon: <MessageMetricIcon />,
  },
  {
    label: 'Số lịch hẹn',
    value: '37',
    delta: '+5.2% so với hôm qua',
    iconClassName: 'metric-icon-yellow',
    icon: <ClockMetricIcon />,
  },
  {
    label: 'Tỷ lệ chuyển sang bác sĩ',
    value: '18%',
    delta: '-3.1% so với hôm qua',
    iconClassName: 'metric-icon-green',
    icon: <PulseMetricIcon />,
  },
  {
    label: 'Doanh thu',
    value: '56 trĐ',
    delta: '+8.7% so với hôm qua',
    iconClassName: 'metric-icon-pink',
    icon: <CurrencyMetricIcon />,
  },
]

const consultationData = [
  { time: '6 SA', consultations: 52 },
  { time: '7 SA', consultations: 62 },
  { time: '8 SA', consultations: 96 },
  { time: '9 SA', consultations: 120 },
  { time: '10 SA', consultations: 139 },
  { time: '11 SA', consultations: 134 },
  { time: '12 TR', consultations: 116 },
  { time: '1 CH', consultations: 92 },
  { time: '2 CH', consultations: 102 },
  { time: '3 CH', consultations: 112 },
  { time: '4 CH', consultations: 86 },
  { time: '5 CH', consultations: 66 },
]

const chatbotResults = [
  { name: 'Đã xử lý', value: 64, color: '#8dc1ff' },
  { name: 'Chuyển bác sĩ', value: 18, color: '#adecbb' },
  { name: 'Nguy hiểm', value: 5, color: '#fb93a3' },
  { name: 'Không rõ', value: 13, color: '#ffdf7d' },
]

const branchData = [
  { branch: 'Chi nhánh A', appointments: 320, chatbot: 280, doctor: 92 },
  { branch: 'Chi nhánh B', appointments: 278, chatbot: 235, doctor: 70 },
  { branch: 'Chi nhánh C', appointments: 442, chatbot: 382, doctor: 118 },
]

const symptoms = [
  '#Đau đầu',
  '#Sốt',
  '#Ho',
  '#Đau bụng',
  '#Tiêu chảy',
  '#Mệt mỏi',
  '#Buồn nôn',
  '#Mất ngủ',
  '#Dị ứng',
  '#Khó thở',
  '#Chóng mặt',
]



function metricFormatter(value: number | string, name: string) {
  const labels: Record<string, string> = {
    consultations: 'Lượt tư vấn',
    appointments: 'Lịch hẹn',
    chatbot: 'Ca tư vấn Chatbot',
    doctor: 'Ca tư vấn Bác sĩ',
  }

  return [`${value} lượt`, labels[name] ?? name]
}

export function ManagerDashboardPage() {
  return (
    <div className="desktop-shell-page manager-dashboard-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main manager-dashboard-main" aria-label="Nội dung chính">
        <section className="manager-dashboard-content">
          <div className="dashboard-heading-row">
            <div>
              <h1>Dashboard</h1>
              <p>Trang xem thống kê dữ liệu theo thời gian thực của hệ thống Chatbot.</p>
            </div>
            <FilterButton label="Hôm nay" />
          </div>

          <div className="metrics-grid">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                delta={metric.delta}
                icon={metric.icon}
                iconClassName={metric.iconClassName}
              />
            ))}
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-card line-chart-card">
              <h2>Lượt tư vấn ChatBot theo từng khung giờ</h2>
              <div className="chart-frame">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consultationData} margin={{ top: 12, right: 18, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#d8d8d8" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#666' }} ticks={[0, 35, 70, 105, 140]} />
                    <Tooltip
                      cursor={{ stroke: '#8dc1ff', strokeWidth: 1 }}
                      formatter={(value, name) => metricFormatter(value as number | string, name as string)}
                      labelFormatter={(label) => `Khung giờ: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="consultations"
                      name="Lượt tư vấn"
                      stroke="#4a93ff"
                      strokeWidth={2}
                      fill="#dcebff"
                      fillOpacity={0.65}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card result-card">
              <h2>Kết quả xử lý chatbot</h2>
              <div className="result-card-body">
                <div className="donut-frame">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chatbotResults}
                        dataKey="value"
                        innerRadius={47}
                        outerRadius={72}
                        paddingAngle={4}
                        stroke="#fff"
                        strokeWidth={4}
                      >
                        {chatbotResults.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="result-legend">
                  {chatbotResults.map((item) => (
                    <div className="legend-item" key={item.name}>
                      <span style={{ backgroundColor: item.color }} />
                      <p>{item.name}</p>
                      <strong>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="dashboard-card branch-card">
              <h2>Số lịch hẹn / tư vấn theo chi nhánh</h2>
              <div className="branch-chart-frame">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData} margin={{ top: 8, right: 20, left: -10, bottom: 10 }} barGap={4}>
                    <CartesianGrid stroke="#d8d8d8" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="branch" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#666' }} ticks={[0, 150, 300, 450, 600]} />
                    <Tooltip
                      formatter={(value, name) => metricFormatter(value as number | string, name as string)}
                      labelFormatter={(label) => `Chi nhánh: ${label}`}
                    />
                    <Bar dataKey="appointments" name="Lịch hẹn" fill="#8dc1ff" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="chatbot" name="Ca tư vấn Chatbot" fill="#ffdf7d" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="doctor" name="Ca tư vấn Bác sĩ" fill="#adecbb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="branch-legend">
                <span className="legend-dot appointment" />
                Lịch hẹn
                <span className="legend-dot chatbot" />
                Ca tư vấn Chatbot
                <span className="legend-dot doctor" />
                Ca tư vấn Bác sĩ
              </div>
            </section>

            <section className="dashboard-card symptoms-card">
              <h2>Các triệu chứng phổ biến</h2>
              <div className="symptom-tags">
                {symptoms.map((symptom) => (
                  <span key={symptom}>{symptom}</span>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}
