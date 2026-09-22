import { useState } from 'react'

import { api } from '../../../api/client'
import { useApi } from '../../../api/useApi'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { IconButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, MessageMetricIcon, PulseMetricIcon, UsersMetricIcon } from '../../../components/ui/metricIcons'
import { SearchInput } from '../../../components/ui/SearchInput'
import './AppointmentListTab.css'

interface ApiAppointment {
  id: string
  startAt: string
  endAt: string
  status: string
  reason: string
  notes: string | null
  patient: { id: string; fullName: string; phone?: string }
}

interface AppointmentList { items: ApiAppointment[] }

export function AppointmentListTab({
  onBackToDashboard,
  onViewPatientProfile,
}: {
  onBackToDashboard?: () => void
  onViewPatientProfile?: (patientId: string) => void
}) {
  const { data, error, loading, reload } = useApi<AppointmentList>('/doctor/appointments')
  const appointments = data?.items || []
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null)
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const activeApp = appointments.find((a) => a.id === activeAppointmentId)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveNotes = async () => {
    if (!activeAppointmentId || !clinicalNotes.trim()) return
    setSubmitting(true)
    try {
      await api(`/doctor/appointments/${activeAppointmentId}`, {
        body: JSON.stringify({ notes: clinicalNotes.trim(), status: 'COMPLETED' }),
        method: 'PATCH',
      })
      triggerToast('Đã lưu kết quả khám thành công!')
      setActiveAppointmentId(null)
      setClinicalNotes('')
      reload()
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Không thể lưu ghi chú.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch = app.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || (app.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Array<DataTableColumn<ApiAppointment>> = [
    { key: 'index', header: 'STT', width: '50px', align: 'center', render: (_item, index) => index + 1 },
    { key: 'patient', header: 'Bệnh nhân', width: '220px', render: (item) => (
      <div className="doctor-cell">
        <div className="doctor-avatar" aria-hidden="true" style={{ background: '#E6EFFE' }}><svg viewBox="0 0 24 24" style={{ fill: '#244a6b', stroke: 'none' }}><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" /></svg></div>
        <div><strong>{item.patient.fullName}</strong><span>ID: {item.patient.id.slice(0, 8)}</span></div>
      </div>
    )},
    { key: 'time', header: 'Giờ hẹn', width: '150px', align: 'center', render: (item) => (
      <span className="time-highlight">{new Date(item.startAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
    )},
    { key: 'reason', header: 'Lý do khám', width: '200px', render: (item) => item.reason || '---' },
    { key: 'status', header: 'Trạng thái', width: '120px', align: 'center', render: (item) => (
      <span className={`status-pill ${item.status === 'PENDING' ? 'waiting' : item.status === 'CONFIRMED' ? 'processing' : 'done'}`}>{item.status}</span>
    )},
    { key: 'actions', header: 'Hành động', width: '148px', align: 'left', render: (item) => (
      <div className="table-actions">
        <IconButton label="Xem hồ sơ bệnh án" onClick={() => onViewPatientProfile?.(item.patient.id)} style={{ backgroundColor: '#E6EFFE', color: '#244A6B' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        </IconButton>
        {item.status !== 'COMPLETED' && (
          <IconButton label="Ghi kết quả khám" onClick={() => { setActiveAppointmentId(item.id); setClinicalNotes(item.notes || '') }} style={{ backgroundColor: '#E6EFFE', color: '#244A6B' }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /><path d="M15 14l1.5 1.5L19 13" /></svg>
          </IconButton>
        )}
      </div>
    )},
  ]

  return (
    <div className="appointment-list-tab-content">
      {toastMessage && <div className="emr-toast">{toastMessage}</div>}
      <header className="patient-tab-header">
        <div className="tab-titles"><h1>Lịch hẹn khám tại phòng khám</h1><p>Danh sách lịch hẹn khám của bác sĩ.</p></div>
      </header>

      <div className="metrics-grid doctor-metrics-grid" style={{ marginTop: '18px' }}>
        <MetricCard label="Tổng lịch hẹn" value={appointments.length} icon={<PulseMetricIcon />} iconClassName="metric-icon-blue" />
        <MetricCard label="Chờ tiếp nhận" value={appointments.filter((a) => a.status === 'PENDING').length} icon={<ClockMetricIcon />} iconClassName="metric-icon-yellow" />
        <MetricCard label="Đã hoàn thành" value={appointments.filter((a) => a.status === 'COMPLETED').length} icon={<UsersMetricIcon />} iconClassName="metric-icon-green" />
      </div>

      <div className="patient-toolbar">
        <div className="patient-toolbar-filters">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm theo tên bệnh nhân hoặc lý do" />
          <div className="sort-selector-container">
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Chờ tiếp nhận', value: 'PENDING' },
                { label: 'Đã xác nhận', value: 'CONFIRMED' },
                { label: 'Đã khám xong', value: 'COMPLETED' },
              ]}
            />
          </div>
        </div>
      </div>

      {loading ? <p className="doctor-data-state" role="status">Đang tải lịch hẹn...</p> : null}
      {error ? <p className="doctor-data-state" role="alert">{error.message}</p> : null}
      {!loading && !error ? (
        <div className="patient-table-frame">
          <DataTable rows={filteredAppointments} columns={columns} getRowKey={(a) => a.id} emptyState="Không có lịch hẹn nào." />
        </div>
      ) : null}

      {activeAppointmentId && activeApp && (
        <div className="emr-modal-overlay">
          <div className="emr-modal-container">
            <div className="emr-modal-header">
              <h3>Ghi kết quả khám & Kê đơn</h3>
              <button className="close-modal-btn" onClick={() => setActiveAppointmentId(null)}>×</button>
            </div>
            <div className="emr-modal-patient-info">
              <span>Bệnh nhân: <strong>{activeApp.patient.fullName}</strong></span>
            </div>
            <div className="emr-modal-body">
              <div className="form-input-group">
                <label htmlFor="clinical-notes">Kết luận lâm sàng / Đơn thuốc <span className="required-star">*</span></label>
                <textarea
                  id="clinical-notes"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Nhập chẩn đoán, dặn dò hoặc kê đơn..."
                  rows={4}
                />
              </div>
            </div>
            <div className="emr-modal-footer">
              <button className="emr-btn-outline" onClick={() => setActiveAppointmentId(null)}>Hủy</button>
              <button className="emr-btn-filled" disabled={submitting} onClick={handleSaveNotes}>
                {submitting ? 'Đang lưu...' : 'Hoàn thành lượt khám'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
