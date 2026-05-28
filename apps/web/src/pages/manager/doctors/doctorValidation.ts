import type { Doctor, DoctorFormErrors, DoctorFormValues } from './doctorTypes'

export function validateDoctorForm(values: DoctorFormValues, doctors: Doctor[], currentDoctorId?: string) {
  const errors: DoctorFormErrors = {}
  const requiredFields: Array<keyof DoctorFormValues> = [
    'fullName',
    'gender',
    'birthday',
    'phone',
    'email',
    'address',
    'specialty',
    'degree',
    'yearsExperience',
    'shortBio',
    'consultationFee',
    'examinationFee',
    'branch',
    'scheduleText',
    'username',
  ]

  requiredFields.forEach((field) => {
    if (String(values[field]).trim() === '') {
      errors[field] = 'Không được bỏ trống trường bắt buộc.'
    }
  })

  if (values.email && !values.email.includes('@')) {
    errors.email = 'Email phải đúng định dạng và có @.'
  }

  if (values.phone && !/^\d{10}$/.test(values.phone)) {
    errors.phone = 'Số điện thoại phải gồm đúng 10 số.'
  }

  const normalizedEmail = values.email.trim().toLowerCase()
  const normalizedPhone = values.phone.trim()
  const duplicated = doctors.find(
    (doctor) =>
      doctor.id !== currentDoctorId &&
      (doctor.email.toLowerCase() === normalizedEmail || doctor.phone === normalizedPhone),
  )

  if (duplicated) {
    if (duplicated.email.toLowerCase() === normalizedEmail) {
      errors.email = 'Email đã tồn tại.'
    }
    if (duplicated.phone === normalizedPhone) {
      errors.phone = 'Số điện thoại đã tồn tại.'
    }
  }

  if (!currentDoctorId || values.password || values.confirmPassword) {
    if (!values.password) {
      errors.password = 'Không được bỏ trống trường bắt buộc.'
    } else if (values.password.length < 8) {
      errors.password = 'Mật khẩu phải từ 8 kí tự trở lên.'
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Không được bỏ trống trường bắt buộc.'
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    }
  }

  return errors
}

export function hasFormErrors(errors: DoctorFormErrors) {
  return Object.keys(errors).length > 0
}
