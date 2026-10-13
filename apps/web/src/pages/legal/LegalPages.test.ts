import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '../../..')

test('PrivacyPolicyPage contains h1 with Serene Health for Google crawler matching', () => {
  const file = fs.readFileSync(path.join(webRoot, 'src/pages/legal/PrivacyPolicyPage.tsx'), 'utf-8')
  assert.ok(file.includes('<h1>Serene Health'), 'H1 tag must contain Serene Health')
  assert.ok(file.includes('Google API'), 'Must mention Google API compliance')
})

test('TermsOfServicePage contains h1 with Serene Health for Google crawler matching', () => {
  const file = fs.readFileSync(path.join(webRoot, 'src/pages/legal/TermsOfServicePage.tsx'), 'utf-8')
  assert.ok(file.includes('<h1>Serene Health'), 'H1 tag must contain Serene Health')
  assert.ok(file.includes('Medical Disclaimer'), 'Must contain medical disclaimer')
})

test('App.tsx defines public routes for /privacy, /policy, /terms', () => {
  const file = fs.readFileSync(path.join(webRoot, 'src/App.tsx'), 'utf-8')
  assert.ok(file.includes('path="/privacy"'), 'Route /privacy must exist')
  assert.ok(file.includes('path="/policy"'), 'Route /policy must exist')
  assert.ok(file.includes('path="/terms"'), 'Route /terms must exist')
})

test('AuthPage links to /terms and /privacy', () => {
  const file = fs.readFileSync(path.join(webRoot, 'src/pages/auth/AuthPage.tsx'), 'utf-8')
  assert.ok(file.includes('to="/terms"'), 'AuthPage must link to /terms')
  assert.ok(file.includes('to="/privacy"'), 'AuthPage must link to /privacy')
})

test('AuthPage contains h1 with Serene Health brand for Google audit', () => {
  const file = fs.readFileSync(path.join(webRoot, 'src/pages/auth/AuthPage.tsx'), 'utf-8')
  assert.ok(file.includes('<h1 className="auth-wordmark"'), 'Desktop brand wordmark must be h1')
  assert.ok(file.includes('<h1 className="auth-mobile-brand"'), 'Mobile brand wordmark must be h1')
  assert.ok(file.includes('Serene<span className="auth-wordmark-light"> Health</span>'), 'Must contain Serene Health text in wordmark')
})
