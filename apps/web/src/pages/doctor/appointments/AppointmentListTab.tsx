import { useState, useEffect } from 'react'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { IconButton, PrimaryButton } from '../../../components/ui/ActionButton'
import { MetricCard } from '../../../components/ui/MetricCard'
import { ClockMetricIcon, MessageMetricIcon, PulseMetricIcon, UsersMetricIcon, StarMetricIcon } from '../../../components/ui/metricIcons'
import { SearchInput } from '../../../components/ui/SearchInput'
import { ReturnButton } from '../../../components/ui/ReturnButton'
import './AppointmentListTab.css'

// Clinical-grade patient mock data with EMR elements
const initialPatients = [
  {
    id: '2',
    code: 'BN-2026-002',
    name: 'Trần Thị B',
    age: 28,
    gender: 'Nữ',
    status: 'Đang chờ',
    appointmentType: 'Tư vấn',
    triage: 'Khẩn cấp',
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
        prescription: ['Amoxicillin 500mg - 3 viên/ngày, uống sau ăn', 'Alpha Chymotrypsin - 6 viên/ngày, ngậm dưới lưỡi', 'Siro ho bổ phế - 15ml/lần, 3 lần/ngày']
      }
    ]
  },
  {
    id: '5',
    code: 'BN-2026-005',
    name: 'Đỗ Thị F',
    age: 39,
    gender: 'Nữ',
    status: 'Đang chờ',
    appointmentType: 'Khám trực tiếp',
    triage: 'Bình thường',
    lastVisit: '27/05/2026',
    phone: '0945678901',
    disease: 'Đau khớp gối mãn tính',
    bloodType: 'AB-',
    allergies: ['Sulfonamides'],
    history: ['Thoái hóa khớp gối độ III', 'Loét dạ dày tá tràng đã điều trị ổn định'],
    vitals: { bp: '130/80', hr: 82, temp: 36.9, spo2: 96, weight: 62, height: 155, bmi: 25.8 },
    pastEncounters: [
      {
        date: '27/05/2026',
        doctor: 'BS. Lê Minh',
        diagnosis: 'Thoái hóa khớp gối hai bên tiến triển nặng',
        symptoms: 'Đau dữ dội hai khớp gối, sưng đau, hạn chế vận động nhiều.',
        prescription: ['Meloxicam 7.5mg - 1 viên/ngày, uống trưa sau ăn', 'Glucosamin Sulfat 1500mg - 1 gói/ngày, uống sáng']
      }
    ]
  }
]

