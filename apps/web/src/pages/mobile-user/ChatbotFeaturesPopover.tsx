import { useEffect, useRef, useState, type ReactNode } from 'react'

interface FeatureItem {
  title: string
  description: string
  icon: ReactNode
}

const AI_FEATURES: readonly FeatureItem[] = [
  {
    title: 'Sàng lọc triệu chứng 24/7',
    description: 'Lắng nghe biểu hiện ban đầu, hỏi thêm mức độ và gợi ý hướng chăm sóc phù hợp.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: 'Tra cứu bác sĩ & dịch vụ',
    description: 'Tìm kiếm bác sĩ theo chuyên khoa và tra cứu danh mục dịch vụ thực tế của phòng khám.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: 'Kiểm tra lịch & giờ khám',
    description: 'Tra cứu khung giờ làm việc và thời gian còn trống thực tế theo từng ngày.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Đối chiếu hồ sơ cá nhân',
    description: 'Tự động tham khảo tiền sử bệnh và dị ứng đã lưu để đưa ra phản hồi an toàn, sát thực tế.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    title: 'Cảnh báo dấu hiệu nguy hiểm',
    description: 'Phát hiện các triệu chứng khẩn cấp và ưu tiên nhắc nhở liên hệ tổng đài 115 lập tức.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
] as const

export function ChatbotFeaturesPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="chatbot-features-anchor" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`btn-ai-features ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="chatbot-features-panel"
        title="Xem các tính năng hỗ trợ của Serene AI"
      >
        <svg
          className="btn-ai-features-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
        </svg>
        <span>Khả năng AI</span>
      </button>

      {isOpen && (
        <div
          id="chatbot-features-panel"
          className="chatbot-features-popover"
          role="dialog"
          aria-label="Khả năng của Serene AI"
          aria-modal="false"
        >
          <div className="features-popover-header">
            <div className="features-popover-title">
              <span className="features-popover-badge" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
                </svg>
              </span>
              <div>
                <h3>Khả năng của Serene AI</h3>
                <p>Trợ lý thông tin sức khỏe ban đầu</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-features-close"
              onClick={() => {
                setIsOpen(false)
                buttonRef.current?.focus()
              }}
              aria-label="Đóng bảng tính năng"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="features-popover-list">
            {AI_FEATURES.map((item) => (
              <div key={item.title} className="features-popover-item">
                <div className="features-item-icon" aria-hidden="true">
                  {item.icon}
                </div>
                <div className="features-item-body">
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="features-popover-footer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Serene AI không kê đơn thuốc và không thay thế chẩn đoán bác sĩ.</span>
          </div>
        </div>
      )}
    </div>
  )
}
