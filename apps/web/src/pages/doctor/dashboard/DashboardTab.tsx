import { useState } from 'react'
import CalendarMonth from '../../../components/doctor-schedule/CalendarMonth'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { MetricCard } from '../../../components/ui/MetricCard'
import { SCHEDULE_DATA } from '../../../data/scheduleData'
import './DashboardTab.css'

type MetricCardProps = {
  title: string
  value: string | number
  color: string
  iconType: 'calendar' | 'clock' | 'message' | 'check'
}

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export function DashboardTab({ 
  onNavigateTab,
  onViewPatientProfile,
  onViewChatMessage
}: { 
  onNavigateTab?: (tab: string) => void;
  onViewPatientProfile?: (patientId: string) => void;
  onViewChatMessage?: (chatId: string) => void;
}) {
  const [selectedMonth, setSelectedMonth] = useState<number>(5)
  const [selectedDay, setSelectedDay] = useState<number>(10)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  // States for Date Filter (Hôm nay, Ngày mai, ...)
  const [selectedFilter, setSelectedFilter] = useState<string>('Hôm nay')
  const [isFilterPickerOpen, setIsFilterPickerOpen] = useState<boolean>(false)

  const filterOptions = ['Hôm nay', 'Tuần này', 'Tháng này']

  const patients = [
    { id: '1', name: 'Nguyễn Văn A', age: 45, time: '2 giờ trước', symptoms: 'Sốt, đau đầu, ho' },
    { id: '2', name: 'Trần Thị B', age: 36, time: '5 giờ trước', symptoms: 'Đau bụng, buồn nôn' },
    { id: '3', name: 'Lê Văn C', age: 58, time: '1 ngày trước', symptoms: 'Đau ngực, khó thở' },
  ]

  const messages = [
    { id: '1', name: 'Nguyễn Văn A', text: 'Bác sĩ ơi, dạo này tôi hay thấy chóng mặt và suy ...', time: '09:36' },
    { id: '4', name: 'Nguyễn Thị N', text: 'Xin chào bác sĩ, tôi đang gặp tình trạng đau đầu...', time: '09:36' },
  ]
  const icons = {
    pulse: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 13h3.5l2-6 4 11 2.3-5H20" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    message: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  };
  // Programmatically generate calendar rows for selectedMonth in 2026
  const getCalendarRows = (month: number) => {
    const year = 2026
    const firstDayIndex = new Date(year, month - 1, 1).getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const totalDays = new Date(year, month, 0).getDate()

    const rows = []
    let currentRow = []

    // Fill initial empty cells
    for (let i = 0; i < firstDayIndex; i++) currentRow.push(null)

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const hasEvent = !!SCHEDULE_DATA[dateStr]
      currentRow.push({ day, hasEvent, active: day === selectedDay })
      if (currentRow.length === 7) { rows.push(currentRow); currentRow = [] }
    }
    if (currentRow.length > 0) {
      while (currentRow.length < 7) currentRow.push(null)
      rows.push(currentRow)
    }
    return rows
  }
  const calendarRows = getCalendarRows(selectedMonth)

  // Dynamic metrics computed based on the selected month AND the filter
  const filterMultiplier = selectedFilter === 'Tuần này' ? 5 : selectedFilter === 'Tháng này' ? 20 : 1
  const appointmentsCount = Math.floor((12 + (selectedMonth - 5) * 2) * filterMultiplier)
  const pendingCount = Math.floor((8 + (selectedMonth - 5)) * filterMultiplier)
  const processingCount = Math.floor((5 + Math.floor((selectedMonth - 5) / 2)) * filterMultiplier)
  const completedCount = Math.floor((5 + Math.floor((selectedMonth - 5) / 3)) * filterMultiplier)

  const getDeltaText = (baseDelta: string) => {
    if (selectedFilter === 'Hôm nay') return `${baseDelta} so với hôm qua`;
    if (selectedFilter === 'Tuần này') return `${baseDelta} so với tuần trước`;
    if (selectedFilter === 'Tháng này') return `${baseDelta} so với tháng trước`;
    return baseDelta;
  }

  return (
    <div className="figma-dashboard-tab">
      <header className="figma-dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Trang xem thống kê của bác sĩ</p>
        </div>

        <FilterSelect
          value={selectedFilter}
          options={filterOptions.map(opt => ({ label: opt, value: opt }))}
          onChange={(e) => setSelectedFilter(e.target.value)}
        />
      </header>

      <section className="figma-metrics-row">
        <MetricCard label="Tổng số lịch hẹn" value={appointmentsCount} delta={getDeltaText("+2%")} icon={icons.pulse} iconClassName="metric-icon-blue" />
        <MetricCard label="Ca chờ tư vấn" value={pendingCount} delta={getDeltaText("-1")} icon={icons.clock} iconClassName="metric-icon-yellow" />
        <MetricCard label="Ca đang xử lý" value={processingCount} delta={getDeltaText("+0")} icon={icons.message} iconClassName="metric-icon-pink" />
        <MetricCard label="Ca hoàn thành" value={completedCount} delta={getDeltaText("+12%")} icon={icons.star} iconClassName="metric-icon-green" />
      </section>

      <div className="figma-dashboard-grid">
        <div className="grid-column-left">
          {/* Bệnh nhân gần đây */}
          <section className="figma-section-card">
            <div className="section-header">
              <h2>Các bệnh nhân gần đây</h2>
              <button className="view-all-btn" onClick={() => onNavigateTab?.('Danh sách bệnh nhân')}>Xem tất cả {ChevronIcon()}</button>
            </div>
            <div className="list-container">
              {patients.map((p, idx) => (
                <div className="patient-list-row" key={idx}>
                  <div className="row-left">
                    <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    </div>
                    <div className="meta-details">
                      <h3>{p.name} • {p.age} tuổi</h3>
                      <span className="time-sub">{p.time}</span>
                    </div>
                  </div>
                  <span className="symptom-text">{p.symptoms}</span>
                  <button 
                    className="action-btn-outline" 
                    onClick={() => onViewPatientProfile ? onViewPatientProfile(p.id) : onNavigateTab?.('Tư vấn trực tiếp')}
                  >
                    Xem ca
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Tin nhắn mới */}
          <section className="figma-section-card">
            <div className="section-header">
              <h2>Tin nhắn mới</h2>
              <button className="view-all-btn" onClick={() => onNavigateTab?.('Tư vấn trực tiếp')}>Xem tất cả {ChevronIcon()}</button>
            </div>
            <div className="list-container">
              {messages.map((m, idx) => (
                <div 
                  className="message-list-row" 
                  key={idx}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onViewChatMessage ? onViewChatMessage(m.id) : onNavigateTab?.('Tư vấn trực tiếp')}
                >
                  <div className="row-left">
                    <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    </div>
                    <div className="meta-details">
                      <h3>{m.name}</h3>
                      <p className="message-preview-text">{m.text}</p>
                    </div>
                  </div>
                  <span className="message-time-text" style={{ marginRight: '16px' }}>{m.time}</span>
                  <button className="action-btn-outline">Xem</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid-column-right">
          {/* Lịch tháng */}
          <section className="figma-section-card calendar-card dashboard-version">
            <CalendarMonth
              selectedDate={selectedDate}
              onDateSelect={(date) => setSelectedDate(date)}
              className="dashboard-calendar"
            />
            {/* Lịch hẹn sắp tới */}
            <div className="upcoming-section">
              <div className="section-header" style={{ marginTop: '24px' }}>
                <h2>Lịch hẹn sắp tới</h2>
                <button className="view-all-btn" onClick={() => onNavigateTab?.('Lịch hẹn khám')}>Xem tất cả {ChevronIcon()}</button>
              </div>
              <div className="appointment-mini-card">
                <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </div>
                <div className="meta-details">
                  <h3>Phạm Văn X</h3>
                  <span className="code-sub">Mã BN: #12346</span>
                </div>
                <span className="appointment-time">09:00</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}