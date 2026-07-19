import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import CapacityBar from '../components/ui/CapacityBar'
import StatusTag from '../components/ui/StatusTag'
import { useToast } from '../contexts/ToastContext'
import { 
  getUserSuitcases, 
  createSuitcase, 
  updateSuitcase, 
  toggleSuitcaseActive, 
  markSuitcaseCompleted 
} from '../services/suitcases'
import { cancelTrade } from '../services/orders'
import { getOrCreateConversation } from '../services/messages'
import { X, Plus, ChevronDown } from 'lucide-react'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

// --- Create Suitcase Modal ---
function CreateSuitcaseModal({ onClose, onSuccess }) {
  const [suitcaseName, setSuitcaseName] = useState('我的行李箱')
  const [departure, setDeparture] = useState('巴黎')
  const [arrival, setArrival] = useState('上海')
  const [date, setDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [weight, setWeight] = useState(15)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await createSuitcase({
        user_id: CURRENT_USER_ID,
        item_name: suitcaseName,
        departure,
        arrival,
        weight,
        is_active: false,
        date
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
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="font-bold text-[16px] text-ink">🆕 新建行李箱</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface"><X className="w-5 h-5 text-secondary" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">行李箱名称</label>
            <input className="input w-full" value={suitcaseName} onChange={e => setSuitcaseName(e.target.value)} placeholder="例如：7月回国行李箱" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">出发地</label>
              <input className="input w-full" value={departure} onChange={e => setDeparture(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">目的地</label>
              <input className="input w-full" value={arrival} onChange={e => setArrival(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-[2]">
              <label className="block text-[13px] font-semibold text-ink mb-1">日期</label>
              <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">容量 (kg)</label>
              <input type="number" className="input w-full" value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary disabled:opacity-50 mt-2">
            {loading ? '保存中...' : '确认创建'}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Edit Suitcase Modal ---
function EditSuitcaseModal({ suitcase, onClose, onSuccess }) {
  const [suitcaseName, setSuitcaseName] = useState(suitcase.item_name || '')
  const [departure, setDeparture] = useState(suitcase.departure || '')
  const [arrival, setArrival] = useState(suitcase.arrival || '')
  const [date, setDate] = useState(suitcase.date || '')
  const [weight, setWeight] = useState(suitcase.weight || 15)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await updateSuitcase(suitcase.id, {
        item_name: suitcaseName,
        departure,
        arrival,
        weight,
        date
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
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="font-bold text-[16px] text-ink">✏️ 编辑行李箱</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface"><X className="w-5 h-5 text-secondary" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1">行李箱名称</label>
            <input className="input w-full" value={suitcaseName} onChange={e => setSuitcaseName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">出发地</label>
              <input className="input w-full" value={departure} onChange={e => setDeparture(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">目的地</label>
              <input className="input w-full" value={arrival} onChange={e => setArrival(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-[2]">
              <label className="block text-[13px] font-semibold text-ink mb-1">日期</label>
              <input type="date" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-ink mb-1">容量 (kg)</label>
              <input type="number" className="input w-full" value={weight} onChange={e => setWeight(Number(e.target.value))} />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary disabled:opacity-50 mt-2">
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuitcaseCard({ suitcase, onEdit, onToggleActive, onDeleteItem, onComplete }) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  
  const activeTrades = suitcase.active_trades || []
  const used = suitcase.used_capacity || 0
  const allCompleted = suitcase.all_completed || false

  return (
    <div className="bg-white rounded-lg shadow-card p-5 relative">
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <button onClick={() => onEdit(suitcase)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border bg-surface text-secondary border-border hover:bg-border transition-colors">
          编辑
        </button>
        <button onClick={() => onToggleActive(suitcase.id, suitcase.is_active)}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm border ${suitcase.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-surface text-secondary border-border'}`}>
          {suitcase.is_active ? '大厅公开中' : '未公开'}
        </button>
      </div>

      <div className="text-[20px] font-bold text-ink mb-1">{suitcase.item_name || `${suitcase.departure} → ${suitcase.arrival}`}</div>
      <div className="flex gap-2 items-center text-[13px] text-muted mb-5">
        <span className="font-medium text-ink bg-surface px-2 py-0.5 rounded-[4px]">{suitcase.departure || '-'} → {suitcase.arrival || '-'}</span>
        <span>{new Date(suitcase.date).toLocaleDateString()}</span>
      </div>
      
      <CapacityBar used={used} total={suitcase.weight} />

      {activeTrades.length > 0 && (
        <div className="flex items-center justify-between mt-6 mb-3">
          <div className="section-label m-0">已绑定物品</div>
          <div className="flex items-center gap-2">
            {allCompleted && (
              <button onClick={() => onComplete(suitcase)} className="text-[12px] font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shadow-sm hover:bg-green-100 transition-colors">
                标记为已完成
              </button>
            )}
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-secondary p-1 bg-surface rounded-full hover:bg-border transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
      
      {isExpanded && activeTrades.length > 0 && (
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
                <button onClick={e => { e.stopPropagation(); onDeleteItem(trade) }}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-500 text-[14px] font-bold flex items-center justify-center hover:bg-red-100 transition-colors">删</button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [editingSuitcase, setEditingSuitcase] = useState(null)

  async function loadSuitcases() {
    try {
      const { current, history } = await getUserSuitcases(CURRENT_USER_ID)
      setSuitcases(current)
      setHistory(history)
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
      await toggleSuitcaseActive(postId, !currentActive)
      showToast(!currentActive ? '已上架至大厅' : '已下架，转为私人', 'success')
      loadSuitcases()
    } catch (err) {
      showToast('状态更新失败', 'error')
    }
  }

  async function handleCompleteSuitcase(suitcase) {
    if (!window.confirm(`确定要将“${suitcase.item_name || suitcase.departure + '→' + suitcase.arrival}”标记为已完成并移至历史记录吗？`)) return
    try {
      await markSuitcaseCompleted(suitcase.id)
      showToast('已移至历史记录', 'success')
      loadSuitcases()
    } catch (err) {
      showToast('操作失败', 'error')
    }
  }

  async function handleDeleteItem(trade) {
    if (!window.confirm(`确定要移除 ${trade.item_name} 吗？这会拒绝或取消该笔帮带。`)) return
    try {
      await cancelTrade(trade.id, CURRENT_USER_ID)
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
                  你可以发布一个去大厅的提供帮带，或者建立一个专用的行李箱来管理你想帮带的物品。
                </div>
                <button onClick={() => navigate('/publish')} className="btn-primary w-full mb-3">发布提供帮带 (公开)</button>
                <button onClick={() => setShowCreateModal(true)} className="btn-outline w-full bg-white">🆕 创建行李箱</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-brand/50 text-brand font-medium text-[14px] bg-brand-light/30 hover:bg-brand-light transition-colors">
                  <Plus className="w-4 h-4" /> 新建额外的行李箱
                </button>
                
                {suitcases.map(suitcase => (
                  <SuitcaseCard 
                    key={suitcase.id}
                    suitcase={suitcase}
                    onEdit={setEditingSuitcase}
                    onToggleActive={handleToggleActive}
                    onDeleteItem={handleDeleteItem}
                    onComplete={handleCompleteSuitcase}
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="px-5 space-y-3">
            {history.length > 0 ? history.map(h => {
              const activeTrades = h.active_trades || []
              const used = h.used_capacity || 0
              return (
                <div key={h.id} className="bg-white rounded-lg p-5 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[15px] text-ink">{h.item_name || `${h.departure} → ${h.arrival}`}</span>
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
            showToast('行李箱创建成功！', 'success')
            loadSuitcases()
          }}
        />
      )}

      {editingSuitcase && (
        <EditSuitcaseModal 
          suitcase={editingSuitcase}
          onClose={() => setEditingSuitcase(null)}
          onSuccess={() => {
            setEditingSuitcase(null)
            showToast('已保存修改', 'success')
            loadSuitcases()
          }}
        />
      )}
    </div>
  )
}
