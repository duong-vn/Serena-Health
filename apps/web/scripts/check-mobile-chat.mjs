// Run with Playwright's browser_run_code tool (filename), against the local Vite server.
// API fixtures keep this UI check independent of accounts, patient data, and AI services.
async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  const messages = Array.from({ length: 18 }, (_, i) => ({
    id: `message-${i}`, role: i % 2 ? 'ASSISTANT' : 'USER',
    content: i % 2 ? '## Hướng dẫn chăm sóc\nTheo dõi sức khỏe và **nghỉ ngơi**.\n- Uống đủ nước\n- Liên hệ bác sĩ khi cần' : 'Tôi muốn hỏi về triệu chứng đau đầu và cách chăm sóc sức khỏe.',
    createdAt: '2026-09-24T08:30:00.000Z',
  }))
  messages.push({ id: 'long', role: 'ASSISTANT', content: '## Nội dung dài\n' + 'LongUnbrokenText'.repeat(40) + '\n```js\nconst example = "' + 'code'.repeat(80) + '";\n```\n![Minh họa](/mobile-check.svg)\n`inline code`', createdAt: '2026-09-24T08:31:00.000Z' })
  await page.route('**/mobile-check.svg', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#d8e2dc"/></svg>' }))
  await page.route('**/api/v1/**', async route => {
    const path = route.request().url().split('/api/v1')[1].split('?')[0]
    const data = path === '/auth/me' ? { id: 'ui-patient', fullName: 'Người dùng thử', email: 'ui@example.invalid', phone: null, role: 'PATIENT', active: true }
      : path === '/conversations' ? [{ id: 'ui-chat', title: 'Tư vấn sức khỏe' }]
      : path.endsWith('/messages') ? messages : path === '/profile' ? {} : []
    await route.fulfill({ json: data })
  })
  await page.addInitScript(() => sessionStorage.setItem('serene-health.access-token', 'ui-test-only'))
  const results = []
  for (const width of [320, 375, 390, 412, 430]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('http://127.0.0.1:5174/patient')
    await page.locator('#patient-message').waitFor()
    await page.evaluate(() => document.fonts.ready)
    const metrics = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON()
      const log = document.querySelector('.patient-messages')
      return {
        width: innerWidth, documentWidth: document.documentElement.scrollWidth,
        sidebar: rect('.patient-sidebar'), composer: rect('.patient-composer'), log: rect('.patient-messages'),
        inputFont: parseFloat(getComputedStyle(document.querySelector('#patient-message')).fontSize),
        send: rect('.btn-send-message'), bottomGap: log.scrollHeight - log.clientHeight - log.scrollTop,
        code: !!log.querySelector('pre code'), image: !!log.querySelector('img'),
        timestamps: [...log.querySelectorAll('time')].every(t => t.textContent.trim()),
      }
    })
    assert(metrics.sidebar.right <= 1, `${width}: sidebar covers chat on initial load`)
    assert(metrics.documentWidth <= width, `${width}: document overflows horizontally`)
    assert(metrics.composer.right <= width && metrics.composer.bottom <= 844, `${width}: composer outside viewport`)
    assert(metrics.log.bottom <= metrics.composer.y, `${width}: messages hidden behind composer`)
    assert(metrics.inputFont >= 16, `${width}: input triggers iOS zoom`)
    assert(metrics.send.width >= 44 && metrics.send.height >= 44, `${width}: send touch target below 44px`)
    assert(metrics.code && metrics.image && metrics.timestamps, `${width}: code/image/timestamp missing`)
    assert(metrics.bottomGap < 3, `${width}: history does not start at latest message`)
    await page.getByRole('button', { name: 'Mở danh sách hội thoại', exact: true }).click()
    assert(await page.locator('.patient-stage').evaluate(el => el.inert), `${width}: drawer does not isolate focus`)
    await page.locator('.patient-sidebar-user').click()
    assert(await page.getByRole('menuitem').first().evaluate(el => el === document.activeElement), `${width}: account menu did not receive focus`)
    await page.keyboard.press('Escape')
    assert(await page.locator('#patient-conversations').evaluate(el => !el.inert), `${width}: Escape closed drawer instead of menu`)
    await page.getByRole('button', { name: 'Tư vấn sức khỏe', exact: true }).click()
    assert(await page.locator('#patient-conversations').evaluate(el => el.inert), `${width}: selection leaves drawer open`)
    await page.locator('#patient-message').fill('Draft survives keyboard resize\n'.repeat(12))
    await page.locator('#patient-message').focus()
    // Simulate iOS visual viewport shrinking without a layout viewport resize.
    await page.evaluate(() => {
      Object.defineProperty(visualViewport, 'height', { configurable: true, value: 380 })
      Object.defineProperty(visualViewport, 'offsetTop', { configurable: true, value: 35 })
      visualViewport.dispatchEvent(new Event('resize'))
    })
    const keyboard = await page.locator('.patient-composer').boundingBox()
    assert(keyboard.y >= 35 && keyboard.y + keyboard.height <= 415, `${width}: keyboard covers composer`)
    assert(await page.locator('#patient-message').inputValue() === 'Draft survives keyboard resize\n'.repeat(12), `${width}: draft lost on resize`)
    await page.evaluate(() => {
      delete visualViewport.height
      delete visualViewport.offsetTop
      visualViewport.dispatchEvent(new Event('resize'))
    })
    await page.locator('#patient-message').fill('')
    await page.setViewportSize({ width, height: 380 })
    const compact = await page.locator('.patient-composer').boundingBox()
    assert(compact.y + compact.height <= 380, `${width}: resized layout hides composer`)
    results.push({ width, passed: true })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:5174/patient')
  await page.locator('#patient-message').waitFor()
  let pending
  await page.route('**/api/v1/ai/chat', route => { pending = route })
  await page.locator('#patient-message').fill('Test question')
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
  await page.getByRole('button', { name: 'Dừng', exact: true }).waitFor()
  await page.locator('.patient-messages').evaluate(el => { el.scrollTop = 0 })
  await page.getByRole('button', { name: 'Tin nhắn mới nhất' }).waitFor()
  const events = [
    { type: 'start', messageId: 'reply' },
    { type: 'text-start', id: 'text' },
    { type: 'text-delta', id: 'text', delta: 'Response arrived while reading history.\n'.repeat(20) },
    { type: 'text-end', id: 'text' }, { type: 'finish' },
  ]
  await pending.fulfill({ contentType: 'text/event-stream', headers: { 'x-vercel-ai-ui-message-stream': 'v1' }, body: events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n' })
  await page.getByRole('button', { name: 'Dừng', exact: true }).waitFor({ state: 'hidden' })
  assert(await page.locator('.patient-messages').evaluate(el => el.scrollTop) < 5, 'Response stole history scroll position')
  await page.getByRole('button', { name: 'Tin nhắn mới nhất' }).click()
  await page.waitForFunction(() => {
    const el = document.querySelector('.patient-messages')
    return el.scrollHeight - el.clientHeight - el.scrollTop < 3
  })
  await page.locator('#patient-message').fill('Keep failed draft')
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
  await page.getByRole('button', { name: 'Dừng', exact: true }).waitFor()
  await pending.fulfill({ status: 503, json: { message: 'Offline fixture' } })
  await page.getByRole('alert').waitFor()
  assert(await page.locator('#patient-message').inputValue() === 'Keep failed draft', 'Network error lost draft')
  await page.getByRole('button', { name: 'Gửi tin nhắn', exact: true }).click()
  await page.getByRole('button', { name: 'Dừng', exact: true }).click()
  await page.getByText('Đã dừng phản hồi.').waitFor()
  await pending.fulfill({ status: 503, json: { message: 'Stopped fixture' } }).catch(() => {})
  results.push({ streamingScroll: true, retryDraft: true, stop: true })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:5174/patient')
  await page.locator('#patient-message').waitFor()
  const desktop = await page.locator('.patient-sidebar').boundingBox()
  assert(desktop.x === 0 && desktop.width === 320, 'Desktop sidebar changed')
  assert(await page.locator('.btn-send-message').evaluate(el => el.getBoundingClientRect().width) === 40, 'Desktop send control changed')
  results.push({ desktop: true })
  return results
}
