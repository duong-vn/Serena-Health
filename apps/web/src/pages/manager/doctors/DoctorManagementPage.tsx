import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { IconButton, PrimaryButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { CheckMetricIcon, ClockMetricIcon, StarMetricIcon, UsersMetricIcon } from '../../../components/ui/metricIcons'
import { SearchInput } from '../../../components/ui/SearchInput'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { managerSidebarConfig } from '../managerSidebarConfig'
import { branches, deriveDoctorStatus, specialties } from './doctorMockData'
import { useDoctorsData } from './DoctorsDataContext'
import type { Doctor } from './doctorTypes'
import './DoctorManagement.css'

const doctorsPerPage = 5

function StarIcon() {
  return (
    <svg className="doctor-star-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function DoctorAvatar() {
  return (
    <div className="doctor-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" />
      </svg>
    </div>
  )
}

export function DoctorManagementPage() {
  const navigate = useNavigate()
  const { doctors, deleteDoctor } = useDoctorsData()
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [branch, setBranch] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteCandidate, setDeleteCandidate] = useState<Doctor | null>(null)

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        doctor.fullName.toLowerCase().includes(normalizedQuery) ||
        doctor.id.includes(normalizedQuery) ||
        doctor.email.toLowerCase().includes(normalizedQuery) ||
        doctor.phone.includes(normalizedQuery)
      const matchesSpecialty = specialty === 'all' || doctor.specialty === specialty
      const matchesBranch = branch === 'all' || doctor.branch === branch

      return matchesQuery && matchesSpecialty && matchesBranch
    })
  }, [branch, doctors, query, specialty])

  const pageCount = Math.max(1, Math.ceil(filteredDoctors.length / doctorsPerPage))
  const pagedDoctors = filteredDoctors.slice((currentPage - 1) * doctorsPerPage, currentPage * doctorsPerPage)
  const visiblePages = useMemo(() => {
    if (pageCount <= 3) {
      return Array.from({ length: pageCount }, (_item, index) => index + 1)
    }

    if (currentPage <= 2) {
      return [1, 2, 3]
    }

    if (currentPage >= pageCount - 1) {
      return [pageCount - 2, pageCount - 1, pageCount]
    }

    return [currentPage - 1, currentPage, currentPage + 1]
  }, [currentPage, pageCount])

  useEffect(() => {
    setCurrentPage(1)
  }, [branch, query, specialty])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  const onlineDoctors = doctors.filter((doctor) => deriveDoctorStatus(doctor) === 'online').length
  const busyDoctors = doctors.filter((doctor) => deriveDoctorStatus(doctor) === 'busy').length
  const averageRating =
    doctors.length > 0
      ? (doctors.reduce((sum, doctor) => sum + doctor.rating, 0) / doctors.length).toFixed(1)
      : '0.0'

  const columns: Array<DataTableColumn<Doctor>> = [
    {
      key: 'index',
      header: 'STT',
      width: '50px',
      align: 'center',
      render: (_doctor, index) => (currentPage - 1) * doctorsPerPage + index + 1,
    },
    {
      key: 'doctor',
      header: 'Bác sĩ',
      width: '220px',
      render: (doctor) => (
        <div className="doctor-cell">
          <DoctorAvatar />
          <div>
            <strong>{doctor.fullName}</strong>
            <span>ID: {doctor.id}</span>
          </div>
        </div>
      ),
    },
    { key: 'specialty', header: 'Chuyên khoa', width: '170px', align: 'center', render: (doctor) => doctor.specialty },
    { key: 'branch', header: 'Chi nhánh', width: '170px', align: 'center', render: (doctor) => doctor.branch },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      align: 'center',
      render: (doctor) => <StatusBadge status={deriveDoctorStatus(doctor)} />,
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      width: '120px',
      align: 'center',
      render: (doctor) => (
        <span className="rating-cell">
          <StarIcon />
          {doctor.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '118px',
      align: 'center',
      render: (doctor) => (
        <div className="table-actions">
          <IconButton label="Xem hoặc sửa thông tin" onClick={() => navigate(`/manager/doctors/${doctor.id}`)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
              <circle cx="12" cy="12" r="2.4" />
            </svg>
          </IconButton>
          <IconButton label="Xóa bác sĩ" variant="danger" onClick={() => setDeleteCandidate(doctor)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 6.5h15" />
              <path d="M9.5 6.5V4.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7" />
              <path d="M17.5 6.5 16.8 19c-.1.9-.8 1.5-1.7 1.5H8.9c-.9 0-1.6-.6-1.7-1.5L6.5 6.5" />
              <path d="M10 10.5v6M14 10.5v6" />
            </svg>
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <div className="desktop-shell-page doctor-management-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main doctor-management-main" aria-label="Quản lý bác sĩ">
        <section className="doctor-page-content">
          <div className="doctor-heading-row">
            <div>
              <h1>Quản lý Bác sĩ</h1>
              <p>Trang quản lý hồ sơ bác sĩ trong chuỗi phòng khám.</p>
            </div>
          </div>

          <div className="metrics-grid doctor-metrics-grid">
            <MetricCard
              label="Tổng số bác sĩ"
              value={doctors.length}
              icon={<UsersMetricIcon />}
              iconClassName="metric-icon-blue"
            />
            <MetricCard
              label="Bác sĩ hoạt động"
              value={onlineDoctors}
              icon={<CheckMetricIcon />}
              iconClassName="metric-icon-green"
            />
            <MetricCard
              label="Bác sĩ đang bận"
              value={busyDoctors}
              icon={<ClockMetricIcon />}
              iconClassName="metric-icon-purple"
            />
            <MetricCard
              label="Trung bình đánh giá"
              value={averageRating}
              icon={<StarMetricIcon />}
              iconClassName="metric-icon-yellow"
            />
          </div>

          <div className="doctor-toolbar">
            <div className="doctor-toolbar-filters">
              <SearchInput value={query} onChange={setQuery} placeholder="Tìm kiếm bác sĩ..." />
              <FilterSelect
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                options={[
                  { value: 'all', label: 'Chuyên khoa' },
                  ...specialties.map((item) => ({ value: item, label: item })),
                ]}
              />
              <FilterSelect
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                options={[
                  { value: 'all', label: 'Chi nhánh' },
                  ...branches.map((item) => ({ value: item, label: item })),
                ]}
              />
            </div>
            <PrimaryButton onClick={() => navigate('/manager/doctors/new')}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm bác sĩ mới
            </PrimaryButton>
          </div>

          <DataTable
            rows={pagedDoctors}
            columns={columns}
            getRowKey={(doctor) => doctor.id}
            emptyState="Không tìm thấy bác sĩ phù hợp."
          />

          <div className="doctor-pagination" aria-label="Phân trang">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              ‹
            </button>
            {visiblePages.map((page) => (
              <button
                type="button"
                className={page === currentPage ? 'active' : undefined}
                key={page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            >
              ›
            </button>
          </div>
        </section>

        {deleteCandidate ? (
          <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-doctor-title">
            <div className="confirm-dialog">
              <h2 id="delete-doctor-title">Xóa bác sĩ?</h2>
              <p>
                Hồ sơ <strong>{deleteCandidate.fullName}</strong> sẽ được xóa khỏi danh sách hiện tại.
              </p>
              <div className="confirm-actions">
                <PrimaryButton variant="ghost" onClick={() => setDeleteCandidate(null)}>
                  Hủy
                </PrimaryButton>
                <PrimaryButton
                  variant="danger"
                  onClick={() => {
                    deleteDoctor(deleteCandidate.id)
                    setDeleteCandidate(null)
                  }}
                >
                  Xóa
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
