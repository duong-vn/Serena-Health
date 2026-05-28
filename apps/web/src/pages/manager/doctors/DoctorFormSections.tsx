import { branches, specialties } from './doctorMockData'
import type { DoctorFormErrors, DoctorFormValues } from './doctorTypes'

type DoctorFormSectionsProps = {
  values: DoctorFormValues
  errors: DoctorFormErrors
  includeAccountSection: boolean
  onChange: <Key extends keyof DoctorFormValues>(field: Key, value: DoctorFormValues[Key]) => void
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="doctor-field-error">{message}</span> : null
}

function TextField({
  label,
  value,
  error,
  type = 'text',
  placeholder,
  onChange,
}: {
  label: string
  value: string
  error?: string
  type?: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="doctor-form-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      <FieldError message={error} />
    </label>
  )
}

function SelectField({
  label,
  value,
  error,
  options,
  onChange,
}: {
  label: string
  value: string
  error?: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="doctor-form-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  )
}

export function DoctorFormSections({ values, errors, includeAccountSection, onChange }: DoctorFormSectionsProps) {
  return (
    <div className="doctor-form-sections">
      <section className="doctor-form-section" id="doctor-personal">
        <h2>Thông tin cá nhân</h2>
        <div className="doctor-avatar-upload" aria-hidden="true" style={{ backgroundColor: values.avatarColor }}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
          </svg>
        </div>
        <div className="doctor-form-grid">
          <TextField label="Họ và tên" value={values.fullName} error={errors.fullName} onChange={(value) => onChange('fullName', value)} />
          <SelectField label="Giới tính" value={values.gender} error={errors.gender} options={['Nam', 'Nữ', 'Khác']} onChange={(value) => onChange('gender', value)} />
          <TextField label="Ngày sinh" type="date" value={values.birthday} error={errors.birthday} onChange={(value) => onChange('birthday', value)} />
          <TextField label="Số điện thoại" value={values.phone} error={errors.phone} onChange={(value) => onChange('phone', value.replace(/\D/g, '').slice(0, 10))} />
          <TextField label="Email" type="email" value={values.email} error={errors.email} onChange={(value) => onChange('email', value)} />
          <TextField label="Địa chỉ" value={values.address} error={errors.address} onChange={(value) => onChange('address', value)} />
        </div>
      </section>

      <section className="doctor-form-section" id="doctor-professional">
        <h2>Thông tin chuyên môn</h2>
        <div className="doctor-form-grid">
          <SelectField label="Chuyên khoa" value={values.specialty} error={errors.specialty} options={specialties} onChange={(value) => onChange('specialty', value)} />
          <TextField label="Bằng cấp" value={values.degree} error={errors.degree} onChange={(value) => onChange('degree', value)} />
          <TextField label="Số năm kinh nghiệm" type="number" value={values.yearsExperience} error={errors.yearsExperience} onChange={(value) => onChange('yearsExperience', value)} />
          <TextField label="Giá tư vấn" type="number" value={values.consultationFee} error={errors.consultationFee} onChange={(value) => onChange('consultationFee', value)} />
          <TextField label="Giá khám" type="number" value={values.examinationFee} error={errors.examinationFee} onChange={(value) => onChange('examinationFee', value)} />
          <label className="doctor-form-field doctor-form-field-wide">
            <span>Mô tả ngắn</span>
            <textarea value={values.shortBio} onChange={(event) => onChange('shortBio', event.target.value)} />
            <FieldError message={errors.shortBio} />
          </label>
        </div>
      </section>

      <section className="doctor-form-section" id="doctor-work">
        <h2>Thông tin làm việc</h2>
        <div className="doctor-form-grid">
          <SelectField label="Chi nhánh làm việc" value={values.branch} error={errors.branch} options={branches} onChange={(value) => onChange('branch', value)} />
          <label className="doctor-form-field">
            <span>Trạng thái</span>
            <select
              value={values.hasCurrentShift ? (values.hasActiveAppointment ? 'busy' : 'online') : 'offline'}
              onChange={(event) => {
                onChange('hasCurrentShift', event.target.value !== 'offline')
                onChange('hasActiveAppointment', event.target.value === 'busy')
              }}
            >
              <option value="online">Đang hoạt động</option>
              <option value="busy">Đang khám</option>
              <option value="offline">Đang ngoại tuyến</option>
            </select>
          </label>
          <label className="doctor-form-field doctor-form-field-wide">
            <span>Lịch làm việc cơ bản</span>
            <textarea value={values.scheduleText} onChange={(event) => onChange('scheduleText', event.target.value)} />
            <FieldError message={errors.scheduleText} />
          </label>
        </div>
      </section>

      {includeAccountSection ? (
        <section className="doctor-form-section" id="doctor-account">
          <h2>Tài khoản hệ thống</h2>
          <div className="doctor-form-grid">
            <TextField label="Tên đăng nhập" value={values.username} error={errors.username} onChange={(value) => onChange('username', value)} />
            <TextField label="Mật khẩu khởi tạo" type="password" value={values.password} error={errors.password} onChange={(value) => onChange('password', value)} />
            <TextField label="Xác nhận mật khẩu" type="password" value={values.confirmPassword} error={errors.confirmPassword} onChange={(value) => onChange('confirmPassword', value)} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
