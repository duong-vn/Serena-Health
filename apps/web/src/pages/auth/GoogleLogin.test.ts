import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('AuthPage.css contains styles for Google login button and divider', () => {
  const css = fs.readFileSync(path.join(__dirname, 'AuthPage.css'), 'utf-8')
  assert.ok(css.includes('.auth-google-btn'), 'Should define .auth-google-btn')
  assert.ok(css.includes('.auth-google-official-btn'), 'Should define .auth-google-official-btn')
  assert.ok(css.includes('.auth-divider-text'), 'Should define .auth-divider-text')
})

test('GoogleLoginButton file exists and has named export', () => {
  const source = fs.readFileSync(path.join(__dirname, 'GoogleLoginButton.tsx'), 'utf-8')
  assert.ok(source.includes('export const GoogleLoginButton'), 'Should have named export GoogleLoginButton')
  assert.ok(source.includes('VITE_GOOGLE_CLIENT_ID'), 'Should reference VITE_GOOGLE_CLIENT_ID')
})
