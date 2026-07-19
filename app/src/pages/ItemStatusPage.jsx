import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import { Check } from 'lucide-react'

export default function ItemStatusPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [completed, setCompleted] = useState(false)

  function markComplete() {
    setCompleted(true)
    showToast('你已标记完成，等待收货方确认', 'success')
    setTimeout(() => navigate('/orders/request/1'), 1000)
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="物品详情" showBack onBack={() => navigate('/luggage')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide">
        {/* Item Header */}
        <div className="bg-white rounded-lg shadow-card mx-5 mt-3 p-5 border-l-[3px] border-l-brand">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-light rounded-md flex items-center justify-center text-[24px]">🍼</div>
            <div>
              <div className="font-bold text-[16px] text-ink">爱他美奶粉（3罐）</div>
              <div className="text-[13px] text-secondary mt-1">3kg · Berlin → Shanghai</div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Tom" size="sm" />
            <span className="font-medium text-[14px] text-ink">Tom</span>
            <button onClick={() => navigate('/chat/alice-proposal-1')} className="ml-auto px-3 py-1 bg-surface text-ink rounded-full text-[13px] font-medium border border-border">💬 联系</button>
          </div>
        </div>

        {/* Status track */}
        <div className="mx-5 mt-4">
          <div className="section-label mb-4">当前状态</div>
          <div className="relative pl-6">
            {/* vertical line */}
            <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-border" />

            {/* Confirmed */}
            <div className="relative pb-8">
              <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center z-10">
                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
              </div>
              <div>
                <div className="font-semibold text-ink text-[15px]">已确认</div>
                <div className="text-[13px] text-secondary mt-1">需求方已同意，这件物品已加入你的行李箱</div>
                <div className="text-[12px] text-muted mt-1">2024-08-10 10:30</div>
              </div>
            </div>

            {/* Completed */}
            <div className="relative">
              <div className={`absolute -left-[24px] top-1 w-4 h-4 rounded-full flex items-center justify-center z-10 transition-colors ${completed ? 'bg-brand' : 'bg-brand/30 ring-2 ring-brand/30 ring-offset-2 ring-offset-surface'}`}>
                {completed ? (
                  <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                ) : <div className="w-2 h-2 rounded-full bg-brand" />}
              </div>
              <div>
                <div className={`font-semibold text-[15px] ${completed ? 'text-ink' : 'text-brand'}`}>已完成</div>
                <div className="text-[13px] text-secondary mt-1">你和收货方分别确认完成后，即可进入评价</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 mt-6 p-4 bg-white rounded-lg text-[13px] text-secondary leading-relaxed border border-border shadow-card">
          这里不再区分交付中、运输中等细状态。当前只保留"已确认"和"已完成"两个状态，减少理解成本。
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 space-y-3 z-10 pb-8">
        <button onClick={markComplete} className="w-full btn-primary">✅ 我已完成交付</button>
        <button onClick={() => navigate('/chat/alice-proposal-1')} className="w-full btn-outline">💬 联系对方</button>
      </div>
    </div>
  )
}
