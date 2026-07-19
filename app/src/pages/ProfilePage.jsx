import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import TrustBadge from '../components/ui/TrustBadge'
import { getVisibleTrustBadges, ensureDemoTrustData } from '../utils/trustBadges'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../supabase/client'
import { getCurrentUserId, USERS } from '../utils/auth'

const CURRENT_USER_ID = getCurrentUserId()
const currentUser = USERS.find(u => u.id === CURRENT_USER_ID) || USERS[0]

const MENU_ITEMS = [
  { icon: '📦', label: '我的发布', sub: '查看你发布的所有帖子' },
  { icon: '⚙️', label: '设置',    sub: '账号、通知、隐私' },
  { icon: '❓', label: '帮助中心', sub: '常见问题和使用指南' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadDemands() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          trades:trades!trades_post_id_fkey(
            *,
            carrier:users!trades_carrier_id_fkey(*)
          )
        `)
        .eq('user_id', CURRENT_USER_ID)
        .eq('type', 'seek')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDemands(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    ensureDemoTrustData()
    loadDemands()
  }, [])

  const trustBadges = getVisibleTrustBadges('zhangming')

  // Derive simple avatar URL
  const avatarUrl = currentUser.id === '11111111-1111-1111-1111-111111111111' 
    ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'

  return (
    <div className="flex flex-col h-full bg-surface">
      <h1 className="page-title px-5 pt-5 mb-5">我的</h1>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <img
              src={avatarUrl}
              alt={currentUser.name} className="w-[80px] h-[80px] rounded-full object-cover"
            />
            <div>
              <div className="text-[22px] font-bold text-ink">{currentUser.name.split(' ')[0]}</div>
              <div className="text-[14px] text-secondary mt-0.5">3 次帮带完成</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[['3', '完成帮带'], ['100%', '好评率'], ['2024', '加入年份']].map(([val, label]) => (
              <div key={label} className="bg-surface rounded-md p-3 text-center border border-border">
                <div className="text-[20px] font-bold text-ink">{val}</div>
                <div className="text-[11px] text-muted mt-0.5 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          {trustBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trustBadges.map(b => <TrustBadge key={b.id} icon={b.icon} label={b.label} />)}
            </div>
          )}
        </div>

        {/* My Requests (Seek Posts) */}
        <div className="px-5 mb-6">
          <div className="section-label mb-3">我的需求单</div>
          {loading ? (
             <div className="text-muted text-[13px] py-4">加载中...</div>
          ) : demands.length === 0 ? (
             <div className="text-secondary text-[13px] py-4 bg-white rounded-lg text-center shadow-sm">暂无需求单</div>
          ) : (
             <div className="space-y-3">
               {demands.map(demand => {
                 const activeTrade = (demand.trades || []).find(t => t.status === 'confirmed' || t.status === 'pending' || t.status === 'completed')
                 const carrierName = activeTrade?.carrier?.name
                 const statusText = activeTrade ? (activeTrade.status === 'completed' ? '已完成' : activeTrade.status === 'pending' ? '等待确认' : '已接单') : '寻找中'
                 
                 return (
                   <div key={demand.id}
                     className="bg-white rounded-lg p-4 shadow-card flex flex-col cursor-pointer border-l-[3px] border-l-brand"
                     onClick={() => navigate(activeTrade ? `/luggage/item/${activeTrade.id}` : `/post/${demand.id}`)}
                   >
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[15px] font-semibold text-ink">{demand.item_name} ({demand.weight}kg)</span>
                       <span className={`text-[11px] px-2 py-0.5 rounded-[6px] font-semibold ${activeTrade ? 'bg-brand-light text-brand' : 'bg-surface text-secondary'}`}>
                         {carrierName ? `🧳 ${carrierName} ${statusText}` : '大厅公开中'}
                       </span>
                     </div>
                     <div className="text-[13px] text-secondary">{demand.departure} → {demand.arrival}</div>
                   </div>
                 )
               })}
             </div>
          )}
        </div>

        {/* Menu */}
        <div className="px-5 mb-8">
          <div className="section-label mb-3">我的账户</div>
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            {MENU_ITEMS.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-surface transition-colors ${i < MENU_ITEMS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-9 h-9 bg-surface rounded-md flex items-center justify-center text-[18px] flex-shrink-0 border border-border">{item.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px] text-ink">{item.label}</div>
                  <div className="text-[12px] text-muted mt-0.5">{item.sub}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}
