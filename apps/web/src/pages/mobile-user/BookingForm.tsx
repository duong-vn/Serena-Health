import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'

interface Clinic {
  id: string
  name: string
  address: string
}

interface Service {
  id: string
  name: string
  specialty?: string
}

interface Doctor {
  id: string
  clinicId: string
  serviceId: string
  user: { fullName: string }
  biography?: string
  consultationFee: string
  clinic?: { id: string; name: string; address: string }
  service?: { id: string; name: string; specialty?: string }
}

interface Slot {
  startAt: string
  endAt: string
  available: boolean
}

function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

function getTomorrowString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
}

function getLocalHour(isoString: string): number {
  const dt = new Date(isoString)
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: 'numeric',
    hour12: false,
  }).format(dt)
  return parseInt(hourStr, 10)
}

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingForm({ onBooked }: { onBooked: () => void }) {
  const clinics = useApi<Clinic[]>('/catalog/clinics')
  const services = useApi<Service[]>('/catalog/services')
  const doctors = useApi<Doctor[]>('/catalog/doctors')

  const [clinicId, setClinicId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const slots = useApi<{ slots: Slot[] }>(
    doctorId && date ? `/catalog/doctors/${doctorId}/availability?date=${date}` : null
  )

  const freeSlots = useMemo(() => {
    return slots.data?.slots.filter((item) => item.available) ?? []
  }, [slots.data])

  const morningSlots = useMemo(() => {
    return freeSlots.filter((item) => getLocalHour(item.startAt) < 12)
  }, [freeSlots])

  const afternoonSlots = useMemo(() => {
    return freeSlots.filter((item) => getLocalHour(item.startAt) >= 12)
  }, [freeSlots])

  const doctor = doctors.data?.find((item) => item.id === doctorId)
  const availableDoctors = useMemo(() => {
    return (
      doctors.data?.filter(
        (item) => (!clinicId || item.clinicId === clinicId) && (!serviceId || item.serviceId === serviceId)
      ) ?? []
    )
  }, [doctors.data, clinicId, serviceId])

  const doctorInitial = doctor?.user?.fullName ? doctor.user.fullName.charAt(0).toUpperCase() : 'B'
  const todayMin = getTodayString()
  const tomorrowStr = getTomorrowString()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!doctor) {
      setError('Vui lòng chọn bác sĩ phụ trách thăm khám.')
      return
    }
    if (!date) {
      setError('Vui lòng chọn ngày khám.')
      return
    }
    if (!slot) {
      setError('Vui lòng chọn khung giờ khám còn trống.')
      return
    }
    if (!confirmed) {
      setError('Vui lòng tích chọn ô cam kết xác nhận thông tin lịch khám ở cuối form.')
      return
    }

    setBusy(true)
    setError('')
    try {
      await api('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId,
          serviceId: doctor.serviceId,
          startAt: slot,
          reason: reason.trim() || undefined,
        }),
      })
      onBooked()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lịch. Vui lòng thử lại.')
      slots.reload()
      setSlot('')
      setConfirmed(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="booking-form-wrapper">
      {(clinics.error || services.error || doctors.error) && (
        <div role="alert" className="portal-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{(clinics.error || services.error || doctors.error)?.message}</span>
        </div>
      )}

      <form className="portal-form" onSubmit={handleSubmit}>
        {/* Step 1: Chọn Chuyên khoa & Bác sĩ */}
        <section className="booking-section-card">
          <div className="booking-step-header">
            <div className="booking-step-badge">1</div>
            <div>
              <h3 className="booking-step-title">Chọn Bác sĩ & Chuyên khoa</h3>
              <p className="booking-step-desc">Lọc theo cơ sở hoặc chuyên khoa để tìm bác sĩ phù hợp</p>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="clinic-select">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Cơ sở phòng khám
              </label>
              <div className="select-wrapper">
                <select
                  id="clinic-select"
                  className="form-select"
                  value={clinicId}
                  onChange={(event) => {
                    setClinicId(event.target.value)
                    setDoctorId('')
                    setSlot('')
                    setConfirmed(false)
                  }}
                >
                  <option value="">Tất cả cơ sở phòng khám</option>
                  {clinics.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.address}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service-select">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Chuyên khoa khám
              </label>
              <div className="select-wrapper">
                <select
                  id="service-select"
                  className="form-select"
                  value={serviceId}
                  onChange={(event) => {
                    setServiceId(event.target.value)
                    setDoctorId('')
                    setSlot('')
                    setConfirmed(false)
                  }}
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {services.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} {item.specialty ? `(${item.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor-select">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Bác sĩ phụ trách *
            </label>
            <div className="select-wrapper">
              <select
                id="doctor-select"
                className="form-select"
                required
                value={doctorId}
                onChange={(event) => {
                  setDoctorId(event.target.value)
                  setSlot('')
                  setConfirmed(false)
                }}
              >
                <option value="">-- Vui lòng chọn Bác sĩ --</option>
                {availableDoctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    Bác sĩ {item.user.fullName} {item.service ? `— ${item.service.name}` : ''} {item.clinic ? `(${item.clinic.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {availableDoctors.length === 0 && (clinicId || serviceId) && (
              <p className="form-field-hint warning">
                Không có bác sĩ nào phù hợp với bộ lọc hiện tại. Vui lòng chọn lại cơ sở hoặc chuyên khoa.
              </p>
            )}
          </div>

          {/* Doctor Spotlight Card */}
          {doctor && (
            <div className="doctor-spotlight-card">
              <div className="doctor-spotlight-left">
                <div className="doctor-spotlight-avatar">{doctorInitial}</div>
                <div className="doctor-spotlight-details">
                  <div className="doctor-spotlight-title-row">
                    <h4 className="doctor-spotlight-name">Bác sĩ {doctor.user.fullName}</h4>
                    {doctor.service?.name && (
                      <span className="doctor-specialty-badge">{doctor.service.name}</span>
                    )}
                  </div>
                  <p className="doctor-spotlight-bio">
                    {doctor.biography || 'Bác sĩ chuyên khoa tại Serene Health với nhiều năm kinh nghiệm.'}
                  </p>
                  {doctor.clinic?.name && (
                    <div className="doctor-clinic-location">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{doctor.clinic.name} — {doctor.clinic.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Step 2: Chọn Thời gian & Giờ khám */}
        <section className="booking-section-card">
          <div className="booking-step-header">
            <div className="booking-step-badge">2</div>
            <div>
              <h3 className="booking-step-title">Chọn Ngày & Khung giờ khám</h3>
              <p className="booking-step-desc">Khung giờ trống 30 phút theo lịch trực của bác sĩ</p>
            </div>
          </div>

          <div className="form-group">
            <div className="date-label-row">
              <label className="form-label" htmlFor="appointment-date">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Ngày khám mong muốn *
              </label>
              <div className="quick-date-buttons">
                <button
                  type="button"
                  className={`btn-quick-date ${date === todayMin ? 'is-active' : ''}`}
                  onClick={() => {
                    setDate(todayMin)
                    setSlot('')
                    setConfirmed(false)
                  }}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  className={`btn-quick-date ${date === tomorrowStr ? 'is-active' : ''}`}
                  onClick={() => {
                    setDate(tomorrowStr)
                    setSlot('')
                    setConfirmed(false)
                  }}
                >
                  Ngày mai
                </button>
              </div>
            </div>
            <input
              id="appointment-date"
              className="form-input"
              required
              type="date"
              value={date}
              min={todayMin}
              onChange={(event) => {
                setDate(event.target.value)
                setSlot('')
                setConfirmed(false)
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Khung giờ khám khả dụng *
            </label>

            {!doctorId ? (
              <div className="slot-empty-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Vui lòng chọn Bác sĩ ở Bước 1 để kiểm tra lịch trực.</span>
              </div>
            ) : !date ? (
              <div className="slot-empty-notice">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
                <span>Vui lòng chọn Ngày khám để xem các giờ khám còn trống.</span>
              </div>
            ) : slots.loading ? (
              <div className="slot-loading-notice">
                <div className="slot-spinner" />
                <span>Đang tải các khung giờ trống của bác sĩ…</span>
              </div>
            ) : freeSlots.length === 0 ? (
              <div className="slot-empty-warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Không có khung giờ trống nào trong ngày này. Vui lòng chọn ngày khác.</span>
              </div>
            ) : (
              <div className="slots-wrapper">
                {morningSlots.length > 0 && (
                  <div className="slots-period-block">
                    <div className="slots-period-heading">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      </svg>
                      <span>Buổi sáng ({morningSlots.length} khung giờ)</span>
                    </div>
                    <div className="slot-chips-grid">
                      {morningSlots.map((item) => {
                        const isSelected = slot === item.startAt
                        return (
                          <button
                            type="button"
                            key={item.startAt}
                            className={`slot-chip ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSlot(item.startAt)
                              setConfirmed(false)
                              setError('')
                            }}
                          >
                            <span className="slot-chip-time">{formatSlotTime(item.startAt)}</span>
                            {isSelected && <span className="slot-chip-check">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div className="slots-period-block">
                    <div className="slots-period-heading">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 18a5 5 0 0 0-10 0" />
                        <line x1="12" y1="2" x2="12" y2="9" />
                        <line x1="4.22" y1="10.22" x2="5.64" y2="11.64" />
                        <line x1="19.78" y1="11.64" x2="18.36" y2="10.22" />
                      </svg>
                      <span>Buổi chiều ({afternoonSlots.length} khung giờ)</span>
                    </div>
                    <div className="slot-chips-grid">
                      {afternoonSlots.map((item) => {
                        const isSelected = slot === item.startAt
                        return (
                          <button
                            type="button"
                            key={item.startAt}
                            className={`slot-chip ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSlot(item.startAt)
                              setConfirmed(false)
                              setError('')
                            }}
                          >
                            <span className="slot-chip-time">{formatSlotTime(item.startAt)}</span>
                            {isSelected && <span className="slot-chip-check">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {slots.error && <p role="alert" className="portal-error">{slots.error.message}</p>}
          </div>
        </section>

        {/* Step 3: Lý do & Xác nhận */}
        <section className="booking-section-card">
          <div className="booking-step-header">
            <div className="booking-step-badge">3</div>
            <div>
              <h3 className="booking-step-title">Lý do khám & Xác nhận</h3>
              <p className="booking-step-desc">Cung cấp triệu chứng sơ bộ để bác sĩ chuẩn bị chu đáo</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="appointment-reason">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Mô tả triệu chứng hoặc lý do khám
            </label>
            <textarea
              id="appointment-reason"
              className="form-textarea"
              rows={3}
              maxLength={2000}
              placeholder="Ví dụ: Đau đầu kéo dài 3 ngày, kèm hoa mắt chóng mặt khi đứng dậy..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <div className="textarea-footer">
              <span className="char-count">{reason.length}/2000 ký tự</span>
            </div>
          </div>

          {/* Booking Summary Voucher */}
          {slot && doctor && (
            <div className="booking-summary-voucher">
              <div className="voucher-header">
                <div className="voucher-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="voucher-title">Tóm tắt thông tin lịch hẹn</h4>
                  <p className="voucher-sub">Vui lòng kiểm tra kỹ trước khi hoàn tất đăng ký</p>
                </div>
              </div>

              <div className="voucher-grid">
                <div className="voucher-item">
                  <span className="voucher-item-label">Bác sĩ khám</span>
                  <strong className="voucher-item-val">Bác sĩ {doctor.user.fullName}</strong>
                </div>
                <div className="voucher-item">
                  <span className="voucher-item-label">Chuyên khoa</span>
                  <strong className="voucher-item-val">{doctor.service?.name || 'Đa khoa'}</strong>
                </div>
                <div className="voucher-item">
                  <span className="voucher-item-label">Thời gian</span>
                  <strong className="voucher-item-val voucher-time-highlight">
                    {new Date(slot).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
                <div className="voucher-item">
                  <span className="voucher-item-label">Cơ sở khám</span>
                  <strong className="voucher-item-val">{doctor.clinic?.name || 'Phòng khám Serene Health'}</strong>
                </div>
              </div>

              <label className="booking-confirm-checkbox">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => {
                    setConfirmed(event.target.checked)
                    if (event.target.checked) setError('')
                  }}
                />
                <span className="checkbox-text">
                  Tôi đã kiểm tra kỹ và cam kết có mặt đúng giờ theo lịch hẹn với <strong>Bác sĩ {doctor.user.fullName}</strong>.
                </span>
              </label>
            </div>
          )}

          {error && (
            <div role="alert" className="portal-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="booking-action-bar">
            <button
              type="submit"
              className="btn-primary-action btn-booking-submit"
              disabled={busy}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{busy ? 'Đang hoàn tất đặt lịch…' : 'Xác nhận đăng ký lịch khám'}</span>
            </button>
            {!slot && (
              <p className="submit-hint">Vui lòng hoàn thành chọn Bác sĩ và Giờ khám ở các bước trên.</p>
            )}
            {slot && !confirmed && (
              <p className="submit-hint warning">Vui lòng tích chọn ô cam kết ở trên trước khi bấm xác nhận.</p>
            )}
          </div>
        </section>
      </form>
    </div>
  )
}
