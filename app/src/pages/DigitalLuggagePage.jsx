import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import CapacityBar from '../components/ui/CapacityBar'
import StatusTag from '../components/ui/StatusTag'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../supabase/client'
import { createPost, togglePostActive } from '../services/posts'
import { updateTradeStatus } from '../services/orders'
import { sendMessage, getOrCreateConversation } from '../services/messages'
import { X, Plus, ChevronDown } from 'lucide-react'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

// --- Create Private Suitcase Modal ---
function CreateSuitcaseModal({ onClose, onSuccess }) {
  const [departure, setDeparture] = useState('巴黎')
  const [arrival, setArrival] = useState('上海')
  const [weight, setWeight] = useState(15)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await createPost({
        user_id: CURRENT_USER_ID,
        type: 'provide',
        departure,
        arrival,
        weight,
        is_active: false, // Private by default
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="font-bold text-[16px] text-ink">🆕 创建私人行李箱</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface"><X className="w-5 h-5 text-secondary" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">出发地</label>
            <input className="input w-full" value={departure} onChange={e => setDeparture(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">目的地</label>
            <input className="input w-full" value={arrival} onChange={e => setArrival(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">总容量 (kg)</label>
            <input type="number" className="input w-full" value={weight} onChange={e => setWeight(Number(e.target.value))} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? '创建中...' : '确认创建'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DigitalLuggagePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [tab, setTab] = useState('current')
  const [suitcases, setSuitcases] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showCreateModal, setShowCreateModal] = useState(false)

  async function loadSuitcases() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          trades:trades!trades_carrier_post_id_fkey(
            *,
            shipper:users!trades_shipper_id_fkey(*)
          )
        `)
        .eq('user_id', CURRENT_USER_ID)
        .eq('type', 'provide')
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const active = []
      const past = []

      for (const p of data) {
        if (new Date(p.date) > now) active.push(p)
        else past.push(p)
      }

      setSuitcases(active)
      setHistory(past)
    } catch (err) {
      console.error('Error loading suitcases:', err)
      showToast('加载行李箱失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuitcases()
  }, [])

  async function handleToggleActive(postId, currentActive) {
    try {
      await togglePostActive(postId, !currentActive)
      showToast(!currentActive ? '已上架至大厅' : '已下架，转为私人', 'success')
      loadSuitcases()
    } catch (err) {
      showToast('状态更新失败', 'error')
    }
  }

  async function handleDeleteItem(trade) {
    if (!window.confirm(`确定要移除 ${trade.item_name} 吗？这会拒绝或取消该笔帮带。`)) return
    try {
      await updateTradeStatus(trade.id, 'cancelled')
      
      // Try to find conversation to send system message
      const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)
      if (conv) {
        await sendMessage(conv.id, CURRENT_USER_ID, '❌ 旅行者已将你的物品从行李箱移除/取消。', 'system')
      }
      showToast('物品已移除', 'success')
      loadSuitcases()
    } catch (err) {
      showToast('移除失败', 'error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="text-brand font-bold text-[17px]">CarryGo</div>
      </div>
      <h1 className="page-title px-5 pb-4">我的行李箱</h1>

      <div className="flex gap-2 px-5 pb-4">
        {['current','history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${tab === t ? 'bg-brand text-white' : 'bg-surface text-secondary border border-border'}`}>
            {t === 'current' ? '当前' : '历史'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-20 text-muted text-[14px]">加载中...</div>
        ) : tab === 'current' ? (
          <div className="px-5 space-y-5">
            {suitcases.length === 0 ? (
              <div className="bg-white rounded-xl shadow-card p-8 text-center border border-dashed border-border">
                <div className="text-[48px] mb-4">🧳</div>
                <div className="text-[16px] font-bold text-ink mb-2">还没有可用的行李箱</div>
                <div className="text-[13px] text-secondary mb-6 leading-relaxed">
                  你可以发布一个去大厅的提供帮带，或者建立一个不公开的私人行李箱来管理你想帮带的物品。
                </div>
                <button onClick={() => navigate('/publish')} className="btn-primary w-full mb-3">发布提供帮带 (公开)</button>
                <button onClick={() => setShowCreateModal(true)} className="btn-outline w-full bg-white">🆕 创建私人行李箱</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-brand/50 text-brand font-medium text-[14px] bg-brand-light/30 hover:bg-brand-light transition-colors">
                  <Plus className="w-4 h-4" /> 新建额外的私人行李箱
                </button>
                
                {suitcases.map(suitcase => {
                  const activeTrades = suitcase.trades.filter(t => t.status === 'confirmed' || t.status === 'pending' || t.status === 'completed')
                  const used = activeTrades.reduce((s, t) => s + t.item_weight, 0)
                  
                  return (
                    <div key={suitcase.id} className="bg-white rounded-lg shadow-card p-5 relative">
                      <div className="absolute top-5 right-5">
                        <button onClick={() => handleToggleActive(suitcase.id, suitcase.is_active)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border ${suitcase.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-surface text-secondary border-border'}`}>
                          {suitcase.is_active ? '大厅公开中' : '私人隐藏'}
                        </button>
                      </div>

                      <div className="text-[20px] font-bold text-ink mb-1">{suitcase.departure} → {suitcase.arrival}</div>
                      <div className="text-[13px] text-muted mb-5">发布时间：{new Date(suitcase.created_at).toLocaleDateString()}</div>
                      
                      <CapacityBar used={used} total={suitcase.weight} />

                      {activeTrades.length > 0 && <div className="section-label mt-6 mb-3">已绑定物品</div>}
                      
                      <div className="space-y-3">
                        {activeTrades.map(trade => (
                          <div
                            key={trade.id}
                            className={`bg-white rounded-lg p-4 shadow-card flex items-center gap-3 cursor-pointer border-l-[3px] ${trade.status === 'pending' ? 'border-l-amber-400' : 'border-l-brand'}`}
                            onClick={() => navigate(`/luggage/item/${trade.id}`)}
                          >
                            <div className="w-10 h-10 bg-brand-light rounded-md flex items-center justify-center text-[20px] flex-shrink-0">📦</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[15px] text-ink truncate">{trade.item_name}</div>
                              <div className="flex gap-2 mt-0.5 text-[13px] text-secondary">
                                <span>{trade.item_weight}kg</span><span>·</span><span>{trade.shipper?.name}</span>
                              </div>
                            </div>
                            <StatusTag status={trade.status} />
                            <div className="flex items-center gap-2 ml-1">
                              <button onClick={async e => { 
                                e.stopPropagation()
                                const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)
                                navigate(suitcase.type === 'provide' ? `/chat/${conv.id}` : `/chat/proposal/${conv.id}`) 
                              }}
                                className="w-8 h-8 rounded-full bg-surface text-[14px] flex items-center justify-center hover:bg-border transition-colors">💬</button>
                              <button onClick={e => { e.stopPropagation(); handleDeleteItem(trade) }}
                                className="w-8 h-8 rounded-full bg-red-50 text-red-500 text-[14px] font-bold flex items-center justify-center hover:bg-red-100 transition-colors">删</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        ) : (
          <div className="px-5 space-y-3">
            {history.length > 0 ? history.map(h => {
              const activeTrades = h.trades.filter(t => t.status === 'confirmed' || t.status === 'completed')
              const used = activeTrades.reduce((s, t) => s + t.item_weight, 0)
              return (
                <div key={h.id} className="bg-white rounded-lg p-5 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[15px] text-ink">{h.departure} → {h.arrival}</span>
                    <span className="text-[11px] text-muted bg-surface px-2 py-0.5 rounded-[6px]">已过期</span>
                  </div>
                  <div className="text-[13px] text-secondary">{new Date(h.created_at).toLocaleDateString()}</div>
                  <div className="flex gap-4 mt-3 text-[13px] text-muted">
                    <span>🧳 {used}kg / {h.weight}kg</span>
                    <span>📦 {activeTrades.length}个包裹</span>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-10 text-muted">
                <div className="text-[40px] mb-3">📦</div>
                <div className="text-[15px] font-medium">暂无历史记录</div>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomTabBar />

      {showCreateModal && (
        <CreateSuitcaseModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            showToast('私人行李箱创建成功！', 'success')
            loadSuitcases()
          }}
        />
      )}
    </div>
  )
}
