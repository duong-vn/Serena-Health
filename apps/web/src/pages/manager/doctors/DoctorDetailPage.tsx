import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { PrimaryButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { CalendarMetricIcon, CheckMetricIcon, StarMetricIcon, UsersMetricIcon } from '../../../components/ui/metricIcons'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { managerSidebarConfig } from '../managerSidebarConfig'
import { doctorToFormValues, formatCurrency, initialDoctorFormValues } from './doctorMockData'
import { DoctorFormSections } from './DoctorFormSections'
import { useDoctorsData } from './DoctorsDataContext'
import type { Doctor, DoctorFormErrors, DoctorFormValues } from './doctorTypes'
import { hasFormErrors, validateDoctorForm } from './doctorValidation'
import './DoctorManagement.css'

type DoctorTab = 'overview' | 'schedule' | 'appointments' | 'reviews' | 'performance'

const tabs: Array<{ id: DoctorTab; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'schedule', label: 'Lịch làm việc' },
  { id: 'appointments', label: 'Lịch hẹn' },
  { id: 'reviews', label: 'Đánh giá bệnh nhân' },
  { id: 'performance', label: 'Thống kê hiệu suất' },
]

function DoctorAvatar({ doctor }: { doctor: Doctor }) {
  return (
    <div className="doctor-detail-avatar" style={{ backgroundColor: doctor.avatarColor }} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </svg>
    </div>
  )
}

