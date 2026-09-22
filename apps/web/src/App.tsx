import { type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { useAuth, type UserRole } from './auth/AuthContext'
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage'
import { AuthPage } from './pages/auth/AuthPage'
import ExpertPage from './pages/expert/ExpertPage'
import PatientPage from './pages/mobile-user/PatientPage'
import { ChatbotMonitorPage } from './pages/manager/chatbot-monitor/ChatbotMonitorPage'
import { ManagerDashboardPage } from './pages/manager/dashboard/ManagerDashboardPage'
import { DoctorDetailPage } from './pages/manager/doctors/DoctorDetailPage'
import { DoctorManagementPage } from './pages/manager/doctors/DoctorManagementPage'
import { DoctorsDataProvider } from './pages/manager/doctors/DoctorsDataContext'
import { DoctorNewPage } from './pages/manager/doctors/DoctorNewPage'
import { ManagerReportAnalysisPage } from './pages/manager/report-analysis/ManagerReportAnalysisPage'

const roleHome: Record<UserRole, string> = {
  DOCTOR: '/doctor/dashboard',
  EXPERT: '/expert',
  MANAGER: '/manager/dashboard',
  PATIENT: '/patient',
}

function PageLoader() {
  const { error, retry, logout } = useAuth()
  return <main aria-busy={!error} aria-live="polite" className="route-state">
    {error ? <><p role="alert">{error}</p><button onClick={retry}>Thử lại</button> <button onClick={logout}>Về đăng nhập</button></> : 'Đang xác thực phiên đăng nhập...'}
  </main>
}

function ProtectedRoute({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { error, loading, user } = useAuth()
  if (loading || error) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={roleHome[user.role]} replace />
  return children
}

function GuestRoute() {
  const { error, loading, user } = useAuth()
  if (loading || error) return <PageLoader />
  return user ? <Navigate to={roleHome[user.role]} replace /> : <AuthPage />
}

function App() {
  return (
      <Routes>
        <Route path="/" element={<GuestRoute />} />
        <Route path="/login" element={<GuestRoute />} />
        <Route element={<ProtectedRoute roles={['MANAGER']}><DoctorsDataProvider><Outlet /></DoctorsDataProvider></ProtectedRoute>}>
        <Route path="/manager/dashboard" element={<ProtectedRoute roles={['MANAGER']}><ManagerDashboardPage /></ProtectedRoute>} />
        <Route path="/manager/report" element={<ProtectedRoute roles={['MANAGER']}><ManagerReportAnalysisPage /></ProtectedRoute>} />
        <Route path="/manager/doctors" element={<ProtectedRoute roles={['MANAGER']}><DoctorManagementPage /></ProtectedRoute>} />
        <Route path="/manager/doctors/new" element={<ProtectedRoute roles={['MANAGER']}><DoctorNewPage /></ProtectedRoute>} />
        <Route path="/manager/doctors/:doctorId" element={<ProtectedRoute roles={['MANAGER']}><DoctorDetailPage /></ProtectedRoute>} />
        <Route path="/manager/chatbot-monitor" element={<ProtectedRoute roles={['MANAGER']}><ChatbotMonitorPage /></ProtectedRoute>} />
        </Route>
        <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['DOCTOR']}><DoctorDashboardPage /></ProtectedRoute>} />
        <Route path="/patient" element={<ProtectedRoute roles={['PATIENT']}><PatientPage /></ProtectedRoute>} />
        <Route path="/expert" element={<ProtectedRoute roles={['EXPERT']}><ExpertPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default App
