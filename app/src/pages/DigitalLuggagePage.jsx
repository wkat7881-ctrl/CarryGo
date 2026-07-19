import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import CapacityBar from '../components/ui/CapacityBar'
import StatusTag from '../components/ui/StatusTag'
import { useToast } from '../contexts/ToastContext'

const INITIAL_ITEMS = [
  { id: '1', icon: '🍼', name: '爱他美奶粉（3罐）', weight: 3, owner: 'Tom',   status: 'confirmed', added: '2026-07-16T22:10:00' },
  { id: '2', icon: '💻', name: 'MacBook Pro',      weight: 2, owner: 'Alice', status: 'confirmed', added: '2026-07-16T18:20:00' },
  { id: '3', icon: '💄', name: '护肤品套装',        weight: 1, owner: 'Amy',   status: 'confirmed', added: '2026-07-16T09:05:00' },
]

const HISTORY = [
  { id: 'h1', from: '柏林', to: '上海',  date: '2024年5月20日出发', used: 8, total: 10, count: 5 },
  { id: 'h2', from: '巴黎', to: '北京', date: '2024年3月15日出发', used: 12, total: 15, count: 7 },
]

export default function DigitalLuggagePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [tab, setTab] = useState('current')
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [activityMsg, setActivityMsg] = useState('Tom 已确认这单，物品已加入当前行李箱。')

  const TOTAL = 10
  const used  = items.reduce((s, i) => s + i.weight, 0)

  function deleteItem(id) {
    const item = items.find(i => i.id === id)
    setItems(prev => prev.filter(i => i.id !== id))
    setActivityMsg(`你已取消 ${item.owner} 的这单，${item.name} 已从当前行李箱移除。`)
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="text-brand font-bold text-[17px]">CarryGo</div>
      </div>

      {/* Page Title */}
      <h1 className="page-title px-5 pb-4">我的行李箱</h1>

      {/* Tabs */}
      <div className="flex gap-2 px-5 pb-4">
        {['current','history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${tab === t ? 'bg-brand text-white' : 'bg-surface text-secondary border border-border'}`}>
            {t === 'current' ? '当前' : '历史'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {tab === 'current' && (
          <>
            <div className="mx-5 mb-4 px-4 py-3 bg-brand-light text-brand text-[13px] leading-relaxed rounded-lg">
              {activityMsg}
            </div>

            {/* Suitcase section */}
            <div className="bg-white rounded-lg shadow-card mx-5 p-5">
              <div className="text-[20px] font-bold text-ink mb-1">慕尼黑 → 成都</div>
              <div className="text-[13px] text-muted mb-5">2024年8月18日出发</div>
              
              <CapacityBar used={used} total={TOTAL} />

              <div className="section-label mt-6 mb-3">已绑定物品</div>
              
              <div className="space-y-3">
                {items.sort((a,b) => Date.parse(b.added) - Date.parse(a.added)).map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg p-4 shadow-card flex items-center gap-3 cursor-pointer border-l-[3px] ${item.status === 'pending' ? 'border-l-amber-400' : 'border-l-brand'}`}
                    onClick={() => navigate(`/luggage/item/${item.id}`)}
                  >
                    <div className="w-10 h-10 bg-brand-light rounded-md flex items-center justify-center text-[20px] flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[15px] text-ink truncate">{item.name}</div>
                      <div className="flex gap-2 mt-0.5 text-[13px] text-secondary">
                        <span>{item.weight}kg</span><span>·</span><span>{item.owner}</span>
                      </div>
                    </div>
                    <StatusTag status={item.status} />
                    <div className="flex items-center gap-2 ml-1">
                      <button onClick={e => { e.stopPropagation(); navigate('/chat/alice-1') }}
                        className="w-8 h-8 rounded-full bg-surface text-[14px] flex items-center justify-center hover:bg-border transition-colors">💬</button>
                      <button onClick={e => { e.stopPropagation(); deleteItem(item.id) }}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 text-[14px] font-bold flex items-center justify-center hover:bg-red-100 transition-colors">删</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className="px-5 space-y-3">
            {HISTORY.map(h => (
              <div key={h.id} className="bg-white rounded-lg p-5 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[15px] text-ink">{h.from} → {h.to}</span>
                  <span className="text-[11px] text-muted bg-surface px-2 py-0.5 rounded-[6px]">已完成</span>
                </div>
                <div className="text-[13px] text-secondary">{h.date}</div>
                <div className="flex gap-4 mt-3 text-[13px] text-muted">
                  <span>🧳 {h.used}kg / {h.total}kg</span>
                  <span>📦 {h.count}个包裹</span>
                </div>
              </div>
            ))}
            <div className="text-center py-10 text-muted">
              <div className="text-[40px] mb-3">📦</div>
              <div className="text-[15px] font-medium">更多历史记录</div>
              <div className="text-[13px] mt-1">继续使用 CarryGo 积累更多记录</div>
            </div>
          </div>
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}
