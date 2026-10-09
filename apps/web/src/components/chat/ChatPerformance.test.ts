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

test('PatientChat computes last assistant message once without O(N^2) search', () => {
  assert.ok(!patientChatSrc.includes('[...messages].reverse().find'), 'Expected no O(N^2) array reversal inside messages.map')
  assert.ok(patientChatSrc.includes('for (let i = messages.length - 1; i >= 0; i--)'), 'Expected efficient backwards scan outside or before loop')
})

test('PatientChat formats timestamps on message arrival rather than per-chunk render', () => {
  assert.doesNotMatch(patientChatSrc, /times\[message\.id\] \? new Date\(times\[message\.id\]\)/, 'Expected no repeated new Date formatting inside message render loop')
})
