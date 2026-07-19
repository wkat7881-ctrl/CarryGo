import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import { recordReview } from '../utils/trustBadges'
import TrustTagSelector from '../components/features/TrustTagSelector'
import { Check } from 'lucide-react'
import { supabase } from '../supabase/client'

export default function ReviewPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { showToast } = useToast()

  const tradeId   = params.get('trade')
  const toUserId  = params.get('to')
  const fromUserId = params.get('from')

  const [partner, setPartner] = useState(null)
  const [trade, setTrade] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState([])

  useEffect(() => {
    async function loadData() {
      if (!tradeId || !toUserId) {
        setLoading(false)
        return
      }
      try {
        const { data: t, error: tErr } = await supabase
          .from('trades')
          .select('*, post:posts!trades_post_id_fkey(*)')
          .eq('id', tradeId)
          .single()
        if (!tErr) setTrade(t)

        const { data: u, error: uErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', toUserId)
          .single()
        if (!uErr) setPartner(u)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [tradeId, toUserId])

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
      setTimeout(() => navigate(`/`), 1200) // Navigate to Home
      return
    }
    showToast('评价已提交', 'success')
    setTimeout(() => navigate(`/`), 1500) // Navigate to Home
  }

  if (loading) {
    return <div className="flex-1 bg-surface flex items-center justify-center text-muted text-[14px]">加载中...</div>
  }

  const partnerName = partner?.name || '用户'
  const partnerAvatar = partner?.avatar_url || ''

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="评价" showBack onBack={() => navigate(-1)} />

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
            <Avatar src={partnerAvatar} alt={partnerName} size="lg" />
            <div>
              <div className="font-semibold text-[16px] text-ink">{partnerName}</div>
              <div className="text-[13px] text-secondary">
                {trade?.post?.departure} → {trade?.post?.arrival} · {trade?.item_weight}kg
              </div>
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
