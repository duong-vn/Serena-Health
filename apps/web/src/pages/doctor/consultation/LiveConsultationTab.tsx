import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './LiveConsultationTab.css'

type ChatMessage = {
  id: string
  sender: 'patient' | 'doctor'
  text: string
}

type ChatItem = {
  id: string
  name: string
  age: number
  time: string
  message: string
  isNew?: boolean
  status: 'new' | 'active' | 'ended'
  messages: ChatMessage[]
}

const initialChats: ChatItem[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    age: 45,
    time: '10:30',
    message: 'Bác sĩ ơi, dạo này tôi hay thấy chóng...',
    isNew: true,
    status: 'new',
    messages: [
      { 
        id: 'm1', 
        sender: 'patient', 
        text: 'Bác sĩ ơi, dạo này tôi hay thấy chóng mặt và đau đầu. Không biết đây là triệu chứng của bệnh gì vậy ạ?' 
      },
    ]
  },
  {
    id: '4',
    name: 'Nguyễn Thị N',
    age: 29,
    time: '09:36',
    message: 'Xin chào bác sĩ, tôi đang gặp tình trạng đau...',
    isNew: true,
    status: 'new',
    messages: [
      { 
        id: 'm1', 
        sender: 'patient', 
        text: 'Xin chào bác sĩ, tôi đang gặp tình trạng đau đầu nhiều ngày qua.' 
      },
    ]
  },
  {
    id: '2',
    name: 'Trần Thị B',
    age: 32,
    time: '09:15',
    message: 'Cảm ơn bác sĩ',
    status: 'ended',
    messages: [
      { id: 'm1', sender: 'patient', text: 'Xin chào bác sĩ.' },
      { id: 'm2', sender: 'doctor', text: 'Chào bạn, tôi có thể giúp gì cho bạn?' },
      { id: 'm3', sender: 'patient', text: 'Tôi đã uống thuốc theo đơn và thấy đỡ nhiều rồi.' },
      { id: 'm4', sender: 'doctor', text: 'Rất tốt, hãy tiếp tục theo dõi nhé.' },
      { id: 'm5', sender: 'patient', text: 'Cảm ơn bác sĩ' },
    ]
  },
  {
    id: '3',
    name: 'Lê Văn C',
    age: 50,
    time: 'Hôm qua',
    message: 'Triệu chứng đã giảm',
    status: 'ended',
    messages: [
      { id: 'm1', sender: 'patient', text: 'Triệu chứng đã giảm' },
    ]
  },
]

