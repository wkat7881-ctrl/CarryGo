import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import { Check } from 'lucide-react'

export default function ApplySuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="申请成功" showBack onBack={() => navigate('/')} />

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <div className="flex flex-col items-center px-6 pt-10 pb-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-brand">
            <Check className="w-10 h-10 text-white stroke-[3px]" />
          </div>

          <h2 className="text-[24px] font-bold text-ink mb-3">申请已提交！</h2>
          <p className="text-[14px] text-secondary mb-8 leading-relaxed">
            你的帮带申请已发送给张明，等待他确认后即可开始沟通。
          </p>

          {/* Order card */}
          <div className="w-full bg-white rounded-lg p-5 shadow-card text-left mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-ink text-[15px]">申请详情</span>
              <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[11px] font-semibold">⏳ 待确认</span>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              {[
                { label: '物品名称', value: 'MacBook Pro' },
                { label: '物品重量', value: '2 kg' },
                { label: '路线',     value: '慕尼黑 → 成都' },
                { label: '帮带费用', value: '¥100' },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-[14px]">
                  <span className="text-secondary">{row.label}</span>
                  <span className="font-bold text-ink">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full btn-primary mb-4"
            onClick={() => navigate('/chat')}
          >
            查看消息
          </button>
          <button className="text-muted text-[14px] font-medium hover:text-ink transition-colors" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>

      <BottomTabBar />
    </div>
  )
}
