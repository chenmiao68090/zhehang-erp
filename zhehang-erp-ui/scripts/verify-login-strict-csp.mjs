import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const targetUrl = process.argv[2] || 'http://127.0.0.1:4173/login'
const profile = join(tmpdir(), `zhehang-login-csp-${Date.now()}-${process.pid}`)
const port = 9300 + Math.floor(Math.random() * 300)
mkdirSync(profile, { recursive: true })

const child = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-background-networking',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] })

let stderr = ''
child.stderr.on('data', (chunk) => { stderr += String(chunk) })

function stopChrome() {
  if (!child.killed) child.kill('SIGTERM')
}
process.on('exit', stopChrome)
process.on('SIGINT', () => { stopChrome(); process.exit(130) })

async function waitForPage() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      if (response.ok) {
        const pages = await response.json()
        const page = pages.find((candidate) => candidate.type === 'page')
        if (page) return page
      }
    } catch {
      // Chrome DevTools is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Chrome DevTools did not start: ${stderr.slice(-500)}`)
}

function openCdp(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl)
  let sequence = 0
  const pending = new Map()
  const events = []
  const eventHandlers = []

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message)
      pending.delete(message.id)
    } else if (message.method) {
      events.push(message)
      eventHandlers.forEach((handler) => handler(message))
    }
  }

  const ready = new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++sequence
    pending.set(id, resolve)
    socket.send(JSON.stringify({ id, method, params }))
  })
  const onEvent = (handler) => eventHandlers.push(handler)
  return { socket, ready, send, events, onEvent }
}

try {
  const page = await waitForPage()
  const cdp = openCdp(page.webSocketDebuggerUrl)
  await cdp.ready
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  await cdp.send('Network.enable')
  await cdp.send('Page.navigate', { url: targetUrl })
  await new Promise((resolve) => setTimeout(resolve, 4000))

  const evaluation = await cdp.send('Runtime.evaluate', {
    expression: `JSON.stringify({
      path: location.pathname,
      inputs: document.querySelectorAll('input').length,
      loginButtons: [...document.querySelectorAll('button')].filter((button) => button.textContent.includes('登')).length,
      systemErrors: [...document.querySelectorAll('.el-notification__title')].filter((element) => element.textContent.includes('系统异常')).length
    })`,
    returnByValue: true
  })
  const state = JSON.parse(evaluation.result.result.value)
  const interceptedLoginRequests = []
  cdp.onEvent((event) => {
    if (event.method !== 'Fetch.requestPaused') return
    interceptedLoginRequests.push({
      url: event.params.request.url,
      method: event.params.request.method
    })
    void cdp.send('Fetch.failRequest', {
      requestId: event.params.requestId,
      errorReason: 'Aborted'
    })
  })
  await cdp.send('Fetch.enable', {
    patterns: [{ urlPattern: '*auth/login*', requestStage: 'Request' }]
  })
  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const inputs = [...document.querySelectorAll('input')]
      const username = inputs.find((input) => input.type === 'text')
      const password = inputs.find((input) => input.type === 'password')
      const loginButton = [...document.querySelectorAll('button')]
        .find((button) => button.textContent.includes('登'))
      const setValue = (input, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
        setter.call(input, value)
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (!username || !password || !loginButton) return false
      setValue(username, 'V217_ROUTE_PROBE')
      setValue(password, 'RouteProbeOnly_2026!')
      loginButton.click()
      return true
    })()`,
    returnByValue: true
  })
  await new Promise((resolve) => setTimeout(resolve, 1200))
  await cdp.send('Fetch.disable')
  const loginRequestPaths = interceptedLoginRequests.map((request) => {
    const url = new URL(request.url)
    return { method: request.method, path: url.pathname }
  })
  const cspEvalEvents = cdp.events.filter((event) => (
    /unsafe-eval|Evaluating a string as JavaScript|EvalError/i.test(JSON.stringify(event))
  )).length
  const csp = (await fetch(targetUrl, { method: 'HEAD' })).headers.get('content-security-policy') || ''
  const scriptDirective = csp.split(';').find((part) => part.trim().startsWith('script-src')) || ''
  const result = { state, cspEvalEvents, scriptDirective: scriptDirective.trim(), loginRequestPaths }
  writeFileSync(join(profile, 'result.json'), JSON.stringify(result, null, 2))
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  cdp.socket.close()

  if (state.path !== '/login'
    || state.inputs < 2
    || state.loginButtons < 1
    || state.systemErrors !== 0
    || cspEvalEvents !== 0
    || loginRequestPaths.length !== 1
    || loginRequestPaths[0].method !== 'POST'
    || loginRequestPaths[0].path !== '/api/auth/login'
    || !scriptDirective.includes("script-src 'self'")
    || scriptDirective.includes('unsafe-eval')
    || scriptDirective.includes('unsafe-inline')) {
    process.exitCode = 1
  }
} finally {
  stopChrome()
}
