import { useMemo, useState } from 'react'

import { useApi } from '../../../api/useApi'
import CalendarMonth from '../../../components/doctor-schedule/CalendarMonth'
import ShiftCard from '../../../components/doctor-schedule/ShiftCard'
import './DoctorSchedulePage.css'

interface ApiScheduleAppointment {
  id: string
  startAt: string
  endAt: string
  status: string
  patient: { id: string; fullName: string }
}

interface ApiScheduleItem {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
  appointments?: ApiScheduleAppointment[]
}

interface ScheduleList { items: ApiScheduleItem[] }

const dayOfWeekNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

const SchedulePage = ({ onBackToDashboard }: { onBackToDashboard?: () => void }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })

  const { data, error, loading } = useApi<ScheduleList>('/doctor/schedule')
  const schedules = data?.items || []

  const currentDayOfWeek = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.getDay()
  }, [selectedDate])

  const shiftsOfDay = useMemo(() => {
    return schedules.filter((s) => s.dayOfWeek === currentDayOfWeek && s.active)
  }, [schedules, currentDayOfWeek])

  return (
    <div className="schedule-page">
      <header className="page-header">
        <h2>Lịch làm việc</h2>
        <p>Xem các ca làm việc và lịch khám thực tế được phân công.</p>
      </header>

      <main className="schedule-content">
        <div className="left-column">
          <CalendarMonth selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        <div className="right-column">
          <div className="section-card">
            <h3>Ca trực ngày {selectedDate} ({dayOfWeekNames[currentDayOfWeek]})</h3>
            {loading ? <p className="doctor-data-state" role="status">Đang tải lịch...</p> : null}
            {error ? <p className="doctor-data-state" role="alert">{error.message}</p> : null}
            {!loading && !error && shiftsOfDay.length === 0 ? (
              <p className="doctor-data-state">Không có ca trực nào trong ngày này.</p>
            ) : null}
            {shiftsOfDay.map((shift) => (
              <ShiftCard
                key={shift.id}
                title={`Ca làm việc: ${shift.startTime} - ${shift.endTime}`}
                time={`${shift.startTime} - ${shift.endTime}`}
                count={shift.appointments?.length || 0}
                status={shift.active ? 'active' : 'inactive'}
                onViewDetail={() => {}}
                isSelected={false}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default SchedulePage
