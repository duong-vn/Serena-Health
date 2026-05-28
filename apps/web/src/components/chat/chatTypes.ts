export type ChatSender = 'patient' | 'chatbot' | 'doctor' | 'system'

export type HandlerType = 'bot' | 'doctor'

export type RiskLevel = 'normal' | 'urgent'

export type ChatMessage = {
  id: string
  sender: ChatSender
  text: string
  time: string
  avatarLabel?: string
  doctorName?: string
}

export type ChatConversation = {
  id: string
  sessionCode: string
  patientName: string
  patientAge?: number
  branch: string
  specialty: string
  handlerType: HandlerType
  riskLevel: RiskLevel
  rating?: number
  feedback?: string
  doctorName?: string
  takeoverTime?: string
  lastMessage: string
  updatedMinutesAgo: number
  symptoms: string[]
  botSummary: string
  messages: ChatMessage[]
}
