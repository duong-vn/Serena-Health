import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import './ManagerReportAnalysisPage.css'

import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, CurrencyMetricIcon, MessageMetricIcon, StarMetricIcon } from '../../../components/ui/metricIcons'
import { FilterButton } from '../../../components/ui/FilterButton'
import { FilterSelect } from '../../../components/ui/FilterSelect'

const metrics: Array<{
  label: string
  value: string
  delta: string
  iconClassName: string
  icon: ReactNode
}> = [
  {
    label: 'Tổng lượt tư vấn Chatbot',
    value: '3,420',
    delta: '+12.5% so với tháng trước',
    iconClassName: 'metric-icon-blue',
    icon: <MessageMetricIcon />,
  },
  {
    label: 'Tổng lịch hẹn khám',
    value: '1,284',
    delta: '+8.2% so với tháng trước',
    iconClassName: 'metric-icon-yellow',
    icon: <ClockMetricIcon />,
  },
  {
    label: 'Doanh thu',
    value: '2.4 Tỷ',
    delta: '+15.4% so với tháng trước',
    iconClassName: 'metric-icon-pink',
    icon: <CurrencyMetricIcon />,
  },
  {
    label: 'Điểm CSAT trung bình',
    value: '4.8/5',
    delta: '+0.2 điểm so với tháng trước',
    iconClassName: 'metric-icon-green',
    icon: <StarMetricIcon />,
  },
]

// 1. Bar Chart: So sánh hiệu suất/doanh thu (bar chart) của từng chi nhánh
const branchPerformanceData = [
  { branch: 'Chi nhánh A', chatbot: 1200, doctor: 450, completed: 380, revenue: 800 },
  { branch: 'Chi nhánh B', chatbot: 980, doctor: 320, completed: 290, revenue: 650 },
  { branch: 'Chi nhánh C', chatbot: 1240, doctor: 510, completed: 460, revenue: 950 },
]

// 2. Line Chart: Hiệu quả vận hành của Chatbot (Line Chart)
const chatbotEfficiencyData = [
  { month: 'T1', success: 68, drop: 15, transfer: 17 },
  { month: 'T2', success: 72, drop: 14, transfer: 14 },
  { month: 'T3', success: 75, drop: 12, transfer: 13 },
  { month: 'T4', success: 79, drop: 10, transfer: 11 },
  { month: 'T5', success: 82, drop: 8, transfer: 10 },
]

// 3. Pie Chart: Xu hướng lịch hẹn khám (Pie Chart)
const appointmentTrends = [
  { name: 'Hoàn thành', value: 75, color: '#adecbb' },
  { name: 'Đã hủy', value: 15, color: '#fb93a3' },
  { name: 'Đang xử lý', value: 10, color: '#ffdf7d' },
]

// 4. Horizontal Bar Chart: Phân bố chuyên khoa được tư vấn nhiều nhất
const specialtyData = [
  { name: 'Nội khoa', value: 850 },
  { name: 'Nhi khoa', value: 620 },
  { name: 'Tai Mũi Họng', value: 540 },
  { name: 'Da liễu', value: 480 },
  { name: 'Sản phụ khoa', value: 410 },
]



function metricFormatter(value: number | string, name: string) {
  const labels: Record<string, string> = {
    chatbot: 'Tư vấn Chatbot',
    doctor: 'Tư vấn Bác sĩ',
    completed: 'Lịch khám hoàn thành',
    revenue: 'Doanh thu (Tr VNĐ)',
    success: 'Thành công (%)',
    drop: 'Dừng giữa chừng (%)',
    transfer: 'Chuyển Bác sĩ (%)',
    value: 'Lượt tư vấn',
  }
  return [value, labels[name] ?? name]
}

