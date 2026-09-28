import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const css = readFileSync(new URL('./PatientPage.css', import.meta.url), 'utf8')

test('keeps narrow-phone styles in exactly one top-level media query', () => {
  const breakpoint = '@media (max-width: 640px)'
  const first = css.indexOf(breakpoint)

  assert.notEqual(first, -1, 'Expected @media (max-width: 640px) declaration to exist')

  const before = css.slice(0, first)
  const cleanBefore = before.replace(/\/\*[\s\S]*?\*\//g, '')
  const openBraces = (cleanBefore.match(/{/g) ?? []).length
  const closeBraces = (cleanBefore.match(/}/g) ?? []).length
  assert.equal(openBraces - closeBraces, 0, 'Expected net brace depth zero before lone @media (max-width: 640px)')

  const matches = css.match(/@media\s*\(max-width:\s*640px\)/g) ?? []
  assert.equal(matches.length, 1, 'Expected exactly one @media (max-width: 640px) declaration')
})
