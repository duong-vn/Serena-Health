import { useEffect, useState } from 'react'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { IconButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, MessageMetricIcon, PulseMetricIcon, UsersMetricIcon, StarMetricIcon } from '../../../components/ui/metricIcons'
import { SearchInput } from '../../../components/ui/SearchInput'
import { ReturnButton } from '../../../components/ui/ReturnButton'
import './PatientListTab.css'

// Clinical-grade patient mock data with EMR elements matching the wireframe exactly
const initialPatients = [
  {
    id: '2',
    code: 'BN-2026-002',
    name: 'Trần Thị B',
    age: 28,
    gender: 'Nữ',
    status: 'Đang chờ',
    appointmentType: 'Tư vấn',
    triage: 'Khẩn cấp', // mapped for stats
    lastVisit: '24/05/2026',
    phone: '0987654321',
    disease: 'Đau ngực trái kéo dài',
    bloodType: 'O+',
    allergies: ['Hải sản'],
    history: ['Rối loạn lipid máu phát hiện năm 2024', 'Tiền sử gia đình: Bố bị nhồi máu cơ tim ở tuổi 50'],
    vitals: { bp: '135/85', hr: 104, temp: 36.8, spo2: 98, weight: 55, height: 158, bmi: 22.0 },
    pastEncounters: [
      {
        date: '24/05/2026',
        doctor: 'BS. Trần Hùng',
        diagnosis: 'Đau ngực trái không điển hình / Theo dõi thiếu máu cơ tim',
        symptoms: 'Đau nhói vùng ngực trái kéo dài khoảng 2-3 phút khi gắng sức, lan ra vai trái, không khó thở.',
        prescription: ['Nitroglycerin 0.5mg - Ngậm dưới lưỡi khi đau ngực dữ dội', 'Atorvastatin 10mg - 1 viên/ngày, uống tối trước đi ngủ', 'Aspirin 81mg - 1 viên/ngày, uống sáng sau ăn']
      },
      {
        date: '10/04/2026',
        doctor: 'BS. Trần Hùng',
        diagnosis: 'Rối loạn lipid máu hỗn hợp / Tăng huyết áp độ I',
        symptoms: 'Khám định kỳ sức khỏe tim mạch, thỉnh thoảng đau đầu nhẹ khi căng thẳng, không đau ngực.',
        prescription: ['Atorvastatin 10mg - 1 viên/ngày, uống tối trước đi ngủ', 'Amlodipin 5mg - 1 viên/ngày, uống sáng sau ăn']
      }
    ]
  },
  {
    id: '3',
    code: 'BN-2026-003',
    name: 'Lê Văn C',
    age: 45,
    gender: 'Nam',
    status: 'Đã kết thúc',
    appointmentType: 'Khám trực tiếp',
    triage: 'Bình thường',
    lastVisit: '20/05/2026',
    phone: '0901234567',
    disease: 'Ho khan kéo dài về đêm',
    bloodType: 'B+',
    allergies: [],
    history: ['Dị ứng thời tiết', 'Trào ngược dạ dày thực quản (GERD)'],
    vitals: { bp: '118/78', hr: 72, temp: 36.5, spo2: 99, weight: 74, height: 175, bmi: 24.2 },
    pastEncounters: [
      {
        date: '20/05/2026',
        doctor: 'BS. Lê Minh',
        diagnosis: 'Ho khan do trào ngược dạ dày thực quản (GERD)',
        symptoms: 'Ho khan nhiều về đêm và sáng sớm, kèm ợ chua, rát nóng sau xương ức.',
        prescription: ['Nexium (Esomeprazole) 40mg - 1 viên/ngày, uống trước ăn sáng 30 phút', 'Gaviscon - 3 gói/ngày, uống sau ăn 1 giờ và trước đi ngủ', 'Siro ho Prospan - 5ml/lần, 3 lần/ngày']
      },
      {
        date: '05/03/2026',
        doctor: 'BS. Lê Minh',
        diagnosis: 'Viêm phế quản cấp tính trên nền trào ngược GERD',
        symptoms: 'Ho khạc đờm trắng đục nhiều ngày, mệt mỏi, đau rát cổ họng, sốt nhẹ 37.8 °C.',
        prescription: ['Augmentin 1g - 2 viên/ngày, uống sáng-tối sau ăn', 'Paracetamol 500mg - 3 viên/ngày khi sốt > 38.5 °C', 'Acetylcystein 200mg - 3 gói/ngày, uống sau ăn']
      }
    ]
  },
  {
    id: '4',
    code: 'BN-2026-004',
    name: 'Phạm Thị D',
    age: 50,
    gender: 'Nữ',
    status: 'Đang khám',
    appointmentType: 'Cả hai',
    triage: 'Khẩn cấp',
    lastVisit: '18/05/2026',
    phone: '0923456789',
    disease: 'Tiền sử huyết áp cao',
    bloodType: 'O+',
    allergies: [],
    history: ['Tăng huyết áp vô căn (đã 5 năm, đang uống thuốc duy trì)', 'Gút mãn tính'],
    vitals: { bp: '128/82', hr: 76, temp: 36.6, spo2: 97, weight: 80, height: 170, bmi: 27.7 },
    pastEncounters: [
      {
        date: '18/05/2026',
        doctor: 'BS. Nguyễn An',
        diagnosis: 'Tăng huyết áp vô căn - Giai đoạn 2 ổn định / Rối loạn acid uric máu',
        symptoms: 'Khám định kỳ, không đau đầu, không chóng mặt. Acid uric tăng nhẹ.',
        prescription: ['Amlodipin 5mg - 1 viên/ngày, uống sáng', 'Allopurinol 300mg - 1 viên/ngày, uống sáng sau ăn']
      },
      {
        date: '12/02/2026',
        doctor: 'BS. Nguyễn An',
        diagnosis: 'Cơn gút cấp tính khớp cổ chân trái',
        symptoms: 'Khớp cổ chân trái sưng nóng đỏ và đau dữ dội sau khi ăn lẩu hải sản, hạn chế đi lại.',
        prescription: ['Colchicine 1mg - ngày 1 uống 3 viên (sáng-trưa-tối), ngày 2 uống 2 viên', 'Meloxicam 7.5mg - 1 viên/ngày, uống sau ăn trưa để giảm đau kháng viêm']
      }
    ]
  },
  {
    id: '1',
    code: 'BN-2026-001',
    name: 'Nguyễn Văn A',
    age: 22,
    gender: 'Nam',
    status: 'Đang chờ',
    appointmentType: 'Tư vấn',
    triage: 'Cần khám',
    lastVisit: '25/05/2026',
    phone: '0934567890',
    disease: 'Sốt cao co giật nhẹ',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Aspirin'],
    history: ['Chưa ghi nhận tiền sử bệnh lý mãn tính', 'Mổ ruột thừa năm 2021 tại Bệnh viện Bạch Mai'],
    vitals: { bp: '142/95', hr: 98, temp: 39.2, spo2: 97, weight: 68, height: 172, bmi: 23.0 },
    pastEncounters: [
      {
        date: '25/05/2026',
        doctor: 'BS. Lê Minh',
        diagnosis: 'Sốt co giật do nhiễm siêu vi cấp tính',
        symptoms: 'Sốt cao liên tục 39.2 độ, co giật nhẹ cơ mặt và chi, đau họng, mệt mỏi nhiều.',
        prescription: ['Paracetamol 500mg - 3 viên/ngày, uống khi sốt > 38.5 độ', 'Oresol - Pha 1 gói với 1 lít nước lọc, uống rải rác', 'Hapacol 150mg (sẵn trong tủ thuốc gia đình) - dự phòng']
      },
      {
        date: '15/01/2026',
        doctor: 'BS. Lê Minh',
        diagnosis: 'Viêm họng cấp tính',
        symptoms: 'Đau rát họng nuốt vướng, ho khan nhiều về đêm, sốt nhẹ 38.0 °C, mệt mỏi.',
        prescription: ['Amoxicillin 500mg - 3 viên/ngày, uống sáng-trưa-tối sau ăn', 'Siro ho thảo dược - 10ml/lần, 3 lần/ngày để dịu họng']
      }
    ]
  },
  {
    id: '5',
    code: 'BN-2026-005',
    name: 'Đỗ Thị F',
    age: 39,
    gender: 'Nữ',
    status: 'Đã kết thúc',
    appointmentType: 'Khám trực tiếp',
    triage: 'Bình thường',
    lastVisit: '15/05/2026',
    phone: '0945678901',
    disease: 'Đau khớp gối mãn tính',
    bloodType: 'AB-',
    allergies: ['Sulfonamides'],
    history: ['Thoái hóa khớp gối độ III', 'Loét dạ dày tá tràng đã điều trị ổn định'],
    vitals: { bp: '130/80', hr: 82, temp: 36.9, spo2: 96, weight: 62, height: 155, bmi: 25.8 },
    pastEncounters: [
      {
        date: '15/05/2026',
        doctor: 'BS. Trần Hùng',
        diagnosis: 'Thoái hóa khớp gối hai bên tiến triển nặng',
        symptoms: 'Đau dữ dội hai khớp gối, khớp sưng đau, hạn chế vận động nhiều, khó đứng lên ngồi xuống.',
        prescription: ['Meloxicam 7.5mg - 1 viên/ngày, uống trưa sau ăn (dùng ngắn ngày)', 'Glucosamin Sulfat 1500mg - 1 gói/ngày, uống sáng', 'Esomeprazole 20mg - 1 viên/ngày, uống trước ăn sáng 30 phút để bảo vệ dạ dày']
      },
      {
        date: '20/12/2025',
        doctor: 'BS. Trần Hùng',
        diagnosis: 'Viêm loét dạ dày tá tràng đợt cấp tính',
        symptoms: 'Đau thượng vị âm ỉ kèm ợ nóng rát nhiều sau khi ăn đồ chua cay hoặc khi đói.',
        prescription: ['Nexium (Esomeprazole) 40mg - 1 viên/ngày, uống trước ăn sáng 30 phút', 'Phosphalugel - 3 gói/ngày, uống khi đau thượng vị nhiều']
      }
    ]
  }
]

