import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(uiRoot, '..')
const failures = []

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  }))
  return nested.flat()
}

for (const file of await walk(join(uiRoot, 'src'))) {
  if (extname(file) !== '.vue') continue
  const source = await readFile(file, 'utf8')
  const directives = [...source.matchAll(/v-html\s*=\s*["']([^"']+)["']/g)]
  for (const directive of directives) {
    if (!/^sanitize(?:Html|Svg)\s*\(/.test(directive[1].trim())) {
      failures.push(`${relative(repoRoot, file)} 存在未经过统一 DOMPurify 入口的 v-html: ${directive[1]}`)
    }
  }
  if (directives.length && !source.includes("@/utils/sanitize-html")) {
    failures.push(`${relative(repoRoot, file)} 使用 v-html 但未引入统一清洗器`)
  }
}

const nginx = await readFile(join(uiRoot, 'nginx.conf'), 'utf8')
if (!/listen\s+80\s+default_server;[\s\S]{0,200}?return\s+444;/.test(nginx)) {
  failures.push('生产 Nginx 未拒绝默认/IP 主机访问')
}
if (!/listen\s+443\s+ssl\s+default_server;[\s\S]{0,500}?return\s+444;/.test(nginx)) {
  failures.push('生产 Nginx 未拒绝 HTTPS 默认/IP 主机访问')
}
for (const route of ['/local-preview/', '/api/v3/api-docs']) {
  if (!nginx.includes(route)) failures.push(`生产 Nginx 未显式封锁 ${route}`)
}
const csp = nginx.match(/default\s+"([^"]*script-src[^";]*(?:;[^";]*)*)";/)?.[1] || ''
if (!csp || /script-src[^;]*(?:'unsafe-inline'|'unsafe-eval'|\*)/.test(csp)) {
  failures.push('生产 CSP 的 script-src 缺失或包含高风险例外')
}
if (/connect-src[^;]*\b(?:ws|wss|http|https):(?=\s|;)/.test(csp)) {
  failures.push('生产 CSP 的 connect-src 包含未限定主机的协议级放行')
}
if (!csp.includes("object-src 'none'") || !csp.includes("frame-ancestors 'none'")) {
  failures.push('生产 CSP 未关闭对象嵌入或页面框架加载')
}
for (const header of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options']) {
  if (!nginx.includes(header)) failures.push(`生产 Nginx 缺少 ${header}`)
}

const prodConfigPath = join(repoRoot, 'zhehang-erp-server/zhehang-erp-admin/src/main/resources/application-prod.yml')
const wsConfigPath = join(repoRoot, 'zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/im/realtime/ImWebSocketConfig.java')
const uiOnlyImageBuild = process.env.ZHEHANG_UI_ONLY_BUILD === '1'
let hasBackendSources = true
try {
  await Promise.all([access(prodConfigPath), access(wsConfigPath)])
} catch {
  hasBackendSources = false
}

if (!hasBackendSources && !uiOnlyImageBuild) {
  failures.push('缺少后端生产配置，拒绝跳过 CORS 与 WebSocket 安全校验')
}

if (hasBackendSources) {
  const prodConfig = await readFile(prodConfigPath, 'utf8')
  const prodCors = prodConfig.match(/allowed-origins:\s*([^\n]+)/)?.[1] || ''
  if (!prodCors || /localhost|127\.0\.0\.1|\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(prodCors)) {
    failures.push('生产 CORS 仍包含本机或 IP 来源')
  }

  const wsConfig = await readFile(wsConfigPath, 'utf8')
  if (/localhost|127\.0\.0\.1|47\.243\.27\.11/.test(wsConfig)) {
    failures.push('WebSocket 配置仍硬编码本机或生产 IP 来源')
  }
}

const auth = await readFile(join(uiRoot, 'src/utils/auth.ts'), 'utf8')
if (/(?:localStorage|sessionStorage)\.setItem\([^\n]*(?:token|refresh)/i.test(auth)) {
  failures.push('认证令牌仍写入 Web Storage')
}

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'))
  process.exit(1)
}

console.log(`前端与生产安全边界校验通过（${hasBackendSources ? '完整仓库' : 'UI 独立镜像'}）`)
