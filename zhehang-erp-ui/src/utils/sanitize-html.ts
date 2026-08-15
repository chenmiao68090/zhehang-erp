import DOMPurify from 'dompurify'

const HTML_TAGS = [
  'a', 'b', 'blockquote', 'br', 'code', 'col', 'colgroup', 'del', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p',
  'pre', 's', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th',
  'thead', 'tr', 'u', 'ul'
]

const HTML_ATTRIBUTES = [
  'alt', 'class', 'colspan', 'height', 'href', 'rel', 'rowspan', 'src', 'style',
  'target', 'title', 'width'
]

const SVG_TAGS = ['svg', 'circle', 'text']
const SVG_ATTRIBUTES = [
  'cx', 'cy', 'dominant-baseline', 'fill', 'font-size', 'font-weight', 'height',
  'r', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap',
  'stroke-width', 'text-anchor', 'transform', 'viewBox', 'width', 'x', 'y'
]

const SAFE_STYLE_PROPERTIES = new Set([
  'align-items', 'background', 'background-color', 'border', 'border-left',
  'border-radius', 'color', 'display', 'flex', 'flex-wrap', 'font-size',
  'font-weight', 'gap', 'line-height', 'margin', 'margin-bottom', 'margin-left',
  'margin-right', 'margin-top', 'min-width', 'padding', 'white-space'
])

const DANGEROUS_STYLE = /(?:url\s*\(|expression\s*\(|@import|javascript\s*:|data\s*:|behavior\s*:|-moz-binding)/i
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i

let hooksInstalled = false

function installHooks() {
  if (hooksInstalled) return
  hooksInstalled = true

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    const name = data.attrName.toLowerCase()
    if (name.startsWith('on')) {
      data.keepAttr = false
      return
    }
    if (name === 'href' || name === 'src') {
      const value = data.attrValue.replace(/[\u0000-\u001f\u007f\s]+/g, '').trim()
      if (!SAFE_URL.test(value)) data.keepAttr = false
      return
    }
    if (name === 'style') {
      const declarations = data.attrValue.split(';').map((entry) => entry.trim()).filter(Boolean)
      const safe = declarations.filter((entry) => {
        const separator = entry.indexOf(':')
        if (separator <= 0 || DANGEROUS_STYLE.test(entry)) return false
        return SAFE_STYLE_PROPERTIES.has(entry.slice(0, separator).trim().toLowerCase())
      })
      data.attrValue = safe.join(';')
      if (!data.attrValue) data.keepAttr = false
    }
  })

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node instanceof HTMLAnchorElement && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

export function sanitizeHtml(value: unknown): string {
  installHooks()
  return DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS: HTML_TAGS,
    ALLOWED_ATTR: HTML_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    FORBID_TAGS: ['base', 'embed', 'form', 'iframe', 'input', 'link', 'math', 'meta', 'object', 'script', 'style', 'template'],
    FORBID_ATTR: ['srcdoc']
  })
}

export function sanitizeSvg(value: unknown): string {
  installHooks()
  return DOMPurify.sanitize(String(value ?? ''), {
    USE_PROFILES: { svg: true, svgFilters: false },
    ALLOWED_TAGS: SVG_TAGS,
    ALLOWED_ATTR: SVG_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    FORBID_TAGS: ['animate', 'foreignObject', 'script', 'style', 'use']
  })
}
