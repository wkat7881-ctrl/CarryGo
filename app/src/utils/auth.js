export const USERS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Linda (旅行者/默认)' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Tom (发货人1)' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Alice (发货人2)' }
]

export function getCurrentUserId() {
  return localStorage.getItem('TEST_USER_ID') || USERS[0].id
}

export function setCurrentUserId(id) {
  localStorage.setItem('TEST_USER_ID', id)
  window.location.href = '/' // Force reload to home
}
