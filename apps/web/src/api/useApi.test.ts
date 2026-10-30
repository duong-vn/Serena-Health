import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const hook = readFileSync(new URL('./useApi.ts', import.meta.url), 'utf8')
const page = readFileSync(new URL('../pages/mobile-user/PatientPage.tsx', import.meta.url), 'utf8')

test('background reload preserves data only when requested and the resource is unchanged', () => {
  assert.match(hook, /keepDataOnReload = false/)
  assert.match(hook, /if \(!keepDataOnReload \|\| previousPath.current !== path\) setData\(null\)/)
  assert.match(hook, /previousPath.current = null/)
  assert.match(hook, /return \(\) => controller.abort\(\)/)
})

test('patient chat defers secondary resources and retains conversations during refresh', () => {
  assert.ok(page.includes("useApi<Conversation[]>('/conversations', true)"))
  assert.ok(page.includes("tab === 'appointments' ? '/appointments' : null"))
  assert.ok(page.includes("tab === 'profile' ? '/profile' : null"))
  assert.ok(page.includes('conversations.loading && !conversations.data'))
})
