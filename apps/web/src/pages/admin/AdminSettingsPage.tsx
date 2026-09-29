import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { useAuth } from '../../auth/AuthContext'
import { SystemLogo } from '../../components/brand/SystemLogo'
import './AdminPages.css'

interface ModelSettings {
  model: string
  models: string[]
}

export function AdminSettingsPage() {
  const { user, logout } = useAuth()
  const { data, error, loading, reload } = useApi<ModelSettings>('/admin/settings/model')
  const [activeModel, setActiveModel] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (data) {
      setActiveModel(data.model)
      setSelectedModel(data.model)
    }
  }, [data])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(null), 4_000)
    return () => clearTimeout(timeout)
  }, [notice])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data?.models.includes(selectedModel) || saving) return
    setSaving(true)
    setNotice(null)
    try {
      const result = await api<{ model: string }>('/admin/settings/model', {
        method: 'PUT',
        body: JSON.stringify({ model: selectedModel }),
      })
      setActiveModel(result.model)
      setSelectedModel(result.model)
      setNotice({ message: 'Đã lưu cấu hình. Các lượt chat tiếp theo sẽ dùng model mới.', kind: 'success' })
    } catch (failure) {
      setNotice({ message: failure instanceof Error ? failure.message : 'Không thể lưu cấu hình.', kind: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return <div className="admin-settings-page">
    <header className="admin-topbar">
      <div className="admin-brand"><SystemLogo /><span>Serene Health <small>Admin</small></span></div>
      <div className="admin-topbar-actions"><span>{user?.fullName}</span><button type="button" onClick={logout}>Đăng xuất</button></div>
    </header>
    <main className="admin-settings-main">
      <Link className="admin-text-link" to="/manager/dashboard">← Về dashboard</Link>
      <p className="admin-eyebrow">CẤU HÌNH HỆ THỐNG</p>
      <h1>Model AI của chatbot</h1>
      <p className="admin-muted">Chọn model dùng cho các cuộc trò chuyện mới và các tin nhắn tiếp theo.</p>

      <section className="admin-setting-card" aria-labelledby="model-heading" aria-busy={loading || saving}>
        <div className="admin-card-heading"><div><h2 id="model-heading">Model đang hoạt động</h2><p>Cấu hình áp dụng ngay sau khi lưu.</p></div>{activeModel && <span className="admin-active-badge">Đang hoạt động</span>}</div>
        {loading && <p role="status">Đang tải cấu hình...</p>}
        {error && <div className="admin-error" role="alert"><p>{error.message}</p><button type="button" onClick={reload}>Thử lại</button></div>}
        {data && !loading && !error && <form onSubmit={save}>
          <p className="admin-current-model">{activeModel}</p>
          <label htmlFor="chatbot-model">Chọn model AI</label>
          <select id="chatbot-model" value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            {!data.models.includes(selectedModel) && <option value={selectedModel}>{selectedModel} (cấu hình cũ)</option>}
            {data.models.map((model) => <option value={model} key={model}>{model}</option>)}
          </select>
          <p className="admin-field-help">Model sẽ được sử dụng ở lượt chat kế tiếp, kể cả trong cuộc trò chuyện đang mở.</p>
          <button className="admin-primary-button" type="submit" disabled={saving || selectedModel === activeModel || !data.models.includes(selectedModel)}>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</button>
        </form>}
      </section>
    </main>
    {notice && <div className={`admin-toast admin-toast-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.message}</div>}
  </div>
}
