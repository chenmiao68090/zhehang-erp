import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { resolveApiBaseUrl, resolveApiUrl } from '../src/api/base-url.ts'

test('source-only production builds default API requests to the same-origin gateway', () => {
  assert.equal(resolveApiBaseUrl(undefined), '/api')
  assert.equal(resolveApiBaseUrl(null), '/api')
  assert.equal(resolveApiBaseUrl(''), '/api')
  assert.equal(resolveApiBaseUrl('   '), '/api')
})

test('configured API base URLs remain supported and trailing slashes are normalized', () => {
  assert.equal(resolveApiBaseUrl('/gateway/'), '/gateway')
  assert.equal(resolveApiBaseUrl(' https://staging.example.test/api/ '), 'https://staging.example.test/api')
})

test('API-relative preview paths are not prefixed twice', () => {
  assert.equal(resolveApiUrl('/api/file/info/inline/1', '/api'), '/api/file/info/inline/1')
  assert.equal(resolveApiUrl('/file/info/inline/1', '/api/'), '/api/file/info/inline/1')
  assert.equal(resolveApiUrl('https://files.example.test/preview/1', '/api'), 'https://files.example.test/preview/1')
})

test('the immutable web image also declares the same-origin API build default', () => {
  const dockerfile = readFileSync(fileURLToPath(new URL('../Dockerfile', import.meta.url)), 'utf8')
  assert.match(dockerfile, /ARG VITE_API_BASE_URL=\/api/)
  assert.match(dockerfile, /ENV VITE_API_BASE_URL=\$\{VITE_API_BASE_URL\}/)
})
