import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import { recordReview, TRUST_BADGES } from '../utils/trustBadges'
import TrustTagSelector from '../components/features/TrustTagSelector'
import { Check } from 'lucide-react'

export default function ReviewPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { showToast } = useToast()

  const tradeId   = params.get('trade') || `trade_${Date.now()}`
  const toUserId  = params.get('to')    || 'linda'
  const fromUserId = params.get('from') || 'me'

  const PARTNER_NAMES = { linda: 'Linda', tom: 'Tom', sophie: 'Sophie', zhangming: '张明' }
  const partnerName = PARTNER_NAMES[toUserId] || toUserId

  const [selected, setSelected] = useState([])

  function toggleBadge(id) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : prev.length < 3 ? [...prev, id] : (showToast('最多选择 3 个标签', 'error'), prev)
    )
  }

  function submit() {
    const result = recordReview({ tradeId, fromUserId, toUserId, badges: selected })
    if (!result.ok) {
      showToast('这笔交易已评价过', 'error')
      setTimeout(() => navigate(`/profile/${toUserId}`), 1200)
      return
    }
    showToast('评价已提交', 'success')
    setTimeout(() => navigate(`/profile/${toUserId}`), 1500)
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="评价" showBack onBack={() => navigate('/luggage')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide">
        {/* Success header strip */}
        <div className="px-5 py-6 bg-brand-light flex flex-col items-center justify-center border-b border-brand/20">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center mb-3">
            <Check className="w-8 h-8 text-white stroke-[3px]" />
          </div>
          <h1 className="text-[22px] font-bold text-ink">任务完成！</h1>
        </div>

        <div className="px-5 pt-5">
          {/* Partner info */}
          <div className="bg-white rounded-lg p-5 shadow-card flex items-center gap-3 mb-5 border-l-[3px] border-l-brand">
            <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt={partnerName} size="lg" />
            <div>
              <div className="font-semibold text-[16px] text-ink">{partnerName}</div>
              <div className="text-[13px] text-secondary">Munich → Chengdu · 2kg</div>
            </div>
          </div>

          {/* Badge selection */}
          <div className="mb-6">
            <div className="section-label mb-3">
              请选择适合对方的标签
            </div>
            <TrustTagSelector
              selected={selected}
              onChange={(newSelected) => {
                // Derive which tag was toggled and call existing toggleBadge
                const added = newSelected.find(id => !selected.includes(id))
                const removed = selected.find(id => !newSelected.includes(id))
                if (added) toggleBadge(added)
                if (removed) toggleBadge(removed)
              }}
              maxSelect={3}
              onLimitError={() => showToast('最多选 3 个标签', 'info')}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 space-y-3 z-10 pb-8">
        <button onClick={submit} className="w-full btn-primary">
          提交评价
        </button>
        <button onClick={() => navigate('/')} className="w-full text-muted text-[14px] font-medium hover:text-ink transition-colors pb-2">
          稍后再说
        </button>
      </div>
    </div>
  )
}