function StarIcon() {
  return (
    <svg className="doctor-star-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="doctor-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function DetailNotFound() {
  const navigate = useNavigate()

  return (
    <div className="desktop-shell-page doctor-management-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main doctor-management-main" aria-label="Không tìm thấy bác sĩ">
        <section className="doctor-page-content">
          <div className="doctor-detail-empty">
            <h1>Không tìm thấy bác sĩ</h1>
            <p>Hồ sơ bạn đang mở không còn tồn tại trong danh sách hiện tại.</p>
            <PrimaryButton onClick={() => navigate('/manager/doctors')}>Quay lại danh sách</PrimaryButton>
          </div>
        </section>
      </main>
    </div>
  )
}

function DoctorTabPanel({ doctor, activeTab }: { doctor: Doctor; activeTab: DoctorTab }) {
  if (activeTab === 'schedule') {
    return (
      <section className="doctor-tab-panel">
        <h2>Lịch làm việc cơ bản</h2>
        <div className="doctor-list-panel">
          {doctor.schedule.map((item) => (
            <div className="doctor-list-item" key={`${item.day}-${item.time}`}>
              <strong>{item.day}</strong>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (activeTab === 'appointments') {
    return (
      <section className="doctor-tab-panel">
        <h2>Lịch hẹn hôm nay</h2>
        <div className="doctor-list-panel">
          <div className="doctor-list-item">
            <strong>08:30 - Tư vấn trực tuyến</strong>
            <span>Trạng thái: Đã xác nhận</span>
          </div>
          <div className="doctor-list-item">
            <strong>10:15 - Khám tại chi nhánh</strong>
            <span>Trạng thái: Chờ tiếp nhận</span>
          </div>
        </div>
      </section>
    )
  }

  if (activeTab === 'reviews') {
    return (
      <section className="doctor-tab-panel">
        <h2>Đánh giá bệnh nhân</h2>
        <div className="doctor-list-panel">
          {doctor.reviews.map((review) => (
            <div className="doctor-list-item" key={review.id}>
              <strong>
                {review.patientName} · {review.rating.toFixed(1)}/5
              </strong>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (activeTab === 'performance') {
    return (
      <section className="doctor-tab-panel">
        <h2>Thống kê hiệu suất</h2>
        <div className="doctor-tab-grid">
          <InfoItem label="Tổng ca tư vấn" value={doctor.totalConsultations.toLocaleString('vi-VN')} />
          <InfoItem label="Tỉ lệ hoàn thành lịch" value={`${doctor.completionRate}%`} />
          <InfoItem label="Điểm CSAT" value={`${doctor.csat}/5`} />
          <InfoItem label="Đánh giá trung bình" value={`${doctor.rating.toFixed(1)}/5`} />
        </div>
      </section>
    )
  }

  return (
    <section className="doctor-tab-panel">
      <h2>Tổng quan chuyên môn</h2>
      <div className="doctor-tab-grid">
        <InfoItem label="Bằng cấp" value={doctor.degree} />
        <InfoItem label="Kinh nghiệm" value={`${doctor.yearsExperience} năm`} />
        <InfoItem label="Giá tư vấn" value={formatCurrency(doctor.consultationFee)} />
        <InfoItem label="Giá khám" value={formatCurrency(doctor.examinationFee)} />
      </div>
      <div className="doctor-list-item" style={{ marginTop: 14 }}>
        <strong>Mô tả ngắn</strong>
        <p>{doctor.shortBio}</p>
      </div>
    </section>
  )
}

export function DoctorDetailPage() {
  const navigate = useNavigate()
  const { doctorId } = useParams()
  const { doctors, getDoctorById, updateDoctor } = useDoctorsData()
  const doctor = doctorId ? getDoctorById(doctorId) : undefined
  const [activeTab, setActiveTab] = useState<DoctorTab>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<DoctorFormValues>(() => (doctor ? doctorToFormValues(doctor) : initialDoctorFormValues))
  const [errors, setErrors] = useState<DoctorFormErrors>({})

  useEffect(() => {
    if (doctor) {
      setValues(doctorToFormValues(doctor))
      setErrors({})
    }
  }, [doctor])

  const quickStats = useMemo(() => {
    if (!doctor) {
      return []
    }

    return [
      { label: 'Lịch hẹn hôm nay', value: doctor.appointmentsToday, icon: <CalendarMetricIcon />, iconClassName: 'metric-icon-blue' },
      { label: 'Tổng ca tư vấn', value: doctor.totalConsultations, icon: <UsersMetricIcon />, iconClassName: 'metric-icon-green' },
      { label: 'Tỉ lệ hoàn thành lịch', value: `${doctor.completionRate}%`, icon: <CheckMetricIcon />, iconClassName: 'metric-icon-yellow' },
      { label: 'Điểm CSAT', value: `${doctor.csat}/5`, icon: <StarMetricIcon />, iconClassName: 'metric-icon-pink' },
    ]
  }, [doctor])

  if (!doctor) {
    return <DetailNotFound />
  }

  const updateField = <Key extends keyof DoctorFormValues>(field: Key, value: DoctorFormValues[Key]) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const cancelEdit = () => {
    setValues(doctorToFormValues(doctor))
    setErrors({})
    setIsEditing(false)
  }

  const saveEdit = () => {
    const nextErrors = validateDoctorForm(values, doctors, doctor.id)
    setErrors(nextErrors)

    if (hasFormErrors(nextErrors)) {
      return
    }

    updateDoctor(doctor.id, values)
    setIsEditing(false)
  }

  return (
    <div className="desktop-shell-page doctor-management-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main doctor-management-main" aria-label="Chi tiết bác sĩ">
        <section className="doctor-page-content">
          <div className="doctor-detail-actions">
            <PrimaryButton variant="secondary" onClick={() => navigate('/manager/doctors')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </PrimaryButton>
            <div className="doctor-form-actions">
              {isEditing ? (
                <>
                  <PrimaryButton variant="ghost" onClick={cancelEdit}>
                    Hủy
                  </PrimaryButton>
                  <PrimaryButton onClick={saveEdit}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                    Lưu
                  </PrimaryButton>
                </>
              ) : (
                <PrimaryButton onClick={() => setIsEditing(true)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 20h9M16.5 3.5l4 4L8 20H4v-4L16.5 3.5Z" />
                  </svg>
                  Chỉnh sửa thông tin
                </PrimaryButton>
              )}
            </div>
          </div>

          <div className="doctor-detail-title">
            <h1>Hồ sơ bác sĩ</h1>
            <p>Xem thông tin tổng quan, lịch làm việc và hiệu suất chăm sóc bệnh nhân.</p>
          </div>

          <section className="doctor-detail-hero">
            <div className="doctor-overview-card">
              <DoctorAvatar doctor={doctor} />
              <div className="doctor-overview-copy">
                <h2>{doctor.fullName}</h2>
                <p>{doctor.email}</p>
                <p>{doctor.phone}</p>
                <span className="doctor-rating-pill">
                  <StarIcon />
                  {doctor.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="doctor-info-grid">
              <InfoItem label="Chi nhánh" value={doctor.branch} />
              <InfoItem label="Chuyên khoa" value={doctor.specialty} />
              <div className="doctor-info-item">
                <span>Trạng thái</span>
                <strong>
                  <StatusBadge status={doctor.status} />
                </strong>
              </div>
              <InfoItem label="Đánh giá trung bình" value={`${doctor.rating.toFixed(1)}/5`} />
            </div>
          </section>

          <div className="metrics-grid doctor-quick-stats">
            {quickStats.map((stat) => (
              <MetricCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconClassName={stat.iconClassName} />
            ))}
          </div>

          {isEditing ? (
            <DoctorFormSections values={values} errors={errors} includeAccountSection={false} onChange={updateField} />
          ) : null}

          <div className="doctor-tabs" role="tablist" aria-label="Nội dung hồ sơ bác sĩ">
            {tabs.map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? 'active' : undefined}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <DoctorTabPanel doctor={doctor} activeTab={activeTab} />
        </section>
      </main>
    </div>
  )
}
