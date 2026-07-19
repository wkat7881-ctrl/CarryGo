// Trust badge catalog — matches prototype app.js
export const TRUST_BADGES = [
  { id: 'reliable',           icon: '✔',  label: 'Reliable' },
  { id: 'on_time',            icon: '⏰', label: 'On Time' },
  { id: 'easy_communication', icon: '💬', label: 'Easy Communication' },
  { id: 'fast_response',      icon: '⚡', label: 'Fast Response' },
  { id: 'careful_handling',   icon: '📦', label: 'Careful Handling' },
  { id: 'friendly',           icon: '😊', label: 'Friendly' },
]

const STORAGE_KEY = 'carrygo_trust_v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { users: {} }
    const parsed = JSON.parse(raw)
    return parsed?.users ? parsed : { users: {} }
  } catch {
    return { users: {} }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function ensureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { completedTrades: {}, receivedBadges: {}, reviews: {} }
  }
  const u = data.users[userId]
  if (!u.completedTrades) u.completedTrades = {}
  if (!u.receivedBadges)  u.receivedBadges  = {}
  if (!u.reviews)         u.reviews         = {}
  return u
}

export function recordReview({ tradeId, fromUserId, toUserId, badges }) {
  const normalizedBadges = Array.isArray(badges) ? badges : []
  const data = load()
  const toUser = ensureUser(data, toUserId)

  if (!toUser.reviews[tradeId]) toUser.reviews[tradeId] = {}
  if (toUser.reviews[tradeId][fromUserId]) {
    return { ok: false, reason: 'already_reviewed' }
  }

  toUser.reviews[tradeId][fromUserId] = {
    badges: normalizedBadges.slice(0, 3),
    timestamp: Date.now(),
  }

  ensureUser(data, toUserId).completedTrades[tradeId] = { counterpartyId: fromUserId, timestamp: Date.now() }
  ensureUser(data, fromUserId).completedTrades[tradeId] = { counterpartyId: toUserId, timestamp: Date.now() }

  normalizedBadges.slice(0, 3).forEach((badgeId) => {
    if (!toUser.receivedBadges[badgeId]) toUser.receivedBadges[badgeId] = {}
    toUser.receivedBadges[badgeId][fromUserId] = true
  })

  save(data)
  return { ok: true }
}

export function getCompletedTradeCount(userId) {
  const data = load()
  const user = data.users[userId]
  if (!user?.completedTrades) return 0
  return Object.keys(user.completedTrades).length
}

export function getVisibleTrustBadges(userId) {
  const completed = getCompletedTradeCount(userId)
  if (completed < 3) return []
  const data = load()
  const user = data.users[userId]
  if (!user?.receivedBadges) return []
  return TRUST_BADGES.filter((badge) => {
    const voters = user.receivedBadges[badge.id]
    return voters && typeof voters === 'object' && Object.keys(voters).length >= 3
  })
}

export function ensureDemoTrustData() {
  if (localStorage.getItem(STORAGE_KEY)) return
  recordReview({ tradeId: 'demo_1', fromUserId: 'linda',   toUserId: 'zhangming', badges: ['reliable', 'on_time', 'careful_handling'] })
  recordReview({ tradeId: 'demo_2', fromUserId: 'lihua',   toUserId: 'zhangming', badges: ['reliable', 'easy_communication', 'on_time'] })
  recordReview({ tradeId: 'demo_3', fromUserId: 'wangfang', toUserId: 'zhangming', badges: ['reliable', 'fast_response', 'on_time'] })
}