export function LiveConsultationTab({ 
  onBackToDashboard,
  onViewPatientProfile,
  initialActiveChatId,
  onClearActiveChat
}: { 
  onBackToDashboard?: () => void;
  onViewPatientProfile?: (patientId: string) => void;
  initialActiveChatId?: string | null;
  onClearActiveChat?: () => void;
}) {
  const [chats, setChats] = useState<ChatItem[]>(initialChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(initialActiveChatId || null)

  useEffect(() => {
    if (initialActiveChatId) {
      setActiveChatId(initialActiveChatId)
    }
  }, [initialActiveChatId])
  const [inputMessage, setInputMessage] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastInfo, setToastInfo] = useState<{ day: number; time: string } | null>(null)

  const activeChat = chats.find(c => c.id === activeChatId)
  const isChatActiveMode = activeChat && activeChat.status === 'active'

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  const startConsultation = (chatId: string) => {
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { 
          ...c, 
          status: 'active', 
          isNew: false,
          messages: [
            ...c.messages,
            { id: 'm2', sender: 'doctor', text: 'Chào bác, bác có thể mô tả rõ hơn về cơn đau đầu được không?' }
          ]
        }
      }
      return c
    }))
  }

  const endConsultation = (chatId: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, status: 'ended' } : c))
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !activeChatId) return

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const newMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          sender: 'doctor',
          text: inputMessage.trim()
        }
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          message: inputMessage.trim()
        }
      }
      return chat
    }))
    setInputMessage('')
  }

  return (
    <div className={`consultation-tab-outer ${isChatActiveMode ? 'active-chat-mode' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: '0' }}>
      {!isChatActiveMode && (
        <header className="patient-tab-header" style={{ padding: '0 24px 0 24px', flexShrink: 0 }}>
          <div className="tab-titles">
            <h1>Danh sách tư vấn</h1>
            <p>Trang theo dõi và tư vấn sức khỏe trực tuyến cho bệnh nhân.</p>
          </div>
        </header>
      )}
      <div className={`consultation-tab-container ${isChatActiveMode ? 'active-chat-mode' : ''}`} style={{ flex: 1, minHeight: 0, marginTop: !isChatActiveMode ? '16px' : 0 }}>
        {/* Left Pane: Chat List (Hidden in active chat mode) */}
        {!isChatActiveMode && (
          <div className="consultation-sidebar-pane">
            <h2 className="consultation-title" style={{ display: 'none' }}>Danh sách tư vấn</h2>
            <div className="consultation-list">
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId
              return (
                <div 
                  key={chat.id} 
                  className={`consultation-card ${isActive ? 'active' : ''}`}
                  onClick={() => { setActiveChatId(chat.id); onClearActiveChat?.(); }}
                >
                  <div className="consultation-card-avatar" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                    </svg>
                  </div>
                  <div className="consultation-card-content">
                    <div className="consultation-card-header">
                      <span className="consultation-card-name">{chat.name}</span>
                      <span className="consultation-card-time">{chat.time}</span>
                    </div>
                    <div className="consultation-card-message">
                      {chat.message}
                    </div>
                    {chat.isNew && (
                      <div className="consultation-card-badge">Mới</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Right Pane: Chat Area or Empty State */}
      <div className="consultation-main-pane">
        {activeChat ? (
          <div className="active-chat-state" style={{ position: 'relative' }}>
            {/* Success Toast Notification */}
            {showToast && toastInfo && (
              <div className="booking-toast-notification">
                <div className="toast-left-content">
                  <div className="toast-check-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="toast-text-group">
                    <span className="toast-main-msg">Đặt lịch thành công!</span>
                    <span className="toast-sub-msg">Lịch khám: {toastInfo.day < 10 ? `0${toastInfo.day}` : toastInfo.day}/05/2026 lúc {toastInfo.time}</span>
                  </div>
                </div>
                <button className="toast-dismiss-btn" onClick={() => setShowToast(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Chat Header Card */}
            <div className="chat-header-card">
              <div className="chat-header-info">
                {activeChat.status === 'active' && (
                  <button className="back-to-list-btn" onClick={() => { setActiveChatId(null); onClearActiveChat?.(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                )}
                <div className="chat-header-avatar" style={{ display: 'grid', placeItems: 'center', backgroundColor: '#E6EFFE', color: '#244a6b', border: '1px solid rgba(36, 74, 107, 0.12)' }}>
                  <svg viewBox="0 0 24 24" style={{ width: '58%', height: '58%', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8' }}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                  </svg>
                </div>
                <div className="chat-header-details">
                  <h3>{activeChat.name}</h3>
                  <p>{activeChat.age} tuổi</p>
                </div>
              </div>
              {activeChat.status === 'active' ? (
                <button className="end-consultation-btn" onClick={() => endConsultation(activeChat.id)}>
                  Kết thúc tư vấn
                </button>
              ) : activeChat.status !== 'new' ? (
                <button 
                  className="view-record-btn"
                  onClick={() => onViewPatientProfile?.(activeChat.id)}
                >
                  Xem hồ sơ bệnh án
                </button>
              ) : null}
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-area">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
                  <div className="chat-message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions tag above input (Only when active) */}
            {activeChat.status === 'active' && (
              <div className="chat-action-tags">
                <button className="action-tag-btn">Hẹn khám lại</button>
                <button className="action-tag-btn">Yêu cầu xét nghiệm</button>
                <button className="action-tag-btn">Kê toa thuốc</button>
              </div>
            )}

            {/* Chat Footer */}
            {activeChat.status === 'new' && (
              <div className="chat-footer-new">
                <button 
                  className="start-consultation-btn"
                  onClick={() => startConsultation(activeChat.id)}
                >
                  Bắt đầu tư vấn
                </button>
              </div>
            )}

            {activeChat.status === 'active' && (
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <div className="chat-input-pill-wrapper">
                  <button type="button" className="input-icon-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                  </button>
                  <button type="button" className="input-icon-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                  </button>
                  <button type="button" className="input-icon-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
                  </button>
                  <input 
                    type="text" 
                    placeholder="Nhập tin nhắn..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  <button type="submit" className="send-msg-button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            )}

            {activeChat.status === 'ended' && (
              <div className="chat-footer-ended">
                <div className="ended-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã kết thúc tư vấn
                </div>
                <p>Cuộc tư vấn này đã kết thúc. Bạn chỉ có thể xem lại nội dung tư vấn.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-chat-state">
            <div className="empty-avatar-circle"></div>
            <p>Chọn cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Left Pane / Clinical Workspace Sidebar (Only shown in active chat mode) */}
      {isChatActiveMode && (
        <div className="clinical-workspace-sidebar">
          {/* Thông tin y tế */}
          <div className={`workspace-accordion-section ${expandedSection === 'medical-info' ? 'expanded' : ''}`}>
            <div className="workspace-accordion-header" onClick={() => toggleSection('medical-info')}>
              <span className="section-title-wrapper medical-info-theme">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Thông tin y tế
              </span>
              <svg className={`chevron-icon ${expandedSection === 'medical-info' ? 'rotate-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSection === 'medical-info' && (
              <div className="workspace-accordion-content">
                <div className="info-item-card">
                  <span className="info-item-label">Nhóm máu</span>
                  <span className="info-item-value">O+</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-label">Dị ứng</span>
                  <span className="info-item-value">Penicillin</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-label">Thuốc đang dùng</span>
                  <span className="info-item-value">Không</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tiền sử bệnh */}
          <div className={`workspace-accordion-section ${expandedSection === 'medical-history' ? 'expanded' : ''}`}>
            <div className="workspace-accordion-header" onClick={() => toggleSection('medical-history')}>
              <span className="section-title-wrapper history-theme">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Tiền sử bệnh
              </span>
              <svg className={`chevron-icon ${expandedSection === 'medical-history' ? 'rotate-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSection === 'medical-history' && (
              <div className="workspace-accordion-content scrollable-content">
                <div className="info-item-card">
                  <span className="info-item-value">Cao huyết áp</span>
                  <span className="info-item-label">Từ năm 2020</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-value">Tiểu đường type 2</span>
                  <span className="info-item-label">Từ năm 2018</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-value">Tiểu đường type 2</span>
                  <span className="info-item-label">Từ năm 2018</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Lịch sử khám bệnh */}
          <div className={`workspace-accordion-section ${expandedSection === 'visit-history' ? 'expanded' : ''}`}>
            <div className="workspace-accordion-header" onClick={() => toggleSection('visit-history')}>
              <span className="section-title-wrapper exam-theme">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Lịch sử khám bệnh
              </span>
              <svg className={`chevron-icon ${expandedSection === 'visit-history' ? 'rotate-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSection === 'visit-history' && (
              <div className="workspace-accordion-content scrollable-content">
                <div className="info-item-card">
                  <span className="info-item-value">05/05/2026</span>
                  <span className="info-item-label">Khám tổng quát</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-value">20/04/2026</span>
                  <span className="info-item-label">Tái khám tim mạch</span>
                </div>
                <div className="info-item-card">
                  <span className="info-item-value">20/01/2026</span>
                  <span className="info-item-label">Tái khám tim mạch</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Lịch sử tư vấn */}
          <div className={`workspace-accordion-section ${expandedSection === 'consultation-history' ? 'expanded' : ''}`}>
            <div className="workspace-accordion-header" onClick={() => toggleSection('consultation-history')}>
              <span className="section-title-wrapper consult-theme">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Lịch sử tư vấn
              </span>
              <svg className={`chevron-icon ${expandedSection === 'consultation-history' ? 'rotate-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSection === 'consultation-history' && (
              <div className="workspace-accordion-content scrollable-content">
                <div className="info-item-card">
                  <span className="info-item-value">01/05/2026</span>
                  <span className="info-item-label">Tư vấn về triệu chứng đau ngực</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Ghi chú */}
          <div className={`workspace-accordion-section notes-section ${expandedSection === 'notes' ? 'expanded' : ''}`}>
            <div className="workspace-accordion-header" onClick={() => toggleSection('notes')}>
              <span className="section-title-wrapper notes-theme">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Ghi chú
              </span>
              <svg className={`chevron-icon ${expandedSection === 'notes' ? 'rotate-up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expandedSection === 'notes' && (
              <div className="workspace-accordion-content notes-content-wrapper">
                <div className="note-input-group">
                  <label className="note-input-label">Triệu chứng</label>
                  <textarea className="note-textarea" placeholder="Nhập triệu chứng..." rows={3} />
                </div>
                <div className="note-input-group">
                  <label className="note-input-label">Chẩn đoán sơ bộ</label>
                  <textarea className="note-textarea" placeholder="Nhập chẩn đoán..." rows={3} />
                </div>
                <div className="note-input-group">
                  <label className="note-input-label">Đơn thuốc</label>
                  <textarea className="note-textarea" placeholder="Nhập đơn thuốc..." rows={3} />
                </div>
              </div>
            )}
          </div>
          
          <button className="book-appointment-btn" onClick={() => setIsModalOpen(true)}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Đặt lịch khám trực tiếp
          </button>
        </div>
      )}

      {/* Select Schedule Appointment Modal Popup */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="appointment-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chọn lịch khám</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="modal-body">
              <h3 className="month-indicator">Tháng 5, 2026</h3>
              
              {/* Calendar Grid */}
              <div className="modal-calendar-grid">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                  <div key={d} className="modal-calendar-day-header">{d}</div>
                ))}
                {/* Pad empty days for May 2026 (Starts on Friday, which is index 5) */}
                {Array(5).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="modal-calendar-day empty"></div>
                ))}
                {/* Days 1 to 30 */}
                {Array(30).fill(null).map((_, i) => {
                  const day = i + 1
                  const availableDays = [15, 16, 19, 20, 22, 23]
                  const isAvailable = availableDays.includes(day)
                  const isSelected = selectedDay === day
                  
                  return (
                    <button 
                      key={`day-${day}`}
                      className={`modal-calendar-day ${isAvailable ? 'available' : 'disabled'} ${isSelected ? 'selected' : ''}`}
                      disabled={!isAvailable}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
              
              {/* Available hours section */}
              <div className="time-slots-section">
                <h4>Khung giờ khả dụng</h4>
                <div className="time-slots-grid">
                  {['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'].map(time => {
                    const isSelected = selectedTime === time
                    return (
                      <button
                        key={time}
                        className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Confirm Booking Action Button */}
              <button 
                className={`confirm-booking-btn ${selectedDay && selectedTime ? 'ready' : ''}`}
                disabled={!selectedDay || !selectedTime}
                onClick={() => {
                  setIsModalOpen(false)
                  // End consultation
                  setChats(prev => prev.map(c => c.id === activeChatId ? { 
                    ...c, 
                    status: 'ended',
                    time: '09:15',
                    message: 'Xin chào bạn, bạn cần tư vấn về điều gì?'
                  } : c))
                  // Trigger toast notification
                  setToastInfo({ day: selectedDay || 20, time: selectedTime || '09:30' })
                  setShowToast(true)
                  // Reset select state
                  setSelectedDay(null)
                  setSelectedTime(null)
                }}
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  )
}
