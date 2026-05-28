import type { Branch, Doctor, DoctorFormValues, DoctorSchedule, DoctorStatus, Gender, Specialty } from './doctorTypes'

export const specialties: Specialty[] = ['Nội tiết', 'Tim mạch', 'Sản phụ khoa', 'Nhi khoa', 'Da liễu', 'Tai Mũi Họng']

export const branches: Branch[] = ['Chi nhánh A', 'Chi nhánh B', 'Chi nhánh C']

const defaultAvatarColor = '#dcebff'

export function deriveDoctorStatus(doctor: Pick<Doctor, 'hasCurrentShift' | 'hasActiveAppointment'>): DoctorStatus {
  if (!doctor.hasCurrentShift) {
    return 'offline'
  }

  return doctor.hasActiveAppointment ? 'busy' : 'online'
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

export function parseScheduleText(value: string): DoctorSchedule[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...timeParts] = line.split(':')
      return {
        day: day?.trim() || 'Lịch làm việc',
        time: timeParts.join(':').trim() || line,
      }
    })
}

export function scheduleToText(schedule: DoctorSchedule[]) {
  return schedule.map((item) => `${item.day}: ${item.time}`).join('\n')
}

export const initialDoctorFormValues: DoctorFormValues = {
  fullName: '',
  gender: '',
  birthday: '',
  phone: '',
  email: '',
  address: '',
  avatarColor: defaultAvatarColor,
  specialty: '',
  branch: '',
  degree: '',
  yearsExperience: '',
  shortBio: '',
  consultationFee: '',
  examinationFee: '',
  hasCurrentShift: true,
  hasActiveAppointment: false,
  scheduleText: 'Thứ 2 - Thứ 6: 08:00 - 17:00',
  username: '',
  password: '',
  confirmPassword: '',
}

export function doctorToFormValues(doctor: Doctor): DoctorFormValues {
  return {
    fullName: doctor.fullName,
    gender: doctor.gender,
    birthday: doctor.birthday,
    phone: doctor.phone,
    email: doctor.email,
    address: doctor.address,
    avatarColor: doctor.avatarColor,
    specialty: doctor.specialty,
    branch: doctor.branch,
    degree: doctor.degree,
    yearsExperience: String(doctor.yearsExperience),
    shortBio: doctor.shortBio,
    consultationFee: String(doctor.consultationFee),
    examinationFee: String(doctor.examinationFee),
    hasCurrentShift: doctor.hasCurrentShift,
    hasActiveAppointment: doctor.hasActiveAppointment,
    scheduleText: scheduleToText(doctor.schedule),
    username: doctor.username,
    password: '',
    confirmPassword: '',
  }
}

type DoctorSeed = {
  id: string
  fullName: string
  gender: Gender
  specialty: Specialty
  branch: Branch
  hasCurrentShift: boolean
  hasActiveAppointment: boolean
  rating: number
}

