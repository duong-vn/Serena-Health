import { useEffect, useMemo, useState } from 'react'
import { Header } from '../../../components/layout/header/Header'
import { Sidebar } from '../../../components/layout/sidebar/Sidebar'
import '../../../components/layout/DesktopShell.css'
import { ChatWindow } from '../../../components/chat/ChatWindow'
import { ConversationCard } from '../../../components/chat/ConversationCard'
import { DetailModal } from '../../../components/ui/DetailModal'
import { FilterSelect } from '../../../components/ui/FilterSelect'
import { Pagination } from '../../../components/ui/Pagination'
import { managerSidebarConfig } from '../managerSidebarConfig'
import { chatbotMonitorConversations } from './chatbotMonitorMockData'
import './ChatbotMonitorPage.css'

type QuickTab = 'all' | 'urgent' | 'low-rating'
type HandlerFilter = 'all' | 'bot' | 'doctor'

const CONVERSATIONS_PER_PAGE = 4

const quickTabs: Array<{ value: QuickTab; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'urgent', label: 'Nguy hiểm' },
  { value: 'low-rating', label: 'Đánh giá thấp' },
]

const handlerOptions = [
  { value: 'all', label: 'Tất cả người xử lý' },
  { value: 'bot', label: 'Chỉ Chatbot' },
  { value: 'doctor', label: 'Có Bác sĩ' },
]

function uniqueOptions(values: string[], allLabel: string) {
  return [
    { value: 'all', label: allLabel },
    ...Array.from(new Set(values)).map((value) => ({ value, label: value })),
  ]
}

function getFeedbackText(rating?: number, feedback?: string) {
  if (feedback) {
    return feedback
  }

  if (!rating) {
    return 'Phiên tư vấn này chưa có phản hồi từ bệnh nhân.'
  }

  if (rating <= 2) {
    return 'Bệnh nhân chưa hài lòng với câu trả lời và mong muốn được hỗ trợ bởi nhân sự y tế.'
  }

  return 'Bệnh nhân đánh giá phiên tư vấn rõ ràng, dễ hiểu và phù hợp với nhu cầu hỗ trợ.'
}

