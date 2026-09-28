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

test('has balanced braces across entire stylesheet', () => {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const openBraces = (clean.match(/{/g) ?? []).length
  const closeBraces = (clean.match(/}/g) ?? []).length
  assert.equal(openBraces - closeBraces, 0, 'Expected net brace depth zero across entire PatientPage.css')
})

test('enforces drawer layering and transition contract under 900px breakpoint', () => {
  const match900 = css.match(/@media\s*\(max-width:\s*900px\)\s*\{([\s\S]*?\n\})/)
  assert.ok(match900, 'Expected @media (max-width: 900px) block to exist')
  const content900 = match900[1]

  // Backdrop behind sidebar, above stage
  assert.match(content900, /\.patient-sidebar-backdrop\s*\{[^}]*z-index:\s*15;/, 'Expected backdrop z-index 15')
  assert.match(content900, /\.patient-sidebar\s*\{[^}]*z-index:\s*20;/, 'Expected sidebar z-index 20')

  // Sidebar transition present, transition: none removed
  assert.doesNotMatch(content900, /\.patient-sidebar\s*\{[^}]*transition:\s*none;/, 'Expected no transition: none on sidebar')
  assert.match(content900, /\.patient-sidebar\s*\{[^}]*transition:\s*transform 0\.25s/, 'Expected sidebar transform transition')

  // Collapsed drawer pointer and visibility safety
  assert.match(content900, /\.patient-sidebar\.is-collapsed\s*\{[^}]*visibility:\s*hidden;/, 'Expected visibility hidden when collapsed')
  assert.match(content900, /\.patient-sidebar\.is-collapsed\s*\{[^}]*pointer-events:\s*none;/, 'Expected pointer-events none when collapsed')
  assert.match(content900, /\.patient-sidebar\.is-collapsed\s*\{[^}]*transform:\s*translateX\(-100%\);/, 'Expected transform translateX(-100%) when collapsed')
})

test('retains reduced-motion preference query for typing dots', () => {
  assert.match(
    css,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.chat-typing-dots\s+i\s*\{[^}]*animation:\s*none;/,
    'Expected prefers-reduced-motion to disable typing dots animation'
  )
})
