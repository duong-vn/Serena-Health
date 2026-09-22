import { useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'

interface Clinic { id: string; name: string; address: string }
interface Service { id: string; name: string }
interface Doctor { id: string; clinicId: string; serviceId: string; user: { fullName: string }; biography?: string; consultationFee: string }
interface Slot { startAt: string; endAt: string; available: boolean }

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
  const freeSlots = slots.data?.slots.filter((item) => item.available) ?? []
  const doctor = doctors.data?.find((item) => item.id === doctorId)
  const availableDoctors =
    doctors.data?.filter(
      (item) => (!clinicId || item.clinicId === clinicId) && (!serviceId || item.serviceId === serviceId)
    ) ?? []

  const doctorInitial = doctor?.user?.fullName ? doctor.user.fullName.charAt(0).toUpperCase() : 'B'

  return (
    <div className="booking-form-wrapper">
      {(clinics.error || services.error || doctors.error) && (
        <div role="alert" className="portal-error">
          {(clinics.error || services.error || doctors.error)?.message}
        </div>
      )}

      <form
        className="portal-form"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!doctor || !confirmed || !slot) return
          setBusy(true)
          setError('')
          try {
            await api('/appointments', {
              method: 'POST',
              body: JSON.stringify({
                doctorId,
                serviceId: doctor.serviceId,
                startAt: slot,
                reason,
              }),
            })
            onBooked()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể đặt lịch')
            slots.reload()
            setSlot('')
            setConfirmed(false)
          } finally {
            setBusy(false)
          }
        }}
      >
        {/* Step 1: Filters */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="clinic-select">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Cơ sở phòng khám
            </label>
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

          <div className="form-group">
            <label className="form-label" htmlFor="service-select">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Chuyên khoa thăm khám
            </label>
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
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Doctor select */}
        <div className="form-group">
          <label className="form-label" htmlFor="doctor-select">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Bác sĩ phụ trách *
          </label>
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
                {item.user.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Spotlight Card */}
        {doctor && (
          <div className="doctor-spotlight-card">
            <div className="doctor-spotlight-info">
              <div className="doctor-spotlight-avatar">{doctorInitial}</div>
              <div>
                <h3 className="doctor-spotlight-name">Bác sĩ {doctor.user.fullName}</h3>
                <p className="doctor-spotlight-bio">{doctor.biography || 'Bác sĩ chuyên khoa tại Serene Health'}</p>
              </div>
            </div>
            <div className="doctor-fee-badge">
              Phí khám: {Number(doctor.consultationFee).toLocaleString('vi-VN')} ₫
            </div>
          </div>
        )}

        {/* Step 3: Date & Slots */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="appointment-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Ngày khám *
            </label>
            <input
              id="appointment-date"
              className="form-input"
              required
              type="date"
              value={date}
              min={new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })}
              onChange={(event) => {
                setDate(event.target.value)
                setSlot('')
                setConfirmed(false)
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Khung giờ trống *
            </label>
            {!doctorId || !date ? (
              <div style={{ padding: '12px 14px', background: 'var(--sh-slate-50)', borderRadius: '8px', color: 'var(--sh-slate-500)', fontSize: '13px' }}>
                Vui lòng chọn bác sĩ và ngày khám để xem danh sách giờ trống.
              </div>
            ) : slots.loading ? (
              <div style={{ padding: '12px 14px', background: 'var(--sh-slate-50)', borderRadius: '8px', color: 'var(--sh-blue-600)', fontSize: '13px', fontWeight: 600 }}>
                Đang kiểm tra lịch trống của bác sĩ…
              </div>
            ) : freeSlots.length === 0 ? (
              <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '8px', color: '#b45309', fontSize: '13px' }}>
                Không còn giờ trống trong ngày này. Vui lòng chọn ngày khác.
              </div>
            ) : (
              <div className="slot-chips-grid">
                {freeSlots.map((item) => {
                  const isSelected = slot === item.startAt
                  const timeLabel = new Date(item.startAt).toLocaleTimeString('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  return (
                    <button
                      type="button"
                      key={item.startAt}
                      className={`slot-chip ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSlot(item.startAt)
                        setConfirmed(false)
                      }}
                    >
                      {timeLabel}
                    </button>
                  )
                })}
              </div>
            )}
            {slots.error && <p role="alert" className="portal-error">{slots.error.message}</p>}
          </div>
        </div>

        {/* Step 4: Reason & Confirmation */}
        <div className="form-group">
          <label className="form-label" htmlFor="appointment-reason">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Lý do khám hoặc triệu chứng sơ bộ *
          </label>
          <textarea
            id="appointment-reason"
            className="form-textarea"
            required
            rows={3}
            maxLength={2000}
            placeholder="Mô tả cụ thể triệu chứng, thời gian xuất hiện hoặc mục đích khám..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>

        {slot && doctor && (
          <div className="booking-summary-voucher">
            <label className="booking-confirm-checkbox">
              <input
                required
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span>
                Tôi xác nhận thông tin lịch khám với <strong>Bác sĩ {doctor.user.fullName}</strong> vào lúc{' '}
                <strong>
                  {new Date(slot).toLocaleString('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </strong>
                .
              </span>
            </label>
          </div>
        )}

        {error && <div role="alert" className="portal-error">{error}</div>}

        <button className="btn-primary-action" disabled={busy || !confirmed || !slot}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {busy ? 'Đang hoàn tất đặt lịch…' : 'Xác nhận đặt lịch ngay'}
        </button>
      </form>
    </div>
  )
}
