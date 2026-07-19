import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import Avatar from '../components/ui/Avatar'
import TrustBadge from '../components/ui/TrustBadge'
import { getVisibleTrustBadges, ensureDemoTrustData } from '../utils/trustBadges'
import { ChevronRight } from 'lucide-react'

const MENU_ITEMS = [
  { icon: '📦', label: '我的发布', sub: '查看你发布的所有帖子' },
  { icon: '⚙️', label: '设置',    sub: '账号、通知、隐私' },
  { icon: '❓', label: '帮助中心', sub: '常见问题和使用指南' },
]

export default function ProfilePage() {
  const navigate = useNavigate()

  useEffect(() => { ensureDemoTrustData() }, [])

  const trustBadges = getVisibleTrustBadges('zhangming')

  return (
    <div className="flex flex-col h-full bg-surface">
      <h1 className="page-title px-5 pt-5 mb-5">我的</h1>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-4 mb-5">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
              alt="张明" className="w-[80px] h-[80px] rounded-full object-cover"
            />
            <div>
              <div className="text-[22px] font-bold text-ink">张明</div>
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

        {/* My Requests */}
        <div className="px-5 mb-6">
          <div className="section-label mb-3">我的需求单</div>
          <div
            className="bg-white rounded-lg p-5 shadow-card flex items-center justify-between cursor-pointer border-l-[3px] border-l-brand"
            onClick={() => navigate('/orders/request/1')}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[15px] font-semibold text-ink">爱他美奶粉（3罐）</span>
                <span className="text-[11px] bg-brand-light text-brand px-2 py-0.5 rounded-[6px] font-semibold">🧳 Linda 已接单</span>
              </div>
              <div className="text-[13px] text-secondary">柏林 → 上海</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
          </div>
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