const doctorSeeds: DoctorSeed[] = [
  { id: '67890', fullName: 'BS. Nguyễn Thu Thủy', gender: 'Nữ', specialty: 'Nội tiết', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.8 },
  { id: '24680', fullName: 'BS. Trần Văn Nam', gender: 'Nam', specialty: 'Tim mạch', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.9 },
  { id: '13579', fullName: 'BS. Lê Thị Mai', gender: 'Nữ', specialty: 'Sản phụ khoa', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.7 },
  { id: '98765', fullName: 'BS. Hoàng Quốc Việt', gender: 'Nam', specialty: 'Nhi khoa', branch: 'Chi nhánh A', hasCurrentShift: false, hasActiveAppointment: false, rating: 4.6 },
  { id: '54321', fullName: 'BS. Phạm Thanh Hà', gender: 'Nữ', specialty: 'Da liễu', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.8 },
  { id: '10234', fullName: 'BS. Đỗ Minh Quân', gender: 'Nam', specialty: 'Tai Mũi Họng', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.5 },
  { id: '11235', fullName: 'BS. Võ Anh Khoa', gender: 'Nam', specialty: 'Nội tiết', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.6 },
  { id: '12236', fullName: 'BS. Bùi Hồng Nhung', gender: 'Nữ', specialty: 'Tim mạch', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.7 },
  { id: '13237', fullName: 'BS. Nguyễn Gia Hân', gender: 'Nữ', specialty: 'Sản phụ khoa', branch: 'Chi nhánh B', hasCurrentShift: false, hasActiveAppointment: false, rating: 4.4 },
  { id: '14238', fullName: 'BS. Đặng Nhật Minh', gender: 'Nam', specialty: 'Nhi khoa', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.8 },
  { id: '15239', fullName: 'BS. Lâm Thảo Vy', gender: 'Nữ', specialty: 'Da liễu', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.9 },
  { id: '16240', fullName: 'BS. Trịnh Quốc Bảo', gender: 'Nam', specialty: 'Tai Mũi Họng', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.3 },
  { id: '17241', fullName: 'BS. Huỳnh Kim Ngân', gender: 'Nữ', specialty: 'Nội tiết', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.6 },
  { id: '18242', fullName: 'BS. Mai Đức Huy', gender: 'Nam', specialty: 'Tim mạch', branch: 'Chi nhánh A', hasCurrentShift: false, hasActiveAppointment: false, rating: 4.5 },
  { id: '19243', fullName: 'BS. Phan Khánh Linh', gender: 'Nữ', specialty: 'Sản phụ khoa', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.8 },
  { id: '20244', fullName: 'BS. Cao Thanh Tùng', gender: 'Nam', specialty: 'Nhi khoa', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.7 },
  { id: '21245', fullName: 'BS. Lý Minh Châu', gender: 'Nữ', specialty: 'Da liễu', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.6 },
  { id: '22246', fullName: 'BS. Hà Tuấn Kiệt', gender: 'Nam', specialty: 'Tai Mũi Họng', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.4 },
  { id: '23247', fullName: 'BS. Vũ Quỳnh Anh', gender: 'Nữ', specialty: 'Nội tiết', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.9 },
  { id: '24248', fullName: 'BS. Trương Hải Đăng', gender: 'Nam', specialty: 'Tim mạch', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.8 },
  { id: '25249', fullName: 'BS. Đinh Phương Nhi', gender: 'Nữ', specialty: 'Sản phụ khoa', branch: 'Chi nhánh C', hasCurrentShift: false, hasActiveAppointment: false, rating: 4.5 },
  { id: '26250', fullName: 'BS. Hồ Bảo Long', gender: 'Nam', specialty: 'Nhi khoa', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.7 },
  { id: '27251', fullName: 'BS. Châu Mỹ Duyên', gender: 'Nữ', specialty: 'Da liễu', branch: 'Chi nhánh C', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.6 },
  { id: '28252', fullName: 'BS. Dương Khắc Hưng', gender: 'Nam', specialty: 'Tai Mũi Họng', branch: 'Chi nhánh A', hasCurrentShift: true, hasActiveAppointment: true, rating: 4.5 },
  { id: '29253', fullName: 'BS. Tạ Ngọc Diệp', gender: 'Nữ', specialty: 'Nội tiết', branch: 'Chi nhánh B', hasCurrentShift: true, hasActiveAppointment: false, rating: 4.8 },
  { id: '30254', fullName: 'BS. Lưu Thành Đạt', gender: 'Nam', specialty: 'Tim mạch', branch: 'Chi nhánh C', hasCurrentShift: false, hasActiveAppointment: false, rating: 4.4 },
]

function makeDoctor(seed: DoctorSeed, index: number): Doctor {
  const yearsExperience = 6 + (index % 13)
  const consultationFee = 220000 + (index % 5) * 20000
  const examinationFee = 360000 + (index % 6) * 30000
  const username = seed.fullName
    .replace(/^BS\.\s*/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '')
    .toLowerCase()

  return {
    id: seed.id,
    fullName: seed.fullName,
    gender: seed.gender,
    birthday: `${1980 + (index % 16)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 25) + 1).padStart(2, '0')}`,
    phone: `09${String(12345678 + index).padStart(8, '0')}`,
    email: `${username}@serene.health`,
    address: `${12 + index} Nguyễn Văn Cừ, Quận ${1 + (index % 12)}, TP.HCM`,
    avatarColor: defaultAvatarColor,
    specialty: seed.specialty,
    branch: seed.branch,
    degree: index % 3 === 0 ? 'Bác sĩ Chuyên khoa II' : index % 3 === 1 ? 'Thạc sĩ Y khoa' : 'Bác sĩ Chuyên khoa I',
    yearsExperience,
    shortBio: `Chuyên tư vấn và điều trị các vấn đề thuộc chuyên khoa ${seed.specialty.toLowerCase()}.`,
    consultationFee,
    examinationFee,
    hasCurrentShift: seed.hasCurrentShift,
    hasActiveAppointment: seed.hasActiveAppointment,
    status: deriveDoctorStatus(seed),
    schedule: [
      { day: 'Thứ 2 - Thứ 6', time: index % 2 === 0 ? '08:00 - 17:00' : '09:00 - 18:00' },
      { day: index % 3 === 0 ? 'Thứ 7' : 'Chủ nhật', time: '08:00 - 12:00' },
    ],
    rating: seed.rating,
    appointmentsToday: seed.hasCurrentShift ? 4 + (index % 7) : 0,
    totalConsultations: 720 + index * 47,
    completionRate: 90 + (index % 9),
    csat: Math.min(5, Number((seed.rating - 0.1).toFixed(1))),
    reviews: [
      {
        id: `review-${seed.id}`,
        patientName: index % 2 === 0 ? 'Minh Anh' : 'Quốc Huy',
        rating: seed.rating,
        comment: 'Bác sĩ tư vấn rõ ràng, thân thiện và theo sát kế hoạch điều trị.',
      },
    ],
    username,
  }
}

export const initialDoctors: Doctor[] = doctorSeeds.map(makeDoctor)
