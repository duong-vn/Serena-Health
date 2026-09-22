import { useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { useAuth } from '../../auth/AuthContext'
import '../mobile-user/PatientPage.css'

interface Conversation { id: string; title: string; createdAt: string }
interface Message { id: string; role: string; content: string; model?: string; createdAt: string }
interface Review { id: string; conversationId: string; notes: string; flagReason?: string; status: string; resolution?: string }

export default function ExpertPage() {
  const { user, logout } = useAuth()
  const conversations = useApi<Conversation[]>('/expert/conversations')
  const reviews = useApi<Review[]>('/expert/reviews')
  const [selected, setSelected] = useState('')
  const messages = useApi<Message[]>(selected ? `/expert/conversations/${selected}/messages` : null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return <main className="patient-portal">
    <header className="patient-header"><div><h1>Rà soát chất lượng Serene</h1><p>{user?.fullName} · Chuyên gia</p></div><button onClick={logout}>Đăng xuất</button></header>
    <p className="patient-safety">Đánh giá phản hồi AI và ghi nhận vấn đề. Nội dung người bệnh tự khai chưa được xác nhận. Phiên bản này không có kho tri thức RAG.</p>
    <section className="patient-chat-layout"><aside className="conversation-list"><h2>Hội thoại AI</h2>
      {conversations.loading && <p>Đang tải…</p>}{conversations.error && <p role="alert">{conversations.error?.message}</p>}
      {!conversations.loading && !conversations.data?.length && <p>Chưa có hội thoại để rà soát.</p>}
      {conversations.data?.map((item) => <button key={item.id} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.title}<br /><small>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</small></button>)}
    </aside><div className="patient-chat"><h2>Nội dung và ghi chú</h2>
      {!selected && <p>Chọn hội thoại để kiểm tra phản hồi, đánh dấu vấn đề hoặc thêm ghi chú.</p>}
      {messages.loading && <p role="status">Đang tải tin nhắn…</p>}{messages.error && <p role="alert">{messages.error?.message}</p>}
      <div className="patient-messages">{messages.data?.map((item) => <article key={item.id}><strong>{item.role === 'ASSISTANT' ? 'Serene AI' : item.role === 'USER' ? 'Người bệnh' : item.role}</strong><p>{item.content}</p>{item.model && <small>Model: {item.model}</small>}</article>)}</div>
      {selected && <form className="portal-form" onSubmit={async (event) => {
        event.preventDefault(); setBusy(true); setError('')
        const form = event.currentTarget; const fields = new FormData(form)
        try { await api('/expert/reviews', { method: 'POST', body: JSON.stringify({ conversationId: selected, notes: fields.get('notes'), flagReason: fields.get('flagReason') || undefined }) }); reviews.reload(); form.reset() }
        catch (error) { setError(error instanceof Error ? error.message : 'Không thể lưu đánh giá') }
        finally { setBusy(false) }
      }}><label>Ghi chú đánh giá<textarea name="notes" required maxLength={4000} rows={3} /></label><label>Vấn đề cần theo dõi (không bắt buộc)<input name="flagReason" maxLength={500} /></label><button disabled={busy}>Lưu đánh giá</button></form>}
    </div></section>
    {error && <p role="alert" className="portal-error">{error}</p>}
    <section className="portal-section"><h2>Đánh giá đã ghi nhận</h2>{reviews.error && <p role="alert">{reviews.error?.message}</p>}{reviews.loading && <p>Đang tải…</p>}{reviews.data?.length === 0 && <p>Chưa có đánh giá.</p>}
      {reviews.data?.map((review) => <article className="appointment-row" key={review.id}><div><strong>{review.status}</strong><p>{review.notes}</p>{review.flagReason && <p>Vấn đề: {review.flagReason}</p>}{review.resolution && <p>Xử lý: {review.resolution}</p>}</div>{review.status !== 'RESOLVED' && <button disabled={busy} onClick={async () => {
        const resolution = window.prompt('Ghi rõ cách vấn đề đã được xử lý:')
        if (!resolution?.trim()) return
        setBusy(true); setError('')
        try { await api(`/expert/reviews/${review.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'RESOLVED', resolution: resolution.trim() }) }); reviews.reload() }
        catch (error) { setError(error instanceof Error ? error.message : 'Không thể cập nhật') }
        finally { setBusy(false) }
      }}>Đánh dấu đã xử lý</button>}</article>)}
    </section>
  </main>
}
