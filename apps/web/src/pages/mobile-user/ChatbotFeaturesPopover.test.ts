import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const popoverSrc = readFileSync(new URL('./ChatbotFeaturesPopover.tsx', import.meta.url), 'utf8')
const patientChatSrc = readFileSync(new URL('./PatientChat.tsx', import.meta.url), 'utf8')
const cssSrc = readFileSync(new URL('./PatientPage.css', import.meta.url), 'utf8')

test('ChatbotFeaturesPopover exports named component with proper accessibility attributes', () => {
  assert.ok(popoverSrc.includes('export function ChatbotFeaturesPopover()'), 'Expected named export ChatbotFeaturesPopover')
  assert.ok(popoverSrc.includes('aria-expanded={isOpen}'), 'Expected aria-expanded attribute on toggle button')
  assert.ok(popoverSrc.includes('aria-haspopup="dialog"'), 'Expected aria-haspopup="dialog" on toggle button')
  assert.ok(popoverSrc.includes('role="dialog"'), 'Expected role="dialog" on popover panel')
  assert.ok(popoverSrc.includes('aria-label="Khả năng của Serene AI"'), 'Expected aria-label on popover panel')
  assert.ok(popoverSrc.includes("event.key === 'Escape'"), 'Expected Escape key handler to close popover')
})

test('ChatbotFeaturesPopover lists key Serene chatbot capabilities', () => {
  assert.ok(popoverSrc.includes('Sàng lọc triệu chứng 24/7'), 'Expected symptom screening feature')
  assert.ok(popoverSrc.includes('Tra cứu bác sĩ & dịch vụ'), 'Expected doctor and service catalog feature')
  assert.ok(popoverSrc.includes('Kiểm tra lịch & giờ khám'), 'Expected schedule checking feature')
  assert.ok(popoverSrc.includes('Đối chiếu hồ sơ cá nhân'), 'Expected patient profile context feature')
  assert.ok(popoverSrc.includes('Cảnh báo dấu hiệu nguy hiểm'), 'Expected emergency warning feature')
  assert.ok(popoverSrc.includes('Serene AI không kê đơn thuốc và không thay thế chẩn đoán bác sĩ'), 'Expected medical safety note')
})

test('PatientChat integrates ChatbotFeaturesPopover into heading action area', () => {
  assert.ok(patientChatSrc.includes("import { ChatbotFeaturesPopover } from './ChatbotFeaturesPopover'"), 'Expected import of ChatbotFeaturesPopover')
  assert.ok(patientChatSrc.includes('<ChatbotFeaturesPopover />'), 'Expected ChatbotFeaturesPopover to be rendered')
  assert.ok(patientChatSrc.includes('patient-chat-heading-actions'), 'Expected heading actions container')
})

test('PatientPage.css contains styles for AI features button and popover panel', () => {
  assert.match(cssSrc, /\.btn-ai-features\s*\{/, 'Expected .btn-ai-features style definition')
  assert.match(cssSrc, /\.chatbot-features-popover\s*\{/, 'Expected .chatbot-features-popover style definition')
  assert.match(cssSrc, /@keyframes\s+featuresPopIn\s*\{/, 'Expected animation for features popover')
})
