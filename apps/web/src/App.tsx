import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/auth/AuthPage'
import { ManagerDashboardPage } from './pages/manager/dashboard/ManagerDashboardPage'
import { ManagerReportAnalysisPage } from './pages/manager/report-analysis/ManagerReportAnalysisPage'
import { ChatbotMonitorPage } from './pages/manager/chatbot-monitor/ChatbotMonitorPage'
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage'
import { DoctorDetailPage } from './pages/manager/doctors/DoctorDetailPage'
import { DoctorManagementPage } from './pages/manager/doctors/DoctorManagementPage'
import { DoctorNewPage } from './pages/manager/doctors/DoctorNewPage'
import { DoctorsDataProvider } from './pages/manager/doctors/DoctorsDataContext'

function App() {
  return (
    <DoctorsDataProvider>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
        <Route path="/manager/report" element={<ManagerReportAnalysisPage />} />
        <Route path="/manager/doctors" element={<DoctorManagementPage />} />
        <Route path="/manager/doctors/new" element={<DoctorNewPage />} />
        <Route path="/manager/doctors/:doctorId" element={<DoctorDetailPage />} />
        <Route path="/manager/chatbot-monitor" element={<ChatbotMonitorPage />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </DoctorsDataProvider>
  )
}

export default App
