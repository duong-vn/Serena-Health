import { useEffect, useState } from 'react'

import { useApi } from '../../../api/useApi'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { IconButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, PulseMetricIcon, UsersMetricIcon, MessageMetricIcon } from '../../../components/ui/metricIcons'
import { SearchInput } from '../../../components/ui/SearchInput'
import { ReturnButton } from '../../../components/ui/ReturnButton'
import './PatientListTab.css'

interface ApiPatient {
  id: string
  fullName: string
  phone: string
  gender: string
  birthday: string
  address: string
  medicalHistory: string[]
  allergies: string[]
}

interface PatientList { items: ApiPatient[] }

export function PatientListTab({
  onBackToDashboard,
  initialActivePatientId,
  onClearActivePatient,
}: {
  onBackToDashboard?: () => void
  initialActivePatientId?: string | null
  onClearActivePatient?: () => void
}) {
  const { data, error, loading } = useApi<PatientList>('/doctor/patients')
  const patients = data?.items || []
  const [activePatientId, setActivePatientId] = useState<string | null>(initialActivePatientId || null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả')

  useEffect(() => {
    if (initialActivePatientId) setActivePatientId(initialActivePatientId)
  }, [initialActivePatientId])

  const activePatient = patients.find((patient) => patient.id === activePatientId)

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || patient.phone.includes(searchTerm)
    return matchesSearch
  })

  if (activePatientId && activePatient) {
    const patient = activePatient
    return (
      <div className="emr-view-container">
        <ReturnButton onClick={() => { setActivePatientId(null); onClearActivePatient?.() }} title="Quay lại danh sách" style={{ marginBottom: '16px' }} />
        <div className="emr-view-header-block"><h1 className="emr-view-title">HỒ SƠ BỆNH NHÂN</h1></div>
        <section className="emr-profile-section">
          <div className="emr-avatar-circle">{patient.fullName.split(' ').pop()?.[0]}</div>
          <div className="emr-profile-box">
            <div className="profile-detail-item"><span className="detail-label">Họ tên:</span><strong className="detail-value">{patient.fullName}</strong></div>
            <div className="profile-detail-item"><span className="detail-label">Giới tính:</span><strong className="detail-value">{patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</strong></div>
            <div className="profile-detail-item"><span className="detail-label">Số điện thoại:</span><strong className="detail-value">{patient.phone || 'Chưa cập nhật'}</strong></div>
            <div className="profile-detail-item"><span className="detail-label">Ngày sinh:</span><strong className="detail-value">{patient.birthday ? new Date(patient.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</strong></div>
          </div>
        </section>
        <hr className="emr-divider" />
        <div className="emr-two-columns">
          <div className="emr-col-left">
            <article className="emr-column-card" style={{ height: '100%' }}>
              <h3 className="emr-column-title">Tiền sử bệnh lý</h3>
              {patient.medicalHistory.length ? (
                <ul className="history-bullets">{patient.medicalHistory.map((item, index) => <li key={index}>{item}</li>)}</ul>
              ) : <p className="emr-no-notes">Chưa ghi nhận tiền sử bệnh lý.</p>}
            </article>
          </div>
          <div className="emr-col-right">
            <article className="emr-column-card" style={{ height: '100%' }}>
              <h3 className="emr-column-title">Cảnh báo dị ứng</h3>
              <div className="allergy-warn-box">
                <span className="warn-label">Dị ứng ghi nhận:</span>
                <strong className={`warn-val ${patient.allergies.length > 0 ? 'alert-red' : ''}`}>
                  {patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Chưa ghi nhận dị ứng'}
                </strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  const columns: Array<DataTableColumn<ApiPatient>> = [
    { key: 'index', header: 'STT', width: '60px', align: 'center', render: (_item, index) => index + 1 },
    { key: 'patient', header: 'Bệnh nhân', width: '240px', render: (item) => (
      <div className="doctor-cell">
        <div className="doctor-avatar" aria-hidden="true" style={{ background: '#E6EFFE' }}><svg viewBox="0 0 24 24" style={{ fill: '#244a6b', stroke: 'none' }}><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" /></svg></div>
        <div><strong>{item.fullName}</strong><span>{(item.gender === 'MALE' ? 'Nam' : item.gender === 'FEMALE' ? 'Nữ' : 'Khác')}</span></div>
      </div>
    )},
    { key: 'phone', header: 'Số điện thoại', width: '140px', align: 'center', render: (item) => item.phone || '---' },
    { key: 'birthday', header: 'Ngày sinh', width: '130px', align: 'center', render: (item) => item.birthday ? new Date(item.birthday).toLocaleDateString('vi-VN') : '---' },
    { key: 'actions', header: 'Hành động', width: '120px', align: 'left', render: (item) => (
      <div className="table-actions">
        <IconButton label="Xem hồ sơ" onClick={() => { setActivePatientId(item.id) }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        </IconButton>
      </div>
    )},
  ]

  return (
    <div className="patient-page-content">
      <header className="patient-tab-header">
        <div className="tab-titles"><h1>Danh sách bệnh nhân</h1><p>Bệnh nhân được phân công cho bác sĩ.</p></div>
      </header>

      <div className="metrics-grid doctor-metrics-grid" style={{ marginTop: '18px' }}>
        <MetricCard label="Tổng bệnh nhân" value={patients.length} icon={<UsersMetricIcon />} iconClassName="metric-icon-blue" />
      </div>

      <div className="patient-toolbar">
        <div className="patient-toolbar-filters">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Tìm kiếm bệnh nhân..." />
        </div>
      </div>

      {loading ? <p className="doctor-data-state" role="status">Đang tải danh sách bệnh nhân...</p> : null}
      {error ? <p className="doctor-data-state" role="alert">{error.message}</p> : null}
      {!loading && !error ? (
        <div className="patient-table-frame">
          <DataTable rows={filteredPatients} columns={columns} getRowKey={(patient) => patient.id} emptyState="Chưa có bệnh nhân nào." />
        </div>
      ) : null}
    </div>
  )
}
