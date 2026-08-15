import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const distPath = new URL('../dist/', import.meta.url).pathname
const forbidden = ['/local-preview/', 'suitePreview=1', 'taskPreview=1', 'zhehangPreview=1']

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? files(path) : [path]
  }))
  return nested.flat()
}

const violations = []
let apiClientBundles = 0
let i18nBundles = 0
for (const file of await files(distPath)) {
  const info = await stat(file)
  if (info.size > 15 * 1024 * 1024 || !/\.(?:html|js|css|json|map)$/i.test(file)) continue
  const body = await readFile(file, 'utf8')
  for (const marker of forbidden) {
    if (body.includes(marker)) violations.push(`${relative(distPath, file)} -> ${marker}`)
  }
  if (/\.js$/i.test(file)
    && body.includes('application/json;charset=UTF-8')
    && body.includes('withCredentials')
    && body.includes('baseURL')) {
    apiClientBundles += 1
    if (!body.includes('/api')) {
      violations.push(`${relative(distPath, file)} -> API client has no same-origin /api fallback`)
    }
    if (body.includes('baseURL:void 0') || body.includes('baseURL:undefined')) {
      violations.push(`${relative(distPath, file)} -> API client compiled with an undefined baseURL`)
    }
  }
  if (/\.js$/i.test(file) && /(?:^|\/)vendor-i18n-[^/]+\.js$/i.test(relative(distPath, file))) {
    i18nBundles += 1
    if (/\bnew\s+Function\s*\(|\beval\s*\(/.test(body)) {
      violations.push(`${relative(distPath, file)} -> CSP-unsafe Vue-i18n runtime compiler`)
    }
    if (body.includes('__INTLIFY_JIT_COMPILATION__') || body.includes('__INTLIFY_DROP_MESSAGE_COMPILER__')) {
      violations.push(`${relative(distPath, file)} -> unresolved Vue-i18n feature flag`)
    }
  }
}

if (apiClientBundles !== 1) {
  violations.push(`expected exactly one compiled API client bundle, found ${apiClientBundles}`)
}
if (i18nBundles !== 1) {
  violations.push(`expected exactly one compiled Vue-i18n bundle, found ${i18nBundles}`)
}

if (violations.length) {
  console.error('Production build contains local-preview markers:')
  violations.forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log('Production preview isolation, API base URL and CSP-safe i18n checks passed')
