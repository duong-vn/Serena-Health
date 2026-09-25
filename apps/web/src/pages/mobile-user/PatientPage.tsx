import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { SystemLogo } from '../../components/brand/SystemLogo'
import { PatientChat } from './PatientChat'
import { BookingForm } from './BookingForm'
import './PatientPage.css'

interface Conversation {
  id: string
  title: string
}

interface Appointment {
  id: string
  startAt: string
  status: string
  doctor?: { user?: { fullName: string } }
  service?: { name: string }
}

interface Profile {
  bloodType?: string
  allergies?: string[]
  medicalHistory?: string[]
}

const statusMap: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'Đã xác nhận', className: 'status-confirmed' },
  PENDING: { label: 'Chờ xác nhận', className: 'status-pending' },
  CANCELLED: { label: 'Đã hủy', className: 'status-cancelled' },
  COMPLETED: { label: 'Đã hoàn thành', className: 'status-confirmed' },
}

export default function PatientPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<'chat' | 'booking' | 'appointments' | 'profile'>('chat')
  const [conversationId, setConversationId] = useState('')
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches)
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia('(max-width: 900px)').matches)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const sidebarToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)')
    const update = () => {
      setMobile(query.matches)
      setSidebarOpen(!query.matches)
      setProfileOpen(false)
    }
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const shell = shellRef.current
    const viewport = window.visualViewport
    if (!mobile || !shell || !viewport) return
    const update = () => {
      // Preserve native pinch zoom; only follow the unzoomed keyboard viewport.
      if (viewport.scale !== 1) return
      shell.style.setProperty('--patient-viewport-height', `${viewport.height}px`)
      shell.style.setProperty('--patient-viewport-top', `${viewport.offsetTop}px`)
      shell.classList.toggle('has-keyboard', window.innerHeight - viewport.height > 120)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      shell.style.removeProperty('--patient-viewport-height')
      shell.style.removeProperty('--patient-viewport-top')
      shell.classList.remove('has-keyboard')
    }
  }, [mobile])

  useEffect(() => {
    if (sidebarOpen) {
      sidebarRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    } else {
      sidebarToggleRef.current?.focus({ preventScroll: true })
    }
  }, [sidebarOpen])

  const conversations = useApi<Conversation[]>('/conversations')
  const appointments = useApi<Appointment[]>('/appointments')
  const profile = useApi<Profile>('/profile')

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handle clicking outside profile dropdown & escape key
  useEffect(() => {
    if (!profileOpen) return
    profileRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({ preventScroll: true })
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  // Auto-select the first conversation if none selected
  useEffect(() => {
    if (!conversationId && conversations.data && conversations.data.length > 0) {
      setConversationId(conversations.data[0].id)
    }
  }, [conversationId, conversations.data])

  async function createConversation() {
    setBusy(true)
    setError('')
    try {
      const item = await api<Conversation>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Tư vấn sức khỏe tổng quát' }),
      })
      setConversationId(item.id)
      setTab('chat')
      if (mobile) setSidebarOpen(false)
      conversations.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo hội thoại mới')
    } finally {
      setBusy(false)
    }
  }

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'P'

  return (
    <main className="patient-sanctuary" ref={shellRef}>
      {mobile && sidebarOpen && (
        <div className="patient-sidebar-backdrop" aria-hidden="true" onClick={() => { setSidebarOpen(false); setProfileOpen(false) }} />
      )}
      {/* 1. Sidebar: Thin Conversation History */}
      <aside
        id="patient-conversations"
        ref={sidebarRef}
        className={`patient-sidebar ${sidebarOpen ? '' : 'is-collapsed'}`}
        aria-label="Danh sách hội thoại"
        role={mobile && sidebarOpen ? 'dialog' : undefined}
        aria-modal={mobile && sidebarOpen ? true : undefined}
        inert={!sidebarOpen}
        onClick={(event) => {
          if (mobile && (event.target as HTMLElement).closest('[role="menuitem"]')) setSidebarOpen(false)
        }}
        onKeyDown={(event) => {
          if (!mobile || !sidebarOpen) return
          if (event.key === 'Escape') {
            if (profileOpen) {
              setProfileOpen(false)
              profileRef.current?.querySelector<HTMLButtonElement>('.patient-sidebar-user')?.focus()
            } else setSidebarOpen(false)
          }
          if (event.key !== 'Tab') return
          const buttons = Array.from(sidebarRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
          const first = buttons[0]
          const last = buttons.at(-1)
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }}
      >
        <div className="patient-sidebar-brand">
          <div className="patient-brand-link">
            <div className="patient-brand-emblem">
              <SystemLogo className="patient-brand-logo" />
            </div>
            <div className="patient-brand-text">
              <span className="patient-brand-name">
                serene <span className="patient-brand-light">health</span>
              </span>
              <span className="patient-brand-tagline">Hệ thống Y tế & Sức khỏe</span>
            </div>
          </div>
          <button
            className="btn-toggle-sidebar"
            onClick={() => setSidebarOpen(false)}
            title="Thu gọn danh sách"
            aria-label="Thu gọn danh sách"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        <div className="patient-sidebar-actions">
          <button
            className="btn-new-convo-sanctuary"
            disabled={busy}
            onClick={() => void createConversation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tạo hội thoại mới
          </button>
        </div>

        <div className="conversation-scroll-sanctuary">
          {conversations.loading && (
            <p style={{ padding: '16px', color: 'var(--sh-text-muted)', fontSize: '13px' }}>
              Đang tải lịch sử…
            </p>
          )}
          {conversations.error && (
            <div style={{ padding: '16px' }} role="alert">
              <p style={{ color: 'var(--sh-danger)', fontSize: '13px', margin: '0 0 8px' }}>
                {conversations.error.message}
              </p>
              <button
                onClick={conversations.reload}
                style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--sh-sage-border)', background: '#fff', cursor: 'pointer' }}
              >
                Thử lại
              </button>
            </div>
          )}
          {!conversations.loading && !conversations.error && !conversations.data?.length && (
            <p style={{ padding: '24px 14px', color: 'var(--sh-text-subtle)', fontSize: '13px', lineHeight: 1.5, textAlign: 'center' }}>
              Chưa có hội thoại nào. Nhấn "Tạo hội thoại mới" để bắt đầu cùng Serene AI.
            </p>
          )}
          {conversations.data?.map((c) => (
            <button
              key={c.id}
              className={`convo-item-pill ${conversationId === c.id && tab === 'chat' ? 'is-active' : ''}`}
              onClick={() => {
                setConversationId(c.id)
                setTab('chat')
                if (mobile) setSidebarOpen(false)
              }}
            >
              <span className="convo-item-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="convo-item-title">{c.title}</span>
            </button>
          ))}
        </div>

        <div className="patient-sidebar-user-container" ref={profileRef}>
          {profileOpen && (
            <div className="patient-sidebar-dropdown" role="menu" aria-label="Menu tài khoản bệnh nhân">
              <div className="dropdown-user-header">
                <div className="dropdown-user-avatar">{userInitial}</div>
                <div className="dropdown-user-details">
                  <strong className="dropdown-user-name">{user?.fullName || 'Bệnh nhân'}</strong>
                  <span className="dropdown-user-email">{user?.email || 'Tài khoản Serene'}</span>
                  <span className="dropdown-user-role-badge">Bệnh nhân</span>
                </div>
              </div>

              <div className="dropdown-menu-list">
                <button
                  type="button"
                  role="menuitem"
                  className={`dropdown-menu-item ${tab === 'chat' ? 'is-current' : ''}`}
                  onClick={() => {
                    setTab('chat')
                    setProfileOpen(false)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Tư vấn Serene AI</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`dropdown-menu-item ${tab === 'booking' ? 'is-current' : ''}`}
                  onClick={() => {
                    setTab('booking')
                    setProfileOpen(false)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Đăng ký lịch khám</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`dropdown-menu-item ${tab === 'appointments' ? 'is-current' : ''}`}
                  onClick={() => {
                    setTab('appointments')
                    setProfileOpen(false)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="dropdown-item-text">Lịch hẹn của tôi</span>
                  {(appointments.data?.length ?? 0) > 0 && (
                    <span className="dropdown-item-badge">{appointments.data?.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`dropdown-menu-item ${tab === 'profile' ? 'is-current' : ''}`}
                  onClick={() => {
                    setTab('profile')
                    setProfileOpen(false)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  <span>Hồ sơ sức khỏe cá nhân</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  role="menuitem"
                  className="dropdown-menu-item dropdown-logout-btn"
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            className={`patient-sidebar-user ${profileOpen ? 'is-active' : ''}`}
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            title="Tùy chọn tài khoản bệnh nhân"
          >
            <div className="user-avatar-small">{userInitial}</div>
            <div className="user-info-text">
              <div className="user-info-name">{user?.fullName || 'Bệnh nhân'}</div>
              <div className="user-info-sub">Tùy chọn tài khoản</div>
            </div>
            <svg
              className={`sidebar-user-chevron ${profileOpen ? 'is-rotated' : ''}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        </div>
      </aside>

      {/* 2. Main Stage (100% Chat Focus + Overlay Views) */}
      <section className="patient-stage" inert={mobile && sidebarOpen}>
        {/* Subtle Top Strip (Emergency badge + Sidebar toggle) */}
        <div className="patient-top-strip">
          <div className="top-strip-left">
            {!sidebarOpen && (
              <button
                ref={sidebarToggleRef}
                className="btn-expand-sidebar"
                aria-label="Mở danh sách hội thoại"
                aria-controls="patient-conversations"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                title="Mở danh sách hội thoại"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span>Hội thoại ({conversations.data?.length ?? 0})</span>
              </button>
            )}
            <div className="medical-safety-chip" title="Lưu ý an toàn y tế">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Serene AI hỗ trợ sàng lọc sơ bộ, không thay thế chẩn đoán bác sĩ.</span>
            </div>
          </div>

          <div className="top-strip-right">
            <a className="btn-emergency-pill" href="tel:115" title="Gọi cấp cứu 115 ngay">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Cấp cứu 115
            </a>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ margin: '0 24px 12px', padding: '10px 16px', background: 'var(--sh-danger-bg)', border: '1px solid rgba(186, 60, 60, 0.2)', borderRadius: '10px', color: 'var(--sh-danger)', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* 3. Primary Center Canvas: Chatbot */}
        <div className="patient-chat-canvas">
          {conversationId ? (
            <PatientChat
              key={conversationId}
              conversationId={conversationId}
              onBook={() => setTab('booking')}
            />
          ) : (
            <div className="chat-welcome-sanctuary">
              <div className="welcome-bot-badge">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
              </div>
              <h2>Bạn đang cảm thấy thế nào hôm nay?</h2>
              <p>
                Trợ lý sức khỏe Serene AI luôn sẵn sàng lắng nghe các triệu chứng và hỗ trợ định hướng chăm sóc sức khỏe an toàn.
              </p>
              <button
                className="btn-primary-action"
                style={{ maxWidth: '280px', margin: '0 auto' }}
                disabled={busy}
                onClick={() => void createConversation()}
              >
                Bắt đầu hội thoại ngay
              </button>
            </div>
          )}
        </div>

        {/* 4. Overlay: Booking Form View */}
        {tab === 'booking' && (
          <div className="patient-overlay-view" role="dialog" aria-modal="true" aria-label="Đặt lịch khám">
            <div className="overlay-container">
              <div className="overlay-header">
                <div className="overlay-header-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sh-forest-deep)" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h2>Đăng ký lịch khám</h2>
                </div>
                <button className="btn-close-overlay" onClick={() => setTab('chat')}>
                  ✕ Đóng lại
                </button>
              </div>
              <BookingForm
                onBooked={() => {
                  appointments.reload()
                  setTab('appointments')
                }}
              />
            </div>
          </div>
        )}

        {/* 5. Overlay: Appointments List View */}
        {tab === 'appointments' && (
          <div className="patient-overlay-view" role="dialog" aria-modal="true" aria-label="Lịch hẹn khám">
            <div className="overlay-container">
              <div className="overlay-header">
                <div className="overlay-header-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sh-forest-deep)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <h2>Lịch hẹn của bạn</h2>
                </div>
                <button className="btn-close-overlay" onClick={() => setTab('chat')}>
                  ✕ Đóng lại
                </button>
              </div>

              {appointments.loading && <p style={{ color: 'var(--sh-text-muted)', padding: '24px 0' }}>Đang tải lịch hẹn…</p>}
              {appointments.error && <p role="alert" style={{ color: 'var(--sh-danger)', padding: '12px 0' }}>{appointments.error.message}</p>}

              {!appointments.loading && !appointments.data?.length && (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sh-forest-deep)', margin: '0 0 8px' }}>Chưa có lịch hẹn nào</h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--sh-text-muted)', marginBottom: '20px' }}>Đặt lịch ngay để được bác sĩ chuyên khoa tư vấn trực tiếp.</p>
                  <button className="btn-primary-action" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={() => setTab('booking')}>
                    Đặt lịch khám ngay
                  </button>
                </div>
              )}

              <div className="appointments-grid">
                {appointments.data?.map((appointment) => {
                  const statusCfg = statusMap[appointment.status] || { label: appointment.status, className: 'status-cancelled' }
                  const docInitial = (appointment.doctor?.user?.fullName || 'BS').charAt(0).toUpperCase()
                  return (
                    <article className="appointment-card" key={appointment.id}>
                      <div className="appointment-card-top">
                        <div className="appointment-doctor-info">
                          <div className="appointment-doctor-avatar">{docInitial}</div>
                          <div>
                            <h3 className="appointment-doctor-name">{appointment.doctor?.user?.fullName ?? 'Bác sĩ chuyên khoa'}</h3>
                            <p className="appointment-service-tag">{appointment.service?.name ?? 'Tư vấn sức khỏe'}</p>
                          </div>
                        </div>
                        <span className={`appointment-status-pill ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="appointment-card-time">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>
                          {new Date(appointment.startAt).toLocaleString('vi-VN', {
                            timeZone: 'Asia/Ho_Chi_Minh',
                            dateStyle: 'full',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      {['PENDING', 'CONFIRMED'].includes(appointment.status) && (
                        <button
                          className="btn-cancel-appt"
                          disabled={busy}
                          onClick={async () => {
                            if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn khám này không?')) return
                            setBusy(true)
                            setError('')
                            try {
                              await api(`/appointments/${appointment.id}/cancel`, { method: 'PATCH' })
                              appointments.reload()
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Không thể hủy lịch')
                            } finally {
                              setBusy(false)
                            }
                          }}
                        >
                          Hủy lịch hẹn
                        </button>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. Overlay: Profile Health Record View */}
        {tab === 'profile' && (
          <div className="patient-overlay-view" role="dialog" aria-modal="true" aria-label="Hồ sơ sức khỏe">
            <div className="overlay-container">
              <div className="overlay-header">
                <div className="overlay-header-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--sh-forest-deep)" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  <h2>Hồ sơ sức khỏe tự khai</h2>
                </div>
                <button className="btn-close-overlay" onClick={() => setTab('chat')}>
                  ✕ Đóng lại
                </button>
              </div>

              {profile.loading ? (
                <p style={{ color: 'var(--sh-text-muted)', padding: '24px 0' }}>Đang tải hồ sơ…</p>
              ) : profile.error ? (
                <p role="alert" style={{ color: 'var(--sh-danger)', padding: '12px 0' }}>{profile.error.message}</p>
              ) : (
                <form
                  key={JSON.stringify(profile.data)}
                  onSubmit={async (event) => {
                    event.preventDefault()
                    setBusy(true)
                    setError('')
                    setSaveSuccess(false)
                    const form = new FormData(event.currentTarget)
                    const lines = (name: string) =>
                      String(form.get(name) ?? '')
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                    try {
                      await api('/profile', {
                        method: 'PATCH',
                        body: JSON.stringify({
                          bloodType: form.get('bloodType') || undefined,
                          allergies: lines('allergies'),
                          medicalHistory: lines('medicalHistory'),
                        }),
                      })
                      profile.reload()
                      setSaveSuccess(true)
                      setTimeout(() => setSaveSuccess(false), 4000)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Không thể lưu hồ sơ')
                    } finally {
                      setBusy(false)
                    }
                  }}
                >
                  {saveSuccess && (
                    <div style={{ padding: '12px 16px', background: 'var(--sh-success-bg)', border: '1px solid var(--sh-success-border)', borderRadius: '8px', color: 'var(--sh-success-text)', fontSize: '13.5px', fontWeight: 600, marginBottom: '16px' }}>
                      ✓ Đã lưu thành công hồ sơ sức khỏe cá nhân.
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="field-bloodType">Nhóm máu</label>
                    <input
                      id="field-bloodType"
                      className="form-input"
                      name="bloodType"
                      placeholder="Ví dụ: O+, A+, B+, AB-..."
                      maxLength={5}
                      defaultValue={profile.data?.bloodType ?? ''}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="field-allergies">Tiền sử dị ứng thuốc & thực phẩm</label>
                    <textarea
                      id="field-allergies"
                      className="form-textarea"
                      name="allergies"
                      rows={3}
                      placeholder="Mỗi dòng một loại dị ứng (ví dụ: Penicillin, Tôm cua...)"
                      maxLength={2000}
                      defaultValue={profile.data?.allergies?.join('\n') ?? ''}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="field-history">Tiền sử bệnh lý & Phẫu thuật</label>
                    <textarea
                      id="field-history"
                      className="form-textarea"
                      name="medicalHistory"
                      rows={4}
                      placeholder="Mỗi dòng một bệnh lý hoặc phẫu thuật trong quá khứ..."
                      maxLength={4000}
                      defaultValue={profile.data?.medicalHistory?.join('\n') ?? ''}
                    />
                  </div>

                  <button className="btn-primary-action" disabled={busy}>
                    {busy ? 'Đang lưu hồ sơ…' : 'Lưu hồ sơ sức khỏe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
