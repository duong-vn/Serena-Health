import { Link } from 'react-router-dom'
import { ChatSession } from './PatientChat'
import './PatientPage.css'

export function GuestChatPage() {
  return (
    <main className="patient-sanctuary">
      <section className="patient-stage">
        <div className="patient-top-strip">
          <div className="top-strip-left">
            <span className="medical-safety-chip">Chat khách · Không lưu lịch sử · AI không thay thế bác sĩ</span>
          </div>
          <div className="top-strip-right">
            <a className="btn-emergency-pill" href="tel:115">Cấp cứu 115</a>
            <Link className="btn-book-quick" to="/login">Đăng nhập</Link>
          </div>
        </div>
        <div className="patient-chat-canvas">
          <ChatSession conversationId="guest" initial={[]} guest />
        </div>
      </section>
    </main>
  )
}
