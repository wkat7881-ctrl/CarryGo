import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'

export default function RequestOrderDetailPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="我的需求单" showBack onBack={() => navigate('/profile')} />

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div className="px-5 pt-5 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-light text-brand text-[13px] font-semibold rounded-full">
            🧳 Linda 已接单
          </span>
        </div>

        {/* Order info */}
        <div className="mx-5 mb-3 bg-white rounded-lg p-5 shadow-card">
          <div className="font-semibold text-ink text-[15px] mb-4">需求单信息</div>
          {[
            { label: '路线',     value: '柏林 → 上海' },
            { label: '物品',     value: '爱他美奶粉（3罐）' },
            { label: '重量',     value: '3kg' },
            { label: '当前状态', value: '已确认', highlight: true },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0 text-[14px]">
              <span className="text-secondary">{row.label}</span>
              <span className={`font-medium text-right ${row.highlight ? 'text-brand font-bold' : 'text-ink'}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Carrier */}
        <div className="mx-5 mb-3 bg-white rounded-lg p-5 shadow-card">
          <div className="font-semibold text-ink text-[15px] mb-4">承接人</div>
          <div className="flex items-center gap-3 mb-4">
            <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Linda" size="lg" />
            <div>
              <div className="font-bold text-[16px] text-ink">Linda</div>
              <div className="text-[13px] text-secondary leading-snug">
                23 次帮带<br/>当前行李箱：慕尼黑 → 成都 2024
              </div>
            </div>
          </div>
          <div className="flex gap-3 mb-4">
            <button className="flex-1 btn-primary" onClick={() => navigate('/chat/conv-proposal')}>联系TA</button>
            <button className="flex-1 btn-outline" onClick={() => navigate('/chat/conv-proposal')}>查看聊天</button>
          </div>
          <div className="bg-surface rounded-md p-4 text-[13px] text-secondary leading-relaxed mb-4 border border-border">
            这单已经由 Linda 确认承接。她标记完成后，你这边再点一次"我已完成收货"，就会进入评价。
          </div>
          <button
            className="w-full btn-primary"
            onClick={() => navigate('/review?trade=request_berlin_shanghai_001&from=me&to=linda')}
          >
            我已完成收货
          </button>
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}
