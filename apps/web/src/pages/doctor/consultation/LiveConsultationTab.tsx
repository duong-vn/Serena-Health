import { useState, useEffect } from 'react'

import { api } from '../../../api/client'
import { useApi } from '../../../api/useApi'
import { useChatSocket } from '../../../api/useChatSocket'
import './LiveConsultationTab.css'

interface ApiConsultation {
  id: string
  status: 'OPEN' | 'CLAIMED' | 'COMPLETED'
  summary: string | null
  reason: string | null
  notes: string | null
  createdAt: string
  patient: { id: string; fullName: string; phone?: string }
}

interface ConsultationList { items: ApiConsultation[] }

export function LiveConsultationTab({
  onBackToDashboard,
  onViewPatientProfile,
  initialActiveChatId,
  onClearActiveChat,
}: {
  onBackToDashboard?: () => void
  onViewPatientProfile?: (patientId: string) => void
  initialActiveChatId?: string | null
  onClearActiveChat?: () => void
}) {
  const { data, loading, reload } = useApi<ConsultationList>('/doctor/consultations')
  const consultations = data?.items || []
  const [activeChatId, setActiveChatId] = useState<string | null>(initialActiveChatId || null)
  const [inputMessage, setInputMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const activeConsultation = consultations.find((c) => c.id === activeChatId)

  const { messages: socketMessages, sendMessage, status: socketStatus } = useChatSocket({
    consultationId: activeChatId,
  })

  useEffect(() => {
    if (initialActiveChatId) setActiveChatId(initialActiveChatId)
  }, [initialActiveChatId])

  useEffect(() => {
    if (activeConsultation?.notes) setNotes(activeConsultation.notes)
    else setNotes('')
  }, [activeConsultation])

  const handleClaim = async () => {
    if (!activeChatId) return
    setIsClaiming(true)
    try {
      await api(`/consultations/${activeChatId}/claim`, { method: 'PATCH' })
      reload()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Không thể tiếp nhận tư vấn.')
    } finally {
      setIsClaiming(false)
    }
  }

  const handleComplete = async () => {
    if (!activeChatId) return
    setIsCompleting(true)
    try {
      await api(`/consultations/${activeChatId}/complete`, {
        body: JSON.stringify({ notes }),
        method: 'PATCH',
      })
      reload()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Không thể kết thúc tư vấn.')
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage(inputMessage.trim())
    setInputMessage('')
  }

  const isClaimedByMe = activeConsultation?.status === 'CLAIMED'

  return (
    <div className="consultation-tab-outer" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: '0' }}>
      <header className="patient-tab-header" style={{ padding: '0 24px', flexShrink: 0 }}>
        <div className="tab-titles">
          <h1>Tư vấn trực tuyến</h1>
          <p>Tiếp nhận và giải đáp trực tiếp với bệnh nhân qua phòng chat bảo mật.</p>
        </div>
      </header>

      <div className="consultation-tab-container" style={{ flex: 1, minHeight: 0, marginTop: '16px' }}>
        <div className="consultation-sidebar-pane">
          <div className="consultation-list">
            {loading ? <p className="doctor-data-state" role="status">Đang tải ca tư vấn...</p> : null}
            {!loading && consultations.length === 0 ? <p className="doctor-data-state">Không có ca tư vấn nào.</p> : null}
            {consultations.map((c) => {
              const isActive = c.id === activeChatId
              return (
                <div key={c.id} className={`consultation-card ${isActive ? 'active' : ''}`} onClick={() => { setActiveChatId(c.id); onClearActiveChat?.(); }}>
                  <div className="consultation-card-avatar" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                  </div>
                  <div className="consultation-card-content">
                    <div className="consultation-card-header">
                      <span className="consultation-card-name">{c.patient.fullName}</span>
                      <span className="consultation-card-time">{new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="consultation-card-message">{c.reason || 'Yêu cầu hỗ trợ'}</div>
                    <div className="consultation-card-badge" style={{ backgroundColor: c.status === 'OPEN' ? '#3b82f6' : c.status === 'CLAIMED' ? '#10b981' : '#6b7280' }}>
                      {c.status === 'OPEN' ? 'Chờ nhận' : c.status === 'CLAIMED' ? 'Đang trao đổi' : 'Đã xong'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="consultation-main-pane">
          {activeConsultation ? (
            <div className="active-chat-state" style={{ position: 'relative' }}>
              <div className="chat-header-card">
                <div className="chat-header-info">
                  <div className="chat-header-avatar" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>
                  </div>
                  <div className="chat-header-details">
                    <h3>{activeConsultation.patient.fullName}</h3>
                    <p>Trạng thái: {activeConsultation.status} (Socket: {socketStatus})</p>
                  </div>
                </div>
                {activeConsultation.status === 'OPEN' ? (
                  <button className="start-consultation-btn" disabled={isClaiming} onClick={handleClaim}>
                    {isClaiming ? 'Đang tiếp nhận...' : 'Tiếp nhận ca'}
                  </button>
                ) : null}
                {isClaimedByMe ? (
                  <button className="end-consultation-btn" disabled={isCompleting} onClick={handleComplete}>
                    {isCompleting ? 'Đang hoàn tất...' : 'Kết thúc tư vấn'}
                  </button>
                ) : null}
              </div>

              <div className="chat-messages-area">
                {activeConsultation.summary ? (
                  <div className="chat-message-row" style={{ justifySelf: 'center', width: '90%' }}>
                    <div className="chat-message-bubble" style={{ background: '#fef3c7', color: '#92400e', fontSize: '13px' }}>
                      <strong>Tóm tắt sơ bộ từ AI Bot:</strong><br />{activeConsultation.summary}
                    </div>
                  </div>
                ) : null}
                {socketMessages.map((m) => (
                  <div key={m.id} className={`chat-message-row ${m.role === 'ASSISTANT' || m.role === 'USER' ? 'patient' : 'doctor'}`}>
                    <div className="chat-message-bubble">{m.content}</div>
                  </div>
                ))}
              </div>

              {isClaimedByMe ? (
                <form className="chat-input-form" onSubmit={handleSend}>
                  <div className="chat-input-pill-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn tư vấn..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button type="submit" className="send-msg-button">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                  </div>
                </form>
              ) : null}

              {activeConsultation.status === 'COMPLETED' ? (
                <div className="chat-footer-ended">
                  <div className="ended-badge">Đã hoàn thành tư vấn</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="empty-chat-state"><p>Chọn một ca tư vấn để bắt đầu</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
