export type DoctorStatus = 'online' | 'offline' | 'busy'
export type Specialty = string
export type Branch = string
export type Gender = 'Nam' | 'Nữ' | 'Khác'

export interface DoctorSchedule { day: string; time: string }
export interface DoctorReview { id: string; patientName: string; rating: number; comment: string }

export interface Doctor {
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

export interface DoctorFormValues {
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
