import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const formattedTextSrc = readFileSync(new URL('./FormattedChatText.tsx', import.meta.url), 'utf8')
const chatBubbleSrc = readFileSync(new URL('./ChatBubble.tsx', import.meta.url), 'utf8')
const patientChatSrc = readFileSync(new URL('../../pages/mobile-user/PatientChat.tsx', import.meta.url), 'utf8')

test('ChatBubble is wrapped in memo with custom prop comparator for smooth streaming', () => {
  assert.ok(chatBubbleSrc.includes('export const ChatBubble = memo('), 'Expected ChatBubble to be wrapped in memo')
  assert.ok(chatBubbleSrc.includes('prev.message.id === next.message.id'), 'Expected comparison by message.id')
  assert.ok(chatBubbleSrc.includes('prev.message.text === next.message.text'), 'Expected comparison by message.text')
})

test('FormattedChatText is memoized and provides fast path for non-markdown text', () => {
  assert.ok(formattedTextSrc.includes('export const FormattedChatText = memo('), 'Expected FormattedChatText to be memoized')
  assert.ok(formattedTextSrc.includes("!text.includes('*') && !text.includes('`')"), 'Expected fast path skipping regex for plain tokens')
})

test('PatientChat checks only the latest message for the thinking bubble', () => {
  assert.ok(!patientChatSrc.includes('[...messages].reverse().find'), 'Expected no array reversal inside messages.map')
  assert.ok(patientChatSrc.includes('const lastMessage = messages.at(-1)'), 'Expected constant-time latest message lookup')
  assert.match(patientChatSrc, /const showThinking = busy &&/, 'Thinking must stop on completion, error or cancellation')
  assert.match(patientChatSrc, /lastMessage\?\.role !== 'assistant' \|\|/, 'Show thinking while waiting for an assistant message')
  assert.match(patientChatSrc, /!lastMessage.parts.some\(\(part\) => part.type === 'text' && part.text.trim\(\)\)/, 'Hide thinking once assistant text arrives')
  assert.equal(patientChatSrc.split('chat-bubble-typing').length - 1, 1, 'Render only one thinking bubble')
  assert.doesNotMatch(patientChatSrc, /Serene đang xử lý câu trả lời/, 'Do not show a duplicate status beside the composer')
})

test('PatientChat formats timestamps on message arrival rather than per-chunk render', () => {
  assert.doesNotMatch(patientChatSrc, /times\[message\.id\] \? new Date\(times\[message\.id\]\)/, 'Expected no repeated new Date formatting inside message render loop')
})
