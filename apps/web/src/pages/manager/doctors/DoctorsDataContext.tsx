import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { api } from '../../../api/client'
import { doctorToFormValues } from './doctorMockData'
import type { Branch, Doctor, DoctorFormValues, Gender, Specialty } from './doctorTypes'

interface ApiDoctorSchedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
}

interface ApiDoctor {
  id: string
  userId: string
  fullName: string
  gender: string | null
  birthday: string | null
  phone: string | null
  email: string
  address: string | null
  avatarColor: string | null
  specialty: string
  clinic: { id: string; name: string }
  service: { id: string; name: string; specialty: string }
  licenseNumber: string
  degree: string | null
  biography: string | null
  yearsExperience: number | null
  consultationFee: number | null
  examinationFee: number | null
  active: boolean
  schedule: ApiDoctorSchedule[]
}

interface DoctorListPayload {
  items: ApiDoctor[]
  total: number
  page: number
  pageSize: number
}

interface ClinicItem { id: string; name: string }
interface ServiceItem { id: string; name: string; specialty: string }
interface CatalogPayload<T> { items: T[] }

interface DoctorsDataContextValue {
  doctors: Doctor[]
  clinics: ClinicItem[]
  services: ServiceItem[]
  loading: boolean
  error: Error | null
  reload: () => void
  getDoctorById: (doctorId: string) => Doctor | undefined
  addDoctor: (values: DoctorFormValues) => Promise<Doctor>
  updateDoctor: (doctorId: string, values: DoctorFormValues) => Promise<void>
  deleteDoctor: (doctorId: string) => Promise<void>
}

const DoctorsDataContext = createContext<DoctorsDataContextValue | null>(null)
const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function toUiDoctor(doctor: ApiDoctor): Doctor {
  return {
    address: doctor.address || '',
    appointmentsToday: 0,
    avatarColor: doctor.avatarColor || '#dcebff',
    birthday: doctor.birthday?.slice(0, 10) || '',
    branch: doctor.clinic.name as Branch,
    completionRate: 0,
    consultationFee: doctor.consultationFee || 0,
    csat: 0,
    degree: doctor.degree || '',
    email: doctor.email,
    examinationFee: doctor.examinationFee || 0,
    fullName: doctor.fullName,
    gender: (doctor.gender === 'FEMALE' ? 'Nữ' : doctor.gender === 'MALE' ? 'Nam' : 'Khác') as Gender,
    hasActiveAppointment: false,
    hasCurrentShift: doctor.active && doctor.schedule.some((item) => item.active),
    id: doctor.id,
    phone: doctor.phone || '',
    rating: 0,
    reviews: [],
    schedule: doctor.schedule.filter((item) => item.active).map((item) => ({ day: dayNames[item.dayOfWeek] || `Ngày ${item.dayOfWeek}`, time: `${item.startTime} - ${item.endTime}` })),
    shortBio: doctor.biography || '',
    specialty: (doctor.service.specialty || doctor.specialty) as Specialty,
    status: doctor.active ? 'online' : 'offline',
    totalConsultations: 0,
    username: doctor.email,
    yearsExperience: doctor.yearsExperience || 0,
  }
}

function toApiInput(values: DoctorFormValues, clinics: ClinicItem[], services: ServiceItem[], includePassword: boolean) {
  const clinic = clinics.find((item) => item.id === values.branch || item.name === values.branch)
  const service = services.find((item) => item.id === values.specialty || item.name === values.specialty || item.specialty === values.specialty)
  if (!clinic || !service) throw new Error('Chi nhánh hoặc dịch vụ đã chọn không còn khả dụng.')

  return {
    active: values.hasCurrentShift,
    address: values.address.trim() || undefined,
    biography: values.shortBio.trim() || undefined,
    birthday: values.birthday || undefined,
    clinicId: clinic.id,
    consultationFee: Number(values.consultationFee || 0),
    degree: values.degree.trim() || undefined,
    email: values.email.trim(),
    examinationFee: Number(values.examinationFee || 0),
    fullName: values.fullName.trim(),
    gender: values.gender === 'Nữ' ? 'FEMALE' : values.gender === 'Nam' ? 'MALE' : 'OTHER',
    licenseNumber: values.username.trim(),
    ...(includePassword && values.password ? { password: values.password } : {}),
    phone: values.phone.trim() || undefined,
    serviceId: service.id,
    yearsExperience: Number(values.yearsExperience || 0),
  }
}

export function DoctorsDataProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [clinics, setClinics] = useState<ClinicItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((current) => current + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([
      api<DoctorListPayload>('/manager/doctors?page=1&pageSize=100'),
      api<CatalogPayload<ClinicItem>>('/catalog/clinics'),
      api<CatalogPayload<ServiceItem>>('/catalog/services'),
    ]).then(([doctorData, clinicData, serviceData]) => {
      if (!active) return
      setDoctors(doctorData.items.map(toUiDoctor))
      setClinics(clinicData.items)
      setServices(serviceData.items)
    }).catch((nextError: unknown) => {
      if (active) setError(nextError instanceof Error ? nextError : new Error('Không thể tải danh sách bác sĩ.'))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [version])

  const value = useMemo<DoctorsDataContextValue>(() => ({
    addDoctor: async (values) => {
      const created = await api<ApiDoctor>('/manager/doctors', { body: JSON.stringify(toApiInput(values, clinics, services, true)), method: 'POST' })
      const doctor = toUiDoctor(created)
      setDoctors((current) => [doctor, ...current])
      return doctor
    },
    clinics,
    deleteDoctor: async (doctorId) => {
      await api<ApiDoctor>(`/manager/doctors/${doctorId}`, { method: 'DELETE' })
      setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId))
    },
    doctors,
    error,
    getDoctorById: (doctorId) => doctors.find((doctor) => doctor.id === doctorId),
    loading,
    reload,
    services,
    updateDoctor: async (doctorId, values) => {
      const existing = doctors.find((doctor) => doctor.id === doctorId)
      if (!existing) throw new Error('Không tìm thấy bác sĩ cần cập nhật.')
      const updated = await api<ApiDoctor>(`/manager/doctors/${doctorId}`, {
        body: JSON.stringify(toApiInput({ ...doctorToFormValues(existing), ...values }, clinics, services, false)),
        method: 'PATCH',
      })
      setDoctors((current) => current.map((doctor) => doctor.id === doctorId ? toUiDoctor(updated) : doctor))
    },
  }), [clinics, doctors, error, loading, reload, services])

  return <DoctorsDataContext.Provider value={value}>{children}</DoctorsDataContext.Provider>
}

export function useDoctorsData() {
  const context = useContext(DoctorsDataContext)
  if (!context) throw new Error('useDoctorsData must be used inside DoctorsDataProvider')
  return context
}
