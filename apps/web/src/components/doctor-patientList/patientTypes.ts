export type PatientStatus = 'waiting' | 'completed' | 'in-progress' | 'priority'

export type PatientProfile = {
  id: string
  fullName: string
  gender: 'Nam' | 'Nữ'
  age: number
  phone: string
  examType: 'Tư vấn' | 'Khám trực tiếp' | 'Cả hai'
  status: PatientStatus
}
