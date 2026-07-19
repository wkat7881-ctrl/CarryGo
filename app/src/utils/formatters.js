/**
 * Format weight number: 3 → "3kg", 2.5 → "2.5kg"
 */
export function formatWeight(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0kg'
  return Number.isInteger(n) ? `${n}kg` : `${n.toFixed(1)}kg`
}

/**
 * Relative time string (simplified)
 */
export function relativeTime(date) {
  const now = Date.now()
  const ts  = typeof date === 'string' ? Date.parse(date) : Number(date)
  const diff = now - ts

  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)

  if (minutes < 1)  return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24)   return `${hours}小时前`
  if (days === 1)   return '昨天'
  return `${days}天前`
}

/**
 * Format price: 50 → "¥50/kg"
 */
export function formatPrice(yuan) {
  return `¥${yuan}/kg`
}
