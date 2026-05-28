import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  deriveDoctorStatus,
  doctorToFormValues,
  initialDoctors,
  parseScheduleText,
} from './doctorMockData'
import type { Branch, Doctor, DoctorFormValues, Gender, Specialty } from './doctorTypes'

type DoctorsDataContextValue = {
  doctors: Doctor[]
  getDoctorById: (doctorId: string) => Doctor | undefined
  addDoctor: (values: DoctorFormValues) => Doctor
  updateDoctor: (doctorId: string, values: DoctorFormValues) => void
  deleteDoctor: (doctorId: string) => void
}

const DoctorsDataContext = createContext<DoctorsDataContextValue | null>(null)

function createDoctorId(existingDoctors: Doctor[]) {
  const maxId = existingDoctors.reduce((max, doctor) => Math.max(max, Number(doctor.id) || 0), 0)
  return String(maxId + 1)
}

function buildDoctorFromForm(values: DoctorFormValues, existingDoctor?: Doctor, nextId?: string): Doctor {
  const baseDoctor: Doctor =
    existingDoctor ??
    ({
      id: nextId ?? '1',
      rating: 0,
      appointmentsToday: 0,
      totalConsultations: 0,
      completionRate: 0,
      csat: 0,
      reviews: [],
    } as Doctor)

  const normalizedValues = {
    ...values,
    yearsExperience: Number(values.yearsExperience || 0),
    consultationFee: Number(values.consultationFee || 0),
    examinationFee: Number(values.examinationFee || 0),
    schedule: parseScheduleText(values.scheduleText),
  }

  const nextDoctor: Doctor = {
    ...baseDoctor,
    id: baseDoctor.id,
    fullName: values.fullName.trim(),
    gender: values.gender as Gender,
    birthday: values.birthday,
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    avatarColor: values.avatarColor || '#dcebff',
    specialty: values.specialty as Specialty,
    branch: values.branch as Branch,
    degree: values.degree.trim(),
    yearsExperience: normalizedValues.yearsExperience,
    shortBio: values.shortBio.trim(),
    consultationFee: normalizedValues.consultationFee,
    examinationFee: normalizedValues.examinationFee,
    hasCurrentShift: values.hasCurrentShift,
    hasActiveAppointment: values.hasActiveAppointment,
    status: deriveDoctorStatus(values),
    schedule: normalizedValues.schedule,
    username: values.username.trim(),
  }

  return nextDoctor
}

export function DoctorsDataProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)

  const value = useMemo<DoctorsDataContextValue>(
    () => ({
      doctors,
      getDoctorById: (doctorId) => doctors.find((doctor) => doctor.id === doctorId),
      addDoctor: (values) => {
        const doctor = buildDoctorFromForm(values, undefined, createDoctorId(doctors))
        setDoctors((current) => [doctor, ...current])
        return doctor
      },
      updateDoctor: (doctorId, values) => {
        setDoctors((current) =>
          current.map((doctor) => {
            if (doctor.id !== doctorId) {
              return doctor
            }

            return buildDoctorFromForm({ ...doctorToFormValues(doctor), ...values }, doctor)
          }),
        )
      },
      deleteDoctor: (doctorId) => {
        setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId))
      },
    }),
    [doctors],
  )

  return <DoctorsDataContext.Provider value={value}>{children}</DoctorsDataContext.Provider>
}

export function useDoctorsData() {
  const context = useContext(DoctorsDataContext)

  if (!context) {
    throw new Error('useDoctorsData must be used inside DoctorsDataProvider')
  }

  return context
}
