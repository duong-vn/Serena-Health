export type DoctorStatus = 'online' | 'offline' | 'busy'

export type Specialty = 'Nội tiết' | 'Tim mạch' | 'Sản phụ khoa' | 'Nhi khoa' | 'Da liễu' | 'Tai Mũi Họng'

export type Branch = 'Chi nhánh A' | 'Chi nhánh B' | 'Chi nhánh C'

export type Gender = 'Nam' | 'Nữ' | 'Khác'

export type DoctorSchedule = {
  day: string
  time: string
}

export type DoctorReview = {
  id: string
  patientName: string
  rating: number
  comment: string
}

export type Doctor = {
  id: string
  fullName: string
  gender: Gender
  birthday: string
  phone: string
  email: string
  address: string
  avatarColor: string
  specialty: Specialty
  branch: Branch
  degree: string
  yearsExperience: number
  shortBio: string
  consultationFee: number
  examinationFee: number
  hasCurrentShift: boolean
  hasActiveAppointment: boolean
  status: DoctorStatus
  schedule: DoctorSchedule[]
  rating: number
  appointmentsToday: number
  totalConsultations: number
  completionRate: number
  csat: number
  reviews: DoctorReview[]
  username: string
}

export type DoctorFormValues = {
  fullName: string
  gender: string
  birthday: string
  phone: string
  email: string
  address: string
  avatarColor: string
  specialty: string
  branch: string
  degree: string
  yearsExperience: string
  shortBio: string
  consultationFee: string
  examinationFee: string
  hasCurrentShift: boolean
  hasActiveAppointment: boolean
  scheduleText: string
  username: string
  password: string
  confirmPassword: string
}

export type DoctorFormErrors = Partial<Record<keyof DoctorFormValues, string>>