const upcomingAppointments = {
  '2': { time: '09:00 - 09:30', date: '27/05/2026', type: 'Tư vấn', reason: 'Đau ngực trái kéo dài', status: 'Đang chờ' },
  '3': { time: '09:30 - 10:00', date: '27/05/2026', type: 'Khám trực tiếp', reason: 'Ho khan kéo dài về đêm', status: 'Đã khám' },
  '4': { time: '10:00 - 10:30', date: '27/05/2026', type: 'Cả hai', reason: 'Tiền sử huyết áp cao', status: 'Đang khám' },
  '1': { time: '10:30 - 11:00', date: '27/05/2026', type: 'Tư vấn', reason: 'Sốt cao co giật nhẹ', status: 'Đang chờ' },
  '5': { time: '14:00 - 14:30', date: '27/05/2026', type: 'Khám trực tiếp', reason: 'Đau khớp gối mãn tính', status: 'Đã khám' },
}

export function PatientListTab({
  onBackToDashboard,
  initialActivePatientId,
  onClearActivePatient,
}: {
  onBackToDashboard?: () => void
  initialActivePatientId?: string | null
  onClearActivePatient?: () => void
}) {
  const [patients, setPatients] = useState(initialPatients)
  const [activePatientId, setActivePatientId] = useState<string | null>(initialActivePatientId || null)
  const [selectedEncounterIdx, setSelectedEncounterIdx] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState<'Tất cả' | 'Tư vấn' | 'Khám trực tiếp' | 'Cả hai'>('Tất cả')
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Đang chờ' | 'Đang khám' | 'Đã kết thúc'>('Tất cả')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [timeFilter, setTimeFilter] = useState<'Hôm nay' | 'Tuần này' | 'Tháng này'>('Hôm nay')

  // When navigated from another tab with a pre-selected patient ID, open that patient
  useEffect(() => {
    if (initialActivePatientId) {
      setActivePatientId(initialActivePatientId)
      setSelectedEncounterIdx(0)
    }
  }, [initialActivePatientId])

  // Find active patient details
  const activePatient = patients.find(p => p.id === activePatientId)

  // Handler for toast messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Calculate statistics for the 4 wireframe summary cards
  const filterMultiplier = timeFilter === 'Tuần này' ? 5 : timeFilter === 'Tháng này' ? 20 : 1
  const stats = {
    total: 50 * filterMultiplier,      // Total patients (Tổng số bệnh nhân: 50)
    waiting: 12 * filterMultiplier,    // Waiting (Đang chờ: 12)
    processing: 5 * filterMultiplier,  // In progress (Đang xử lý: 5)
    urgent: 2 * filterMultiplier,      // High priority (Ưu tiên cao: 2)
  }

  const getDeltaText = (baseDelta: string) => {
    if (timeFilter === 'Hôm nay') return `${baseDelta} so với hôm qua`
    if (timeFilter === 'Tuần này') return `${baseDelta} so với tuần trước`
    if (timeFilter === 'Tháng này') return `${baseDelta} so với tháng trước`
    return baseDelta
  }

  // Filter & Search logic
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)

    const matchesService = serviceFilter === 'Tất cả' || p.appointmentType === serviceFilter
    const matchesStatus = statusFilter === 'Tất cả' || p.status === statusFilter

    return matchesSearch && matchesService && matchesStatus
  })

  // EMR Details view render (Matches the EMR Patient Detail Wireframe exactly + Interactive Visit History)
  if (activePatientId && activePatient) {
    const p = activePatient
    const enc = p.pastEncounters[selectedEncounterIdx] || p.pastEncounters[0]
    const appt = upcomingAppointments[p.id as keyof typeof upcomingAppointments]

    return (
      <div className="emr-view-container">
        {toastMessage && <div className="emr-toast">{toastMessage}</div>}

        {/* Return Button at top left */}
        <ReturnButton
          onClick={() => {
            setActivePatientId(null)
            setSelectedEncounterIdx(0)
            onClearActivePatient?.()
          }}
          title="Quay lại danh sách"
          style={{ marginBottom: '16px' }}
        />

        {/* EMR Top Title Header */}
        <div className="emr-view-header-block">
          <h1 className="emr-view-title">HỒ SƠ BỆNH ÁN CHI TIẾT</h1>
        </div>

        {/* Profile Card Section */}
        <section className="emr-profile-section">
          <div className="emr-avatar-circle">
            {p.name.split(' ').pop()?.[0]}
          </div>

          <div className="emr-profile-box">
            <div className="profile-detail-item">
              <span className="detail-label">Mã bệnh nhân:</span>
              <strong className="detail-value">{p.code}</strong>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Họ tên & Tuổi:</span>
              <strong className="detail-value">{p.name} ({p.age} tuổi)</strong>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Giới tính & Nhóm máu:</span>
              <strong className="detail-value">{p.gender} • Nhóm máu {p.bloodType}</strong>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Số điện thoại:</span>
              <strong className="detail-value">{p.phone}</strong>
            </div>
          </div>
        </section>

        <hr className="emr-divider" />

        {/* Two-Column Info Cards (Visit History in Left Column, Medical History & Allergies in Right Column) */}
        <div className="emr-two-columns">
          {/* Column 1: Lịch sử lượt khám gần đây (Left) */}
          <div className="emr-col-left">
            <article className="emr-column-card" style={{ height: '100%' }}>
              <h3 className="emr-column-title">Lịch sử lượt khám gần đây</h3>
              <div className="encounter-history-list">
                {p.pastEncounters.map((item, idx) => (
                  <div
                    key={idx}
                    className={`encounter-history-item ${selectedEncounterIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedEncounterIdx(idx)
                    }}
                  >
                    <div className="history-item-meta">
                      <span className="visit-meta">{item.date} • {item.doctor}</span>
                      {selectedEncounterIdx === idx && <span className="active-badge">Đang chọn</span>}
                    </div>
                    <div className="history-item-diag">{item.diagnosis}</div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Column 2: Tiền sử & Cảnh báo dị ứng (Right) */}
          <div className="emr-col-right">
            <article className="emr-column-card" style={{ height: '100%' }}>
              <h3 className="emr-column-title">Tiền sử & Cảnh báo dị ứng</h3>
              <div className="emr-history-allergy-content">
                <div className="allergy-warn-box">
                  <span className="warn-label">Dị ứng ghi nhận:</span>
                  <strong className={`warn-val ${p.allergies.length > 0 ? 'alert-red' : ''}`}>
                    {p.allergies.length > 0 ? p.allergies.join(', ') : 'Chưa ghi nhận dị ứng'}
                  </strong>
                </div>

                <div className="history-box-section">
                  <span className="warn-label">Tiền sử bệnh lý:</span>
                  <ul className="history-bullets">
                    {p.history.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Vertical Records List Section (Displays detailed info of selected encounter) */}
        {enc && (
          <section className="emr-records-section">
            <div className="emr-encounter-block">
              {/* Row 1: Triệu chứng & Khám lâm sàng */}
              <div className="emr-records-row">
                <span className="emr-records-label">Triệu chứng & Lâm sàng</span>
                <div className="emr-records-value-box">
                  <strong style={{ display: 'block', marginBottom: '6px' }}>Khám ngày: {enc.date} (Đảm nhận: {enc.doctor})</strong>
                  <p style={{ margin: 0 }}>{enc.symptoms}</p>
                </div>
              </div>

              {/* Row 2: Chẩn đoán y khoa */}
              <div className="emr-records-row">
                <span className="emr-records-label">Chẩn đoán y khoa</span>
                <div className="emr-records-value-box">
                  <strong style={{ color: '#2563EB', fontWeight: 700 }}>{enc.diagnosis}</strong>
                </div>
              </div>

              {/* Row 3: Đơn thuốc chỉ định */}
              <div className="emr-records-row">
                <span className="emr-records-label">Đơn thuốc kê chi tiết</span>
                <div className="emr-records-value-box">
                  {enc.prescription.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {enc.prescription.map((drug, dIdx) => (
                        <li key={dIdx} style={{ fontWeight: 600 }}>{drug}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="emr-no-notes">Không kê đơn thuốc</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Function Actions Buttons at bottom right */}
        <div className="emr-buttons-group">
          <button className="emr-btn-outline" type="button" onClick={() => triggerToast(`Đang kết nối máy in để in đơn thuốc của bệnh nhân ${p.name}...`)}>
            In đơn thuốc
          </button>
          <button className="emr-btn-filled" type="button" onClick={() => triggerToast(`Đang xuất file bệnh án EMR (PDF) của bệnh nhân ${p.name}...`)}>
            Xuất file bệnh án (PDF)
          </button>
        </div>
      </div>
    )
  }

  const columns: Array<DataTableColumn<any>> = [
    {
      key: 'index',
      header: 'STT',
      width: '60px',
      align: 'center',
      render: (_item, index) => index + 1,
    },
    {
      key: 'patient',
      header: 'Bệnh nhân',
      width: '240px',
      render: (item) => (
        <div className="doctor-cell">
          <div className="doctor-avatar" aria-hidden="true" style={{ background: '#E6EFFE' }}>
            <svg viewBox="0 0 24 24" style={{ fill: '#244a6b', stroke: 'none' }}>
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" />
            </svg>
          </div>
          <div>
            <strong>{item.name}</strong>
            <span>{item.gender} • {item.age} tuổi</span>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      width: '140px',
      align: 'center',
      render: (item) => item.phone
    },
    {
      key: 'disease',
      header: 'Lý do khám',
      width: '220px',
      render: (item) => item.disease
    },
    {
      key: 'appointmentType',
      header: 'Loại hình',
      width: '140px',
      align: 'center',
      render: (item) => item.appointmentType
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '130px',
      align: 'center',
      render: (item) => (
        <span className={`status-pill ${item.status === 'Đang chờ' ? 'waiting' : item.status === 'Đang khám' ? 'processing' : 'done'}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '120px',
      align: 'left',
      render: (item) => (
        <div className="table-actions">
          <IconButton
            label="Xem bệnh án EMR"
            onClick={() => {
              setActivePatientId(item.id)
              setSelectedEncounterIdx(0)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </IconButton>
        </div>
      )
    }
  ]

  // Dashboard / Table View Render (Perfect Wireframe representation + Clinically Valued Fields)
  return (
    <div className="patient-page-content">
      {toastMessage && <div className="emr-toast">{toastMessage}</div>}

      {/* Wireframe Metric Stats Summary Bar */}
      <header className="patient-tab-header">
        <div className="tab-titles">
          <h1>Danh sách bệnh nhân</h1>
          <p>Trang quản lý hồ sơ bệnh nhân trong chuỗi phòng khám.</p>
        </div>
        <div className="header-right-filter">
          <FilterSelect
            value={timeFilter}
            options={[
              { label: 'Hôm nay', value: 'Hôm nay' },
              { label: 'Tuần này', value: 'Tuần này' },
              { label: 'Tháng này', value: 'Tháng này' }
            ]}
            onChange={e => setTimeFilter(e.target.value as any)}
          />
        </div>
      </header>

      {/* Summary metric cards row */}
      <div className="metrics-grid doctor-metrics-grid" style={{ marginTop: '18px' }}>
        <MetricCard
          label="Tổng số bệnh nhân"
          value={stats.total}
          delta={getDeltaText("+2.4%")}
          icon={<UsersMetricIcon />}
          iconClassName="metric-icon-blue"
        />
        <MetricCard
          label="Đang chờ"
          value={stats.waiting}
          delta={getDeltaText("-2")}
          icon={<ClockMetricIcon />}
          iconClassName="metric-icon-yellow"
        />
        <MetricCard
          label="Đang khám"
          value={stats.processing}
          delta={getDeltaText("+1")}
          icon={<PulseMetricIcon />}
          iconClassName="metric-icon-green"
        />
        <MetricCard
          label="Ưu tiên cao"
          value={stats.urgent}
          delta={getDeltaText("+12%")}
          icon={<MessageMetricIcon />}
          iconClassName="metric-icon-pink"
        />
      </div>

      {/* Title & Controls Toolbar */}
      <div className="patient-toolbar">
        <div className="patient-toolbar-filters">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm bệnh nhân..."
          />

          <div className="sort-selector-container">
            <FilterSelect
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value as any)}
              options={[
                { value: 'Tất cả', label: 'Dịch vụ' },
                { value: 'Tư vấn', label: 'Tư vấn' },
                { value: 'Khám trực tiếp', label: 'Khám trực tiếp' },
                { value: 'Cả hai', label: 'Cả hai' },
              ]}
            />
          </div>

          <div className="sort-selector-container">
            <FilterSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'Tất cả', label: 'Trạng thái' },
                { value: 'Đang chờ', label: 'Đang chờ' },
                { value: 'Đang khám', label: 'Đang khám' },
                { value: 'Đã kết thúc', label: 'Đã kết thúc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Upgraded Table Layout of Patients */}
      <div className="patient-table-frame">
        <DataTable
          rows={filteredPatients}
          columns={columns}
          getRowKey={(p) => p.id}
          emptyState="Không tìm thấy bệnh nhân nào phù hợp."
        />
      </div>

      {/* Pagination component at bottom centered */}
      <footer className="patient-pagination" aria-label="Phân trang">
        <button className="pag-nav-btn prev" disabled={currentPage === 1} onClick={() => setCurrentPage(1)} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pag-icon">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className={`pag-num-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)} type="button">1</button>
        <button className={`pag-num-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => triggerToast("Đây là bản ghi thử nghiệm, trang 2 hiện chưa có dữ liệu bệnh nhân.")} type="button">2</button>
        <button className={`pag-num-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => triggerToast("Đây là bản ghi thử nghiệm, trang 3 hiện chưa có dữ liệu bệnh nhân.")} type="button">3</button>
        <button className="pag-nav-btn next" onClick={() => triggerToast("Đây là bản ghi thử nghiệm, trang sau hiện chưa có dữ liệu bệnh nhân.")} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pag-icon">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </footer>
    </div>
  )
}