// Premium mock appointments with detailed clinical info
const initialAppointments = [
  { 
    id: '1',
    patientId: '2',
    patientName: 'Trần Thị B',
    patientCode: 'BN-2026-002',
    phone: '0987654321',
    age: 28,
    gender: 'Nữ',
    bloodType: 'O+',
    allergies: ['Hải sản'],
    time: '09:00 - 09:30', 
    date: '27/05/2026', 
    type: 'Tư vấn', 
    reason: 'Đau ngực trái kéo dài', 
    status: 'Đang chờ',
    priority: 'Khẩn cấp',
    history: 'Rối loạn lipid máu phát hiện năm 2024, tiền sử gia đình tim mạch',
    vitals: { bp: '135/85', hr: 104, temp: 36.8, spo2: 98, weight: 55, height: 158, bmi: 22.0 }
  },
  { 
    id: '2',
    patientId: '3',
    patientName: 'Lê Văn C',
    patientCode: 'BN-2026-003',
    phone: '0901234567',
    age: 45,
    gender: 'Nam',
    bloodType: 'B+',
    allergies: [],
    time: '09:30 - 10:00', 
    date: '27/05/2026', 
    type: 'Khám trực tiếp', 
    reason: 'Ho khan kéo dài về đêm', 
    status: 'Đã khám',
    priority: 'Bình thường',
    history: 'Trào ngược dạ dày thực quản (GERD)',
    vitals: { bp: '118/78', hr: 72, temp: 36.5, spo2: 99, weight: 74, height: 175, bmi: 24.2 },
    notes: {
      symptoms: 'Ho khan nhiều về đêm và sáng sớm, kèm ợ chua, rát nóng sau xương ức.',
      diagnosis: 'Ho khan do trào ngược dạ dày thực quản (GERD)',
      prescription: 'Nexium Esomeprazole 40mg - 1 viên/ngày, uống trước ăn sáng 30 phút\nGaviscon - 3 gói/ngày, uống sau ăn 1 giờ và trước đi ngủ'
    }
  },
  { 
    id: '3',
    patientId: '4',
    patientName: 'Phạm Thị D',
    patientCode: 'BN-2026-004',
    phone: '0923456789',
    age: 50,
    gender: 'Nữ',
    bloodType: 'O+',
    allergies: [],
    time: '10:00 - 10:30', 
    date: '27/05/2026', 
    type: 'Cả hai', 
    reason: 'Tiền sử huyết áp cao', 
    status: 'Đang khám',
    priority: 'Khẩn cấp',
    history: 'Tăng huyết áp vô căn (5 năm), Gút mãn tính',
    vitals: { bp: '148/95', hr: 88, temp: 36.9, spo2: 97, weight: 80, height: 170, bmi: 27.7 }
  },
  { 
    id: '4',
    patientId: '1',
    patientName: 'Nguyễn Văn A',
    patientCode: 'BN-2026-001',
    phone: '0934567890',
    age: 22,
    gender: 'Nam',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Aspirin'],
    time: '10:30 - 11:00', 
    date: '27/05/2026', 
    type: 'Tư vấn', 
    reason: 'Sốt cao co giật nhẹ', 
    status: 'Đang chờ',
    priority: 'Bình thường',
    history: 'Mổ ruột thừa năm 2021 tại Bệnh viện Bạch Mai',
    vitals: { bp: '142/95', hr: 98, temp: 39.2, spo2: 97, weight: 68, height: 172, bmi: 23.0 }
  },
  { 
    id: '5',
    patientId: '5',
    patientName: 'Đỗ Thị F',
    patientCode: 'BN-2026-005',
    phone: '0945678901',
    age: 39,
    gender: 'Nữ',
    bloodType: 'AB-',
    allergies: ['Sulfonamides'],
    time: '14:00 - 14:30', 
    date: '27/05/2026', 
    type: 'Khám trực tiếp', 
    reason: 'Đau khớp gối mãn tính', 
    status: 'Đã khám',
    priority: 'Bình thường',
    history: 'Thoái hóa khớp gối độ III, Loét dạ dày tá tràng đã điều trị ổn định',
    vitals: { bp: '130/80', hr: 82, temp: 36.9, spo2: 96, weight: 62, height: 155, bmi: 25.8 },
    notes: {
      symptoms: 'Đau dữ dội hai khớp gối, sưng đau, hạn chế vận động nhiều.',
      diagnosis: 'Thoái hóa khớp gối hai bên tiến triển nặng',
      prescription: 'Meloxicam 7.5mg - 1 viên/ngày, uống trưa sau ăn\nGlucosamin Sulfat 1500mg - 1 gói/ngày, uống sáng'
    }
  }
]