export function ChatbotMonitorPage() {
  const [activeTab, setActiveTab] = useState<QuickTab>('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [handlerFilter, setHandlerFilter] = useState<HandlerFilter>('all')
  const [activeConversationId, setActiveConversationId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

  const branchOptions = useMemo(
    () => uniqueOptions(chatbotMonitorConversations.map((conversation) => conversation.branch), 'Tất cả chi nhánh'),
    [],
  )
  const specialtyOptions = useMemo(
    () => uniqueOptions(chatbotMonitorConversations.map((conversation) => conversation.specialty), 'Tất cả chuyên khoa'),
    [],
  )

  const filteredConversations = useMemo(() => {
    return chatbotMonitorConversations.filter((conversation) => {
      const matchesQuickTab =
        activeTab === 'all'
        || (activeTab === 'urgent' && conversation.riskLevel === 'urgent')
        || (activeTab === 'low-rating' && typeof conversation.rating === 'number' && conversation.rating <= 2)
      const matchesBranch = branchFilter === 'all' || conversation.branch === branchFilter
      const matchesSpecialty = specialtyFilter === 'all' || conversation.specialty === specialtyFilter
      const matchesHandler = handlerFilter === 'all' || conversation.handlerType === handlerFilter

      return matchesQuickTab && matchesBranch && matchesSpecialty && matchesHandler
    })
  }, [activeTab, branchFilter, handlerFilter, specialtyFilter])

  const totalPages = Math.max(1, Math.ceil(filteredConversations.length / CONVERSATIONS_PER_PAGE))
  const paginatedConversations = useMemo(() => {
    const startIndex = (currentPage - 1) * CONVERSATIONS_PER_PAGE
    return filteredConversations.slice(startIndex, startIndex + CONVERSATIONS_PER_PAGE)
  }, [currentPage, filteredConversations])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, branchFilter, handlerFilter, specialtyFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const activeConversation = filteredConversations.find((conversation) => conversation.id === activeConversationId)
  const ratingLabel = activeConversation?.rating ? `${activeConversation.rating}/5` : 'Chưa đánh giá'

  return (
    <div className="desktop-shell-page chatbot-monitor-page">
      <Sidebar config={managerSidebarConfig} />
      <Header profileRole={managerSidebarConfig.profileRole} />
      <main className="desktop-shell-main chatbot-monitor-main" aria-label="Giám sát Chatbot">
        <section className="chatbot-monitor-content">
          <div className="chatbot-monitor-heading">
            <div>
              <h1>Giám sát Chatbot</h1>
              <p>Theo dõi lịch sử tư vấn, nhận diện ca nguy hiểm và cuộc hội thoại có đánh giá thấp.</p>
            </div>
          </div>

          <div className="chatbot-control-row">
            <div className="chatbot-filter-row">
              <FilterSelect
                options={branchOptions}
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              />
              <FilterSelect
                options={specialtyOptions}
                value={specialtyFilter}
                onChange={(event) => setSpecialtyFilter(event.target.value)}
              />
              <FilterSelect
                options={handlerOptions}
                value={handlerFilter}
                onChange={(event) => setHandlerFilter(event.target.value as HandlerFilter)}
              />
            </div>
            <div className="chatbot-monitor-count">
              <strong>{filteredConversations.length}</strong>
              <span>phiên phù hợp</span>
            </div>
          </div>

          <div className="chatbot-monitor-layout">
            <aside className="chatbot-conversation-panel" aria-label="Danh sách cuộc hội thoại">
              <div className="chatbot-quick-tabs" role="tablist" aria-label="Lọc nhanh hội thoại">
                {quickTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    className={activeTab === tab.value ? 'is-active' : ''}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="chatbot-conversation-list">
                {paginatedConversations.length > 0 ? (
                  paginatedConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === activeConversationId}
                      onClick={() => setActiveConversationId(conversation.id)}
                    />
                  ))
                ) : (
                  <div className="chatbot-empty-state">Không có hội thoại phù hợp với bộ lọc hiện tại.</div>
                )}
              </div>

              <Pagination
                className="chatbot-pagination"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </aside>

            {activeConversation ? (
              <section className="chatbot-detail-panel" aria-label="Chi tiết hội thoại">
                <ChatWindow
                  conversation={activeConversation}
                  headerAction={(
                    <>
                      <button type="button" className="chatbot-rating-button" onClick={() => setIsFeedbackModalOpen(true)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z" />
                        </svg>
                        {ratingLabel}
                      </button>
                      <button type="button" className="chatbot-info-button" onClick={() => setIsInfoModalOpen(true)}>
                        Xem thông tin nhanh
                      </button>
                    </>
                  )}
                />
              </section>
            ) : (
              <section className="chatbot-detail-panel chatbot-detail-empty" aria-label="Chi tiết hội thoại">
                Chọn một cuộc hội thoại để xem nội dung chi tiết.
              </section>
            )}
          </div>
        </section>
      </main>

      {activeConversation ? (
        <>
          <DetailModal
            open={isInfoModalOpen}
            onClose={() => setIsInfoModalOpen(false)}
            title="Thông tin chi tiết"
            subtitle={`${activeConversation.patientName} · Phiên #${activeConversation.sessionCode}`}
          >
            <div className="chatbot-summary-panel" aria-label="Thông tin nhanh">
              <div className="chatbot-summary-tags">
                <span className={activeConversation.riskLevel === 'urgent' ? 'summary-tag-urgent' : ''}>
                  {activeConversation.riskLevel === 'urgent' ? 'Nguy hiểm' : 'Bình thường'}
                </span>
                <span>{activeConversation.rating ? `${activeConversation.rating}/5 CSAT` : 'Chưa đánh giá'}</span>
                <span>{activeConversation.branch}</span>
                <span>{activeConversation.specialty}</span>
              </div>
              <section>
                <h3>Triệu chứng ghi nhận</h3>
                <div className="chatbot-symptom-list">
                  {activeConversation.symptoms.map((symptom) => (
                    <span key={symptom}>{symptom}</span>
                  ))}
                </div>
              </section>
              <section>
                <h3>Kết luận sơ bộ của Bot</h3>
                <p>{activeConversation.botSummary}</p>
              </section>
            </div>
          </DetailModal>

          <DetailModal
            open={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            title="Feedback bệnh nhân"
            subtitle={`${activeConversation.patientName} · ${ratingLabel}`}
          >
            <div className="chatbot-feedback-detail">
              <div className="chatbot-feedback-score">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z" />
                </svg>
                <strong>{ratingLabel}</strong>
              </div>
              <p>{getFeedbackText(activeConversation.rating, activeConversation.feedback)}</p>
            </div>
          </DetailModal>
        </>
      ) : null}
    </div>
  )
}
