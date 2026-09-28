import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('./PatientPage.css', import.meta.url), 'utf8')

test('keeps narrow-phone styles in exactly one media query', () => {
  const matches = css.match(/@media\s*\(max-width:\s*640px\)/g) ?? []
  assert.equal(matches.length, 1, 'Expected exactly one @media (max-width: 640px) declaration')
})