export function AppointmentListTab({
  onBackToDashboard,
  onViewPatientProfile,
}: {
  onBackToDashboard?: () => void
  onViewPatientProfile?: (patientId: string) => void
}) {
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments)
  const [patientsList, setPatientsList] = useState(initialPatients)
  
  // Local viewing and editing states
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null)
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null)
  const [selectedEncounterIdx, setSelectedEncounterIdx] = useState<number>(0)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'Tất cả' | 'Tư vấn' | 'Khám trực tiếp' | 'Cả hai'>('Tất cả')
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Đang chờ' | 'Đang khám' | 'Đã khám'>('Tất cả')
  const [timeFilter, setTimeFilter] = useState<string>('Tuần này')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Clinical intake form states (for popup modal)
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')

  // Selected appointment matching activeAppointmentId
  const activeApp = appointmentsList.find(a => a.id === activeAppointmentId)

  // Sync inputs when active appointment changes
  useEffect(() => {
    if (activeApp) {
      if (activeApp.notes) {
        setSymptoms(activeApp.notes.symptoms)
        setDiagnosis(activeApp.notes.diagnosis)
        setPrescription(activeApp.notes.prescription)
      } else {
        setSymptoms('')
        setDiagnosis('')
        setPrescription('')
      }
    }
  }, [activeAppointmentId])

  // Toast handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle saving clinical records from popup modal
  const handleSaveExamination = () => {
    if (!activeApp) return

    if (!symptoms.trim() || !diagnosis.trim()) {
      triggerToast('⚠️ Vui lòng nhập đầy đủ triệu chứng lâm sàng và chẩn đoán trước khi hoàn thành!')
      return
    }

    // 1. Add new EMR encounter to patientsList
    const newEncounter = {
      date: new Date().toLocaleDateString('vi-VN'),
      doctor: 'BS. Lê Minh',
      diagnosis: diagnosis.trim(),
      symptoms: symptoms.trim(),
      prescription: prescription ? prescription.split('\n').filter(line => line.trim() !== '') : []
    }

    setPatientsList(prev => prev.map(p => {
      if (p.id === activeApp.patientId) {
        return {
          ...p,
          pastEncounters: [newEncounter, ...p.pastEncounters]
        }
      }
      return p
    }))

    // 2. Update status of the appointment to "Đã khám"
    setAppointmentsList(prev => prev.map(a => {
      if (a.id === activeAppointmentId) {
        return {
          ...a,
          status: 'Đã khám',
          notes: {
            symptoms: symptoms.trim(),
            diagnosis: diagnosis.trim(),
            prescription: prescription.trim()
          }
        }
      }
      return a
    }))

    triggerToast(`✓ Đã lưu hồ sơ khám & kê đơn thuốc cho bệnh nhân ${activeApp.patientName} thành công!`)
    setActiveAppointmentId(null)
  }

  // Stats for metric cards
  const filterMultiplier = timeFilter === 'Tuần này' ? 5 : timeFilter === 'Tháng này' ? 20 : 1
  const stats = {
    total: 12 * filterMultiplier,
    waiting: (8 - (appointmentsList.filter(a => a.status !== 'Đang chờ').length - 3)) * filterMultiplier,
    processing: (5 + (appointmentsList.filter(a => a.status === 'Đang khám').length - 1)) * filterMultiplier,
    completed: (5 + (appointmentsList.filter(a => a.status === 'Đã khám').length - 2)) * filterMultiplier,
  }

  const getDeltaText = (baseDelta: string) => {
    if (timeFilter === 'Hôm nay') return `${baseDelta} so với hôm qua`
    if (timeFilter === 'Tuần này') return `${baseDelta} so với tuần trước`
    if (timeFilter === 'Tháng này') return `${baseDelta} so với tháng trước`
    return baseDelta
  }

  // Filter logic
  const filteredAppointments = appointmentsList.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm)
    const matchesType = typeFilter === 'Tất cả' || a.type === typeFilter
    const matchesStatus = statusFilter === 'Tất cả' || a.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // 1. LOCAL DETAILED EMR VIEW (Visual parity with PatientListTab detail EMR but includes "Ghi nhận đợt khám mới" which triggers EMR popup)
  if (viewingPatientId) {
    const p = patientsList.find(pat => pat.id === viewingPatientId)
    
    if (p) {
      const enc = p.pastEncounters[selectedEncounterIdx] || p.pastEncounters[0]
      const appt = appointmentsList.find(a => a.patientId === p.id)
      const currentActiveAppt = appointmentsList.find(a => a.patientId === p.id && a.status !== 'Đã khám')

      return (
        <div className="emr-view-container">
          {toastMessage && <div className="emr-toast">{toastMessage}</div>}

          {/* Return Button to Appointments Table */}
          <ReturnButton
            onClick={() => {
              setViewingPatientId(null)
              setSelectedEncounterIdx(0)
            }}
            title="Quay lại danh sách lịch hẹn"
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

          {/* Current Appointment & Intake Prep Info */}
          {appt && appt.status !== 'Đã khám' && (
            <article className="emr-column-card" style={{ marginBottom: '20px' }}>
              <h3 className="emr-column-title" style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Lịch hẹn khám hiện tại & Lý do khám
              </h3>
              <div className="emr-appointment-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '16px' }}>
                <div className="appt-info-block" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="appt-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="appt-detail-label" style={{ color: '#718096', fontSize: '13px', fontWeight: 600, minWidth: '120px' }}>Thời gian khám:</span>
                    <span className="time-highlight" style={{ fontSize: '13px', fontWeight: 700, padding: '4px 12px', background: '#EFF6FF', color: '#2563EB', borderRadius: '100px', border: '1px solid rgba(59, 130, 246, 0.08)', whiteSpace: 'nowrap' }}>
                      {appt.time} • Ngày {appt.date}
                    </span>
                  </div>
                  <div className="appt-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="appt-detail-label" style={{ color: '#718096', fontSize: '13px', fontWeight: 600, minWidth: '120px' }}>Loại hình khám:</span>
                    <strong style={{ color: '#244A6B', fontSize: '14px' }}>{appt.type}</strong>
                  </div>
                  <div className="appt-detail-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="appt-detail-label" style={{ color: '#718096', fontSize: '13px', fontWeight: 600, minWidth: '120px' }}>Trạng thái:</span>
                    <span className={`status-pill ${appt.status === 'Đang chờ' ? 'waiting' : appt.status === 'Đang khám' ? 'processing' : 'done'}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
                <div className="appt-reason-block" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span className="appt-detail-label" style={{ color: '#718096', fontSize: '13px', fontWeight: 600 }}>Lý do khám & Triệu chứng đăng ký:</span>
                  <p className="appt-reason-text" style={{ margin: '4px 0 0', padding: '12px 16px', background: '#FFF7ED', borderLeft: '4px solid #EA580C', borderRadius: '6px', color: '#C2410C', fontWeight: 600, fontSize: '13.5px', lineHeight: '1.5' }}>
                    {appt.reason}
                  </p>
                </div>
              </div>
            </article>
          )}

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

          {/* Vertical Records List Section */}
          {enc && (
            <section className="emr-records-section">
              <div className="emr-encounter-block">
                <div className="emr-records-row">
                  <span className="emr-records-label">Triệu chứng & Lâm sàng</span>
                  <div className="emr-records-value-box">
                    <strong style={{ display: 'block', marginBottom: '6px' }}>Khám ngày: {enc.date} (Đảm nhận: {enc.doctor})</strong>
                    <p style={{ margin: 0 }}>{enc.symptoms}</p>
                  </div>
                </div>

                <div className="emr-records-row">
                  <span className="emr-records-label">Chẩn đoán y khoa</span>
                  <div className="emr-records-value-box">
                    <strong style={{ color: '#2563EB', fontWeight: 700 }}>{enc.diagnosis}</strong>
                  </div>
                </div>

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

          {/* Action buttons at bottom right including "Ghi nhận đợt khám mới" */}
          <div className="emr-buttons-group">
            {currentActiveAppt && (
              <button
                className="emr-btn-outline"
                type="button"
                style={{ backgroundColor: '#10B981', borderColor: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  setActiveAppointmentId(currentActiveAppt.id)
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5' }}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Ghi nhận đợt khám mới
              </button>
            )}
            <button className="emr-btn-outline" type="button" onClick={() => triggerToast(`Đang kết nối máy in để in đơn thuốc của bệnh nhân ${p.name}...`)}>
              In đơn thuốc
            </button>
            <button className="emr-btn-filled" type="button" onClick={() => triggerToast(`Đang xuất file bệnh án EMR (PDF) của bệnh nhân ${p.name}...`)}>
              Xuất file bệnh án (PDF)
            </button>
          </div>

          {/* EMR Popup Modal for writing medical record (rendered directly on top) */}
          {activeAppointmentId && activeApp && (
            <div className="emr-modal-overlay">
              <div className="emr-modal-container">
                <div className="emr-modal-header">
                  <h3>Ghi kết quả khám & Kê đơn thuốc</h3>
                  <button className="close-modal-btn" onClick={() => setActiveAppointmentId(null)}>×</button>
                </div>
                <div className="emr-modal-patient-info">
                  <span>Bệnh nhân: <strong>{activeApp.patientName} ({activeApp.gender}, {activeApp.age} tuổi)</strong></span>
                  <span>Mã bệnh nhân: <strong>{activeApp.patientCode}</strong></span>
                </div>
                <div className="emr-modal-body">
                  <div className="form-input-group">
                    <label htmlFor="clinical-symptoms">Triệu chứng lâm sàng <span className="required-star">*</span></label>
                    <textarea
                      id="clinical-symptoms"
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      placeholder="Mô tả triệu chứng, tình trạng lâm sàng hiện tại..."
                      rows={3}
                    />
                  </div>
                  <div className="form-input-group">
                    <label htmlFor="clinical-diagnosis">Chẩn đoán bệnh lý <span className="required-star">*</span></label>
                    <textarea
                      id="clinical-diagnosis"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      placeholder="Chẩn đoán xác định bệnh..."
                      rows={2}
                    />
                  </div>
                  <div className="form-input-group">
                    <label htmlFor="clinical-prescription">Kê toa & Đơn thuốc điều trị</label>
                    <textarea
                      id="clinical-prescription"
                      value={prescription}
                      onChange={e => setPrescription(e.target.value)}
                      placeholder="Nhập tên thuốc, liều lượng, số lượng, hướng dẫn uống (Mỗi dòng một loại)..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="emr-modal-footer">
                  <button className="emr-btn-outline" onClick={() => setActiveAppointmentId(null)}>Hủy</button>
                  <button className="emr-btn-filled" onClick={handleSaveExamination}>Lưu đợt khám</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  // Column definitions for the Appointments Table
  const columns: Array<DataTableColumn<any>> = [
    {
      key: 'index',
      header: 'STT',
      width: '50px',
      align: 'center',
      render: (_item, index) => index + 1,
    },
    {
      key: 'patient',
      header: 'Bệnh nhân',
      width: '220px',
      render: (item) => (
        <div className="doctor-cell">
          <div className="doctor-avatar" aria-hidden="true" style={{ background: '#E6EFFE' }}>
            <svg viewBox="0 0 24 24" style={{ fill: '#244a6b', stroke: 'none' }}>
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21a7 7 0 0 1 14 0v1H5v-1Z" />
            </svg>
          </div>
          <div>
            <strong>{item.patientName}</strong>
            <span>{item.gender} • {item.age} tuổi</span>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      width: '130px',
      align: 'center',
      render: (item) => item.phone
    },
    {
      key: 'time',
      header: 'Giờ hẹn',
      width: '150px',
      align: 'center',
      render: (item) => <span className="time-highlight">{item.time}</span>
    },
    {
      key: 'type',
      header: 'Loại hình',
      width: '130px',
      align: 'center',
      render: (item) => item.type
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
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
      width: '148px',
      align: 'left',
      render: (item) => (
        <div className="table-actions">
          {/* Button 1: Xem hồ sơ bệnh án — local EMR view */}
          <IconButton
            label="Xem hồ sơ bệnh án"
            onClick={() => {
              setViewingPatientId(item.patientId)
              setSelectedEncounterIdx(0)
            }}
            style={{ backgroundColor: '#E6EFFE', color: '#244A6B' }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </IconButton>

          {/* Button 2: Ghi kết quả khám / đơn thuốc (Clipboard icon, shown ONLY if patient is NOT completed/Đã khám) */}
          {item.status !== 'Đã khám' && (
            <IconButton
              label="Ghi kết quả khám"
              onClick={() => setActiveAppointmentId(item.id)}
              style={{ backgroundColor: '#E6EFFE', color: '#244A6B' }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="2" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
                <path d="M15 14l1.5 1.5L19 13" />
              </svg>
            </IconButton>
          )}
        </div>
      )
    }
  ]

  // 2. APPOINTMENTS LIST TABLE VIEW
  return (
    <div className="appointment-list-tab-content">
      {toastMessage && <div className="emr-toast">{toastMessage}</div>}

      {/* 1. Header — title left, time filter right */}
      <header className="patient-tab-header">
        <div className="tab-titles">
          <h1>Lịch hẹn khám tại phòng khám</h1>
          <p>Quản lý lịch hẹn khám trực tiếp, tiếp nhận bệnh nhân và thực hiện chẩn đoán y khoa.</p>
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

      {/* 2. Summary metric cards row */}
      <div className="metrics-grid doctor-metrics-grid" style={{ marginTop: '18px' }}>
        <MetricCard
          label="Tổng số lịch hẹn"
          value={stats.total}
          delta={getDeltaText("+2%")}
          icon={<PulseMetricIcon />}
          iconClassName="metric-icon-blue"
        />
        <MetricCard
          label="Ca chờ tư vấn"
          value={stats.waiting}
          delta={getDeltaText("-1")}
          icon={<ClockMetricIcon />}
          iconClassName="metric-icon-yellow"
        />
        <MetricCard
          label="Ca đang xử lý"
          value={stats.processing}
          delta={getDeltaText("+0")}
          icon={<MessageMetricIcon />}
          iconClassName="metric-icon-pink"
        />
        <MetricCard
          label="Ca hoàn thành"
          value={stats.completed}
          delta={getDeltaText("+12%")}
          icon={<StarMetricIcon />}
          iconClassName="metric-icon-green"
        />
      </div>

      {/* 3. Toolbar — search + filters left, add button right */}
      <div className="patient-toolbar">
        <div className="patient-toolbar-filters">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm theo tên hoặc mã bệnh nhân"
          />

          <div className="sort-selector-container">
            <FilterSelect
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              options={[
                { value: 'Tất cả', label: 'Loại hình' },
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
                { value: 'Đã khám', label: 'Đã khám' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* 4. Premium Data Table */}
      <div className="patient-table-frame">
        <DataTable
          rows={filteredAppointments}
          columns={columns}
          getRowKey={(a) => a.id}
          emptyState="Không tìm thấy lịch hẹn nào phù hợp."
        />
      </div>

      {/* 5. Pagination — matching Patient List */}
      <footer className="patient-pagination" aria-label="Phân trang">
        <button
          className="pag-nav-btn prev"
          type="button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pag-icon">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        
        <button
          type="button"
          className={`pag-num-btn ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
        
        <button
          type="button"
          className={`pag-num-btn ${currentPage === 2 ? 'active' : ''}`}
          onClick={() => triggerToast('Đây là bản ghi thử nghiệm, trang 2 hiện chưa có dữ liệu lịch hẹn.')}
        >
          2
        </button>
        
        <button
          type="button"
          className={`pag-num-btn ${currentPage === 3 ? 'active' : ''}`}
          onClick={() => triggerToast('Đây là bản ghi thử nghiệm, trang 3 hiện chưa có dữ liệu lịch hẹn.')}
        >
          3
        </button>

        <button
          className="pag-nav-btn next"
          type="button"
          onClick={() => triggerToast('Đây là bản ghi thử nghiệm, trang sau hiện chưa có dữ liệu lịch hẹn.')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pag-icon">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </footer>

      {/* EMR Popup Modal for writing medical record (rendered directly on top of table) */}
      {activeAppointmentId && activeApp && (
        <div className="emr-modal-overlay">
          <div className="emr-modal-container">
            <div className="emr-modal-header">
              <h3>Ghi kết quả khám & Kê đơn thuốc</h3>
              <button className="close-modal-btn" onClick={() => setActiveAppointmentId(null)}>×</button>
            </div>
            <div className="emr-modal-patient-info">
              <span>Bệnh nhân: <strong>{activeApp.patientName} ({activeApp.gender}, {activeApp.age} tuổi)</strong></span>
              <span>Mã bệnh nhân: <strong>{activeApp.patientCode}</strong></span>
            </div>
            <div className="emr-modal-body">
              <div className="form-input-group">
                <label htmlFor="clinical-symptoms">Triệu chứng lâm sàng <span className="required-star">*</span></label>
                <textarea
                  id="clinical-symptoms"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Mô tả triệu chứng, tình trạng lâm sàng hiện tại..."
                  rows={3}
                />
              </div>
              <div className="form-input-group">
                <label htmlFor="clinical-diagnosis">Chẩn đoán bệnh lý <span className="required-star">*</span></label>
                <textarea
                  id="clinical-diagnosis"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="Chẩn đoán xác định bệnh..."
                  rows={2}
                />
              </div>
              <div className="form-input-group">
                <label htmlFor="clinical-prescription">Kê toa & Đơn thuốc điều trị</label>
                <textarea
                  id="clinical-prescription"
                  value={prescription}
                  onChange={e => setPrescription(e.target.value)}
                  placeholder="Nhập tên thuốc, liều lượng, số lượng, hướng dẫn uống (Mỗi dòng một loại)..."
                  rows={4}
                />
              </div>
            </div>
            <div className="emr-modal-footer">
              <button className="emr-btn-outline" onClick={() => setActiveAppointmentId(null)}>Hủy</button>
              <button className="emr-btn-filled" onClick={handleSaveExamination}>Lưu đợt khám</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
