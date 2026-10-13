import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '../../..')

test('Logo files exist in public and assets', () => {
  assert.ok(fs.existsSync(path.join(webRoot, 'public/logo.svg')), 'public/logo.svg must exist')
  assert.ok(fs.existsSync(path.join(webRoot, 'public/logo.png')), 'public/logo.png must exist')
  assert.ok(fs.existsSync(path.join(webRoot, 'public/logo.webp')), 'public/logo.webp must exist')
  assert.ok(fs.existsSync(path.join(webRoot, 'public/favicon.svg')), 'public/favicon.svg must exist')
  assert.ok(fs.existsSync(path.join(webRoot, 'public/favicon.png')), 'public/favicon.png must exist')
  assert.ok(fs.existsSync(path.join(webRoot, 'src/assets/logo.webp')), 'src/assets/logo.webp must exist')
})

test('favicon.svg matches the brand logo colors and petal paths', () => {
  const faviconSvg = fs.readFileSync(path.join(webRoot, 'public/favicon.svg'), 'utf-8')
  assert.ok(faviconSvg.includes('#3D5A47'), 'Favicon must contain brand dark green #3D5A47')
  assert.ok(faviconSvg.includes('#8EAA95'), 'Favicon must contain brand sage #8EAA95')
  assert.ok(faviconSvg.includes('#FAF7F0'), 'Favicon must contain brand cream #FAF7F0')
})

test('index.html links to favicon.svg, favicon-32x32.png, and apple-touch-icon.png', () => {
  const html = fs.readFileSync(path.join(webRoot, 'index.html'), 'utf-8')
  assert.ok(html.includes('href="/favicon.svg"'), 'index.html must link to /favicon.svg')
  assert.ok(html.includes('href="/favicon-32x32.png"'), 'index.html must link to /favicon-32x32.png')
  assert.ok(html.includes('href="/apple-touch-icon.png"'), 'index.html must link to /apple-touch-icon.png')
})
