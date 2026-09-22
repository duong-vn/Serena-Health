import { useState } from 'react'

import { useApi } from '../../../api/useApi'
import CalendarMonth from '../../../components/doctor-schedule/CalendarMonth'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { MetricCard } from '../../../components/ui/MetricCard'
import './DashboardTab.css'

interface ApiPatient {
  id: string
  fullName: string
  phone: string
  gender: string
  birthday: string
}

interface ApiAppointment {
  id: string
  startAt: string
  status: string
  reason: string
  patient: { id: string; fullName: string }
}

interface ApiConsultation {
  id: string
  status: string
  reason: string
  createdAt: string
  patient: { id: string; fullName: string }
}

interface PatientList { items: ApiPatient[] }
interface AppointmentList { items: ApiAppointment[] }
interface ConsultationList { items: ApiConsultation[] }

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
)

const icons = {
  pulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 13h3.5l2-6 4 11 2.3-5H20" /></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  message: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
}

export function DashboardTab({
  onNavigateTab,
  onViewPatientProfile,
  onViewChatMessage,
}: {
  onNavigateTab?: (tab: string) => void
  onViewPatientProfile?: (patientId: string) => void
  onViewChatMessage?: (chatId: string) => void
}) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })

  const { data: appointmentData, loading: apptLoading } = useApi<AppointmentList>('/doctor/appointments?status=PENDING')
  const { data: consultationData, loading: consultLoading } = useApi<ConsultationList>('/doctor/consultations')
  const { data: patientData } = useApi<PatientList>('/doctor/patients')

  const pendingAppointments = appointmentData?.items || []
  const openConsultations = consultationData?.items.filter((item) => item.status === 'OPEN' || item.status === 'CLAIMED') || []
  const completedConsultations = consultationData?.items.filter((item) => item.status === 'COMPLETED') || []
  const totalPatients = patientData?.items.length ?? 0

  return (
    <div className="figma-dashboard-tab">
      <header className="figma-dashboard-header">
        <div><h1>Dashboard</h1><p>Trang xem thống kê của bác sĩ</p></div>
      </header>

      <section className="figma-metrics-row">
        <MetricCard label="Tổng bệnh nhân" value={totalPatients} icon={icons.pulse} iconClassName="metric-icon-blue" />
        <MetricCard label="Ca chờ tư vấn" value={openConsultations.length} icon={icons.clock} iconClassName="metric-icon-yellow" />
        <MetricCard label="Lịch hẹn chờ" value={pendingAppointments.length} icon={icons.message} iconClassName="metric-icon-pink" />
        <MetricCard label="Ca hoàn thành" value={completedConsultations.length} icon={icons.star} iconClassName="metric-icon-green" />
      </section>

      <div className="figma-dashboard-grid">
        <div className="grid-column-left">
          <section className="figma-section-card">
            <div className="section-header">
              <h2>Bệnh nhân gần đây</h2>
              <button className="view-all-btn" onClick={() => onNavigateTab?.('Danh sách bệnh nhân')}>Xem tất cả <ChevronIcon /></button>
            </div>
            <div className="list-container">
              {apptLoading ? <p className="doctor-data-state" role="status">Đang tải...</p> : null}
              {!apptLoading && !patientData?.items.length ? <p className="doctor-data-state">Chưa có bệnh nhân.</p> : null}
              {(patientData?.items || []).slice(0, 3).map((patient) => (
                <div className="patient-list-row" key={patient.id}>
                  <div className="row-left">
                    <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                    </div>
                    <div className="meta-details">
                      <h3>{patient.fullName}</h3>
                      <span className="time-sub">{patient.phone}</span>
                    </div>
                  </div>
                  <button className="action-btn-outline" onClick={() => onViewPatientProfile?.(patient.id)}>Xem ca</button>
                </div>
              ))}
            </div>
          </section>

          <section className="figma-section-card">
            <div className="section-header">
              <h2>Tư vấn đang mở</h2>
              <button className="view-all-btn" onClick={() => onNavigateTab?.('Tư vấn trực tiếp')}>Xem tất cả <ChevronIcon /></button>
            </div>
            <div className="list-container">
              {consultLoading ? <p className="doctor-data-state" role="status">Đang tải...</p> : null}
              {!consultLoading && !openConsultations.length ? <p className="doctor-data-state">Không có ca tư vấn đang mở.</p> : null}
              {openConsultations.slice(0, 3).map((consultation) => (
                <div className="message-list-row" key={consultation.id} style={{ cursor: 'pointer' }} onClick={() => onViewChatMessage?.(consultation.id)}>
                  <div className="row-left">
                    <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                      <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                    </div>
                    <div className="meta-details">
                      <h3>{consultation.patient.fullName}</h3>
                      <p className="message-preview-text">{consultation.reason || 'Tư vấn'}</p>
                    </div>
                  </div>
                  <button className="action-btn-outline">Xem</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid-column-right">
          <section className="figma-section-card calendar-card dashboard-version">
            <CalendarMonth selectedDate={selectedDate} onDateSelect={(date) => setSelectedDate(date)} className="dashboard-calendar" />
            <div className="upcoming-section">
              <div className="section-header" style={{ marginTop: '24px' }}>
                <h2>Lịch hẹn sắp tới</h2>
                <button className="view-all-btn" onClick={() => onNavigateTab?.('Lịch hẹn khám')}>Xem tất cả <ChevronIcon /></button>
              </div>
              {pendingAppointments.slice(0, 2).map((appointment) => (
                <div className="appointment-mini-card" key={appointment.id}>
                  <div className="avatar-placeholder" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                  </div>
                  <div className="meta-details">
                    <h3>{appointment.patient.fullName}</h3>
                    <span className="code-sub">{appointment.reason || 'Khám'}</span>
                  </div>
                  <span className="appointment-time">{new Date(appointment.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
              {!apptLoading && !pendingAppointments.length ? <p className="doctor-data-state">Không có lịch hẹn sắp tới.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
