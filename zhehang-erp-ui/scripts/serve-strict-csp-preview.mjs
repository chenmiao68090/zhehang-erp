import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve } from 'node:path'

const root = resolve(process.argv[2] || 'dist')
const port = Number(process.env.PORT || 4173)
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
}
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:"

createServer((request, response) => {
  const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname
  let file = join(root, pathname === '/' ? 'index.html' : pathname)
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html')

  response.setHeader('Content-Security-Policy', csp)
  response.setHeader('Cache-Control', file.endsWith('index.html') ? 'no-store' : 'public, max-age=604800, immutable')
  response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Strict CSP preview listening on http://127.0.0.1:${port}\n`)
})
