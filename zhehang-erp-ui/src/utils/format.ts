/**
 * Common formatting utilities (locale-independent)
 * For locale-aware formatting, use src/utils/i18n-helpers.ts
 */

/**
 * Format currency with custom symbol
 * @param amount - Numeric amount
 * @param symbol - Currency symbol (default: ¥)
 * @param decimals - Decimal places (default: 2)
 */
export function formatCurrency(amount: number | string, symbol = '¥', decimals = 2): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${symbol}0.00`
  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${symbol}${parts.join('.')}`
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number | string, decimals = 0): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  const fixed = n.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * Format percentage
 * @param value - Decimal value (0.85 = 85%)
 */
export function formatPercent(value: number | string, decimals = 1): string {
  const n = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(n)) return '0%'
  return `${(n * 100).toFixed(decimals)}%`
}

/**
 * Format file size to human-readable
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(2)
  return `${size} ${units[i]}`
}

/**
 * Mask phone number (e.g., 138****8888)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * Mask ID card number (keeps first 4 and last 4 digits)
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard || ''
  if (idCard.length === 18) {
    return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  }
  if (idCard.length === 15) {
    return idCard.replace(/(\d{4})\d{7}(\d{4})/, '$1*******$2')
  }
  return idCard.substring(0, 4) + '****' + idCard.substring(idCard.length - 4)
}

/**
 * Mask email (e.g., abc***@example.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || ''
  const [local, domain] = email.split('@')
  if (local.length <= 3) return `${local[0]}***@${domain}`
  return `${local.substring(0, 3)}***@${domain}`
}

/**
 * Mask bank card number (keeps last 4 digits)
 */
export function maskBankCard(card: string): string {
  if (!card || card.length < 8) return card || ''
  return card.replace(/\d(?=\d{4})/g, '*')
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