export function ManagerReportAnalysisPage() {
  return (
    <div className="desktop-shell-page manager-report-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main manager-report-main" aria-label="Nội dung báo cáo">
        <section className="manager-report-content">
          <div className="report-heading-row">
            <div>
              <h1>Báo cáo - Thống kê</h1>
              <p>Thống kê theo toàn bộ thời gian hệ thống hoạt động.</p>
            </div>
            <div className="report-actions">
              <div className="report-filters">
                <FilterSelect
                  defaultValue="current-month"
                  options={[
                    { value: 'current-month', label: 'Tháng hiện tại' },
                    { value: 'last-month', label: 'Tháng trước' },
                    { value: 'ytd', label: 'Từ đầu năm' },
                    { value: 'all', label: 'Toàn thời gian' },
                  ]}
                />
                <FilterSelect
                  defaultValue="all-branches"
                  options={[
                    { value: 'all-branches', label: 'Tất cả chi nhánh' },
                    { value: 'branch-a', label: 'Chi nhánh A' },
                    { value: 'branch-b', label: 'Chi nhánh B' },
                    { value: 'branch-c', label: 'Chi nhánh C' },
                  ]}
                />
              </div>
              <button className="export-excel-button" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="13" x2="16" y2="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="17" x2="16" y2="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10 9 9 9 8 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Xuất Excel</span>
              </button>
            </div>
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

          <div className="report-grid">
            {/* 1. Bar Chart */}
            <section className="report-card branch-performance-card">
              <h2>So sánh hiệu suất & doanh thu theo chi nhánh</h2>
              <div className="report-chart-frame">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchPerformanceData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} barGap={6}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="branch" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value, name) => metricFormatter(value as number | string, name as string)}
                      cursor={{fill: '#f1f5f9'}}
                    />
                    <Bar dataKey="chatbot" name="Chatbot" fill="#8dc1ff" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="doctor" name="Bác sĩ" fill="#adecbb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Khám HT" fill="#ffdf7d" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#f0627d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="report-legend">
                <span className="legend-dot" style={{background: '#8dc1ff'}} /> Tư vấn Chatbot
                <span className="legend-dot" style={{background: '#adecbb'}} /> Tư vấn Bác sĩ
                <span className="legend-dot" style={{background: '#ffdf7d'}} /> Lịch khám hoàn thành
                <span className="legend-dot" style={{background: '#f0627d'}} /> Doanh thu
              </div>
            </section>

            {/* 2. Line Chart */}
            <section className="report-card chatbot-efficiency-card">
              <h2>Hiệu quả vận hành Chatbot</h2>
              <div className="report-chart-frame">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chatbotEfficiencyData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value, name) => metricFormatter(value as number | string, name as string)}
                    />
                    <Line type="monotone" dataKey="success" name="Thành công" stroke="#62d985" strokeWidth={3} dot={{r: 4, fill: '#62d985', strokeWidth: 0}} />
                    <Line type="monotone" dataKey="drop" name="Dừng giữa chừng" stroke="#f0627d" strokeWidth={3} dot={{r: 4, fill: '#f0627d', strokeWidth: 0}} />
                    <Line type="monotone" dataKey="transfer" name="Chuyển Bác sĩ" stroke="#ffb800" strokeWidth={3} dot={{r: 4, fill: '#ffb800', strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="report-legend">
                <span className="legend-dot" style={{background: '#62d985'}} /> Giải quyết thành công
                <span className="legend-dot" style={{background: '#f0627d'}} /> Dừng giữa chừng
                <span className="legend-dot" style={{background: '#ffb800'}} /> Chuyển sang Bác sĩ
              </div>
            </section>

            <div className="report-bottom-row">
              {/* 3. Pie Chart */}
              <section className="report-card pie-chart-card">
                <h2>Xu hướng lịch hẹn khám</h2>
                <div className="report-chart-frame pie-frame">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appointmentTrends}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        stroke="#fff"
                        strokeWidth={4}
                      >
                        {appointmentTrends.map((entry) => (
                          <Cell fill={entry.color} key={entry.name} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="pie-legend">
                  {appointmentTrends.map((item) => (
                    <div className="legend-item" key={item.name}>
                      <span style={{ backgroundColor: item.color }} />
                      <p>{item.name}</p>
                      <strong>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Horizontal Bar Chart */}
              <section className="report-card specialty-card">
                <h2>Phân bố chuyên khoa tư vấn nhiều nhất</h2>
                <div className="report-chart-frame horizontal-bar-frame">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={specialtyData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }} barSize={20}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#475569' }} width={90} />
                      <Tooltip
                        formatter={(value, name) => metricFormatter(value as number | string, name as string)}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="value" name="Lượt tư vấn" fill="#8dc1ff" radius={[0, 4, 4, 0]}>
                        {specialtyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8dc1ff' : '#b3d4ff'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
