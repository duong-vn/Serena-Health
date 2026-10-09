import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { useAuth, type UserRole } from './auth/AuthContext'
import { DoctorsDataProvider } from './pages/manager/doctors/DoctorsDataContext'

const AuthPage = lazy(() => import('./pages/auth/AuthPage').then((m) => ({ default: m.AuthPage })))
const PatientPage = lazy(() => import('./pages/mobile-user/PatientPage'))
const DoctorDashboardPage = lazy(() => import('./pages/doctor/DoctorDashboardPage').then((m) => ({ default: m.DoctorDashboardPage })))
const ExpertPage = lazy(() => import('./pages/expert/ExpertPage'))
const ChatbotMonitorPage = lazy(() => import('./pages/manager/chatbot-monitor/ChatbotMonitorPage').then((m) => ({ default: m.ChatbotMonitorPage })))
const ManagerDashboardPage = lazy(() => import('./pages/manager/dashboard/ManagerDashboardPage').then((m) => ({ default: m.ManagerDashboardPage })))
const DoctorDetailPage = lazy(() => import('./pages/manager/doctors/DoctorDetailPage').then((m) => ({ default: m.DoctorDetailPage })))
const DoctorManagementPage = lazy(() => import('./pages/manager/doctors/DoctorManagementPage').then((m) => ({ default: m.DoctorManagementPage })))
const DoctorNewPage = lazy(() => import('./pages/manager/doctors/DoctorNewPage').then((m) => ({ default: m.DoctorNewPage })))
const ManagerReportAnalysisPage = lazy(() => import('./pages/manager/report-analysis/ManagerReportAnalysisPage').then((m) => ({ default: m.ManagerReportAnalysisPage })))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))

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

function ProtectedRoute({ children, roles, loginPath = '/login' }: { children: ReactNode; roles: UserRole[]; loginPath?: string }) {
  const { error, loading, user } = useAuth()
  if (loading || error) return <PageLoader />
  if (!user) return <Navigate to={loginPath} replace />
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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<GuestRoute />} />
        <Route path="/login" element={<GuestRoute />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/admin/settings" element={<ProtectedRoute roles={['MANAGER']} loginPath="/admin/login"><AdminSettingsPage /></ProtectedRoute>} />
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
    </Suspense>
  )
}

export default App
