// CarryGo Prototype JavaScript

// Page navigation
let currentPage = 'home';

// Show a specific page
function showPage(pageId) {
  currentPage = pageId;
  
  // Update tab active state
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.page === pageId) {
      tab.classList.add('active');
    }
  });
  
  // Update iframe src if in hub view
  const iframe = document.getElementById('page-iframe');
  if (iframe) {
    iframe.src = `${pageId}.html`;
  }
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Show toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast toast-${type} active`;
    
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2500);
  }
}

const CG_TRUST_KEY = 'carrygo_trust_v1';
const CG_TRUST_BADGES = [
  { id: 'reliable', icon: '✔', label: 'Reliable' },
  { id: 'on_time', icon: '⏰', label: 'On Time' },
  { id: 'easy_communication', icon: '💬', label: 'Easy Communication' },
  { id: 'fast_response', icon: '⚡', label: 'Fast Response' },
  { id: 'careful_handling', icon: '📦', label: 'Careful Handling' },
  { id: 'friendly', icon: '😊', label: 'Friendly' },
];

function cgLoadTrust() {
  try {
    const raw = localStorage.getItem(CG_TRUST_KEY);
    if (!raw) return { users: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { users: {} };
    if (!parsed.users || typeof parsed.users !== 'object') return { users: {} };
    return parsed;
  } catch (error) {
    return { users: {} };
  }
}

function cgSaveTrust(data) {
  localStorage.setItem(CG_TRUST_KEY, JSON.stringify(data));
}

function cgEnsureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { completedTrades: {}, receivedBadges: {}, reviews: {} };
  }
  if (!data.users[userId].completedTrades) data.users[userId].completedTrades = {};
  if (!data.users[userId].receivedBadges) data.users[userId].receivedBadges = {};
  if (!data.users[userId].reviews) data.users[userId].reviews = {};
  return data.users[userId];
}

function cgRecordCompletedTrade(data, userId, tradeId, counterpartyId) {
  const user = cgEnsureUser(data, userId);
  user.completedTrades[tradeId] = { counterpartyId, timestamp: Date.now() };
}

function cgAddReceivedBadge(data, toUserId, fromUserId, badgeId) {
  const user = cgEnsureUser(data, toUserId);
  if (!user.receivedBadges[badgeId]) user.receivedBadges[badgeId] = {};
  user.receivedBadges[badgeId][fromUserId] = true;
}

function cgRecordReview({ tradeId, fromUserId, toUserId, badges }) {
  const normalizedBadges = Array.isArray(badges) ? badges : [];
  const data = cgLoadTrust();
  const toUser = cgEnsureUser(data, toUserId);

  if (!toUser.reviews[tradeId]) toUser.reviews[tradeId] = {};
  if (toUser.reviews[tradeId][fromUserId]) {
    return { ok: false, reason: 'already_reviewed' };
  }

  toUser.reviews[tradeId][fromUserId] = {
    badges: normalizedBadges.slice(0, 3),
    timestamp: Date.now(),
  };

  cgRecordCompletedTrade(data, toUserId, tradeId, fromUserId);
  cgRecordCompletedTrade(data, fromUserId, tradeId, toUserId);

  normalizedBadges.slice(0, 3).forEach((badgeId) => {
    cgAddReceivedBadge(data, toUserId, fromUserId, badgeId);
  });

  cgSaveTrust(data);
  return { ok: true };
}

function cgGetCompletedTradeCount(userId) {
  const data = cgLoadTrust();
  const user = data.users[userId];
  if (!user || !user.completedTrades) return 0;
  return Object.keys(user.completedTrades).length;
}

function cgGetVisibleTrustBadges(userId) {
  const completed = cgGetCompletedTradeCount(userId);
  if (completed < 3) return [];

  const data = cgLoadTrust();
  const user = data.users[userId];
  if (!user || !user.receivedBadges) return [];

  return CG_TRUST_BADGES.filter((badge) => {
    const voters = user.receivedBadges[badge.id];
    if (!voters || typeof voters !== 'object') return false;
    return Object.keys(voters).length >= 3;
  });
}

function cgGetBadgeCatalog() {
  return CG_TRUST_BADGES.slice();
}

function cgEnsureDemoTrustData() {
  if (localStorage.getItem(CG_TRUST_KEY)) return;
  const data = { users: {} };
  cgRecordReview({
    tradeId: 'demo_trade_1',
    fromUserId: 'linda',
    toUserId: 'zhangming',
    badges: ['reliable', 'on_time', 'careful_handling'],
  });
  cgRecordReview({
    tradeId: 'demo_trade_2',
    fromUserId: 'lihua',
    toUserId: 'zhangming',
    badges: ['reliable', 'easy_communication', 'on_time'],
  });
  cgRecordReview({
    tradeId: 'demo_trade_3',
    fromUserId: 'wangfang',
    toUserId: 'zhangming',
    badges: ['reliable', 'fast_response', 'on_time'],
  });
}

window.cgRecordReview = cgRecordReview;
window.cgGetCompletedTradeCount = cgGetCompletedTradeCount;
window.cgGetVisibleTrustBadges = cgGetVisibleTrustBadges;
window.cgGetBadgeCatalog = cgGetBadgeCatalog;

// Update progress bar
function updateProgress(percentage) {
  const progressBar = document.getElementById('luggage-progress');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
  const remainingText = document.getElementById('remaining-weight');
  if (remainingText && percentage <= 70) {
    remainingText.textContent = `${Math.round((100 - percentage) / 10)}kg remaining`;
  }
}

// Confirm carry request
function confirmCarry() {
  showToast('帮带已确认！');
  updateProgress(70);
  closeModal('apply-modal');
}

// Publish post
function publishPost() {
  showToast('发布成功！');
  setTimeout(() => {
    window.location.href = 'digital-luggage.html';
  }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  cgEnsureDemoTrustData();
  // Tab navigation
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const page = tab.dataset.page;
      if (page && page !== window.location.pathname.split('/').pop().replace('.html', '')) {
        window.location.href = `${page}.html`;
      }
    });
  });
  
  // Modal triggers
  const applyBtn = document.getElementById('apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => openModal('apply-modal'));
  }
  
  const contactBtn = document.getElementById('contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      window.location.href = 'chat-detail.html';
    });
  }
  
  // Modal close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
  
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
});
