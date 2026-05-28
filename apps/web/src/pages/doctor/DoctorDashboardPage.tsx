import { useState } from 'react'
import '../../components/layout/DesktopShell.css'
import { Header } from '../../components/layout/header/Header'
import { Sidebar } from '../../components/layout/sidebar/Sidebar'
import { AppointmentListTab } from './appointments/AppointmentListTab'
import { LiveConsultationTab } from './consultation/LiveConsultationTab'
import { DashboardTab } from './dashboard/DashboardTab'
import './DoctorDashboardPage.css'
import { doctorSidebarConfig } from './doctorSidebarConfig'
import { PatientListTab } from './patients/PatientListTab'
import SchedulePage from './schedule/DoctorSchedulePage'

export function DoctorDashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Dashboard')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  // Create a customized config where activeLabel matches current activeTab state
  const dynamicSidebarConfig = {
    ...doctorSidebarConfig,
    activeLabel: activeTab,
  }

  const renderTabContent = () => {
    const handleBackToDashboard = () => setActiveTab('Dashboard')

    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardTab 
            onNavigateTab={setActiveTab} 
            onViewPatientProfile={(patientId) => {
              setSelectedPatientId(patientId)
              setActiveTab('Danh sách bệnh nhân')
            }}
            onViewChatMessage={(chatId) => {
              setSelectedChatId(chatId)
              setActiveTab('Tư vấn trực tiếp')
            }}
          />
        )
      case 'Tư vấn trực tiếp':
        return (
          <LiveConsultationTab 
            onBackToDashboard={handleBackToDashboard} 
            onViewPatientProfile={(patientId) => {
              setSelectedPatientId(patientId)
              setActiveTab('Danh sách bệnh nhân')
            }}
            initialActiveChatId={selectedChatId}
            onClearActiveChat={() => setSelectedChatId(null)}
          />
        )
      case 'Danh sách bệnh nhân':
        return (
          <PatientListTab 
            onBackToDashboard={handleBackToDashboard} 
            initialActivePatientId={selectedPatientId}
            onClearActivePatient={() => setSelectedPatientId(null)}
          />
        )
      case 'Lịch làm việc':
        return <SchedulePage onBackToDashboard={handleBackToDashboard} />
      case 'Lịch hẹn khám':
        return (
          <AppointmentListTab
            onBackToDashboard={handleBackToDashboard}
            onViewPatientProfile={(patientId) => {
              setSelectedPatientId(patientId)
              setActiveTab('Danh sách bệnh nhân')
            }}
          />
        )
      default:
        return <DashboardTab onNavigateTab={setActiveTab} />
    }
  }

  return (
    <div className="desktop-shell-page doctor-dashboard-page">
      <Sidebar
        config={dynamicSidebarConfig}
        onItemClick={(tab) => {
          setSelectedPatientId(null)
          setSelectedChatId(null)
          setActiveTab(tab)
        }}
      />
      <Header profileRole={dynamicSidebarConfig.profileRole} />
      <main className="desktop-shell-main doctor-dashboard-main" aria-label="Nội dung chính">
        {renderTabContent()}
      </main>
    </div>
  )
}
