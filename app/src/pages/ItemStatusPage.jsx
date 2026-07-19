import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import { Check } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../supabase/client'
import { updateTradeCompletion } from '../services/orders'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

export default function ItemStatusPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [trade, setTrade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadTrade() {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select(`
            *,
            post:posts!trades_post_id_fkey(*),
            carrier_post:posts!trades_carrier_post_id_fkey(*),
            carrier:users!trades_carrier_id_fkey(*),
            shipper:users!trades_shipper_id_fkey(*)
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setTrade(data)
      } catch (err) {
        showToast('加载状态失败', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadTrade()
  }, [id])

  async function handleComplete() {
    setSubmitting(true)
    try {
      await updateTradeCompletion(trade.id, true)
      showToast('已标记完成交付，等待发货人确认', 'success')
      // reload to reflect changes
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          post:posts!trades_post_id_fkey(*),
          carrier_post:posts!trades_carrier_post_id_fkey(*),
          carrier:users!trades_carrier_id_fkey(*),
          shipper:users!trades_shipper_id_fkey(*)
        `)
        .eq('id', id)
        .single()
      if (!error) setTrade(data)
    } catch (err) {
      showToast('操作失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !trade) {
    return <div className="flex-1 bg-surface flex items-center justify-center text-muted text-[14px]">加载中...</div>
  }

  const isCarrier = CURRENT_USER_ID === trade.carrier_id
  const partner = isCarrier ? trade.shipper : trade.carrier

  const steps = [
    { label: '申请已发送', desc: new Date(trade.created_at).toLocaleDateString(), active: true, done: true },
    { label: '对方已确认', desc: '物品已放入行李箱', active: trade.status === 'confirmed' || trade.status === 'completed', done: trade.status === 'confirmed' || trade.status === 'completed' },
    { label: '交付完成', desc: '等待双方确认', active: trade.carrier_completed || trade.shipper_completed, done: trade.carrier_completed && trade.shipper_completed }
  ]

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title={isCarrier ? "帮带物品详情" : "我的需求单"} showBack onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto pb-36 px-5 pt-3">
        <div className="mb-4">
          <div className="inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-brand-light text-brand">
            📦 {isCarrier ? '帮带任务' : '我的需求'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-4">订单状态</div>
          
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-border" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10">
                <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-white border-[2px] transition-colors ${
                  step.done ? 'border-brand bg-brand text-white' : step.active ? 'border-brand bg-white' : 'border-border'
                }`}>
                  {step.done && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className={`font-semibold text-[14px] ${step.active ? 'text-ink' : 'text-secondary'}`}>{step.label}</div>
                  <div className={`text-[12px] ${step.active ? 'text-brand' : 'text-muted'} mt-0.5`}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">物品信息</div>
          {[
            { label: '所属行程', value: trade.carrier_post ? `${trade.carrier_post.departure} → ${trade.carrier_post.arrival}` : '未指定' },
            { label: '物品类型', value: trade.item_name },
            { label: '重量',     value: `${trade.item_weight}kg` },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0 text-[14px]">
              <span className="text-secondary">{row.label}</span>
              <span className={`font-medium text-ink`}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">{isCarrier ? '发货人' : '承接人'}</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={partner?.avatar_url} alt={partner?.name} size="md" />
              <div>
                <div className="font-semibold text-[16px] text-ink">{partner?.name}</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
        {isCarrier ? (
          <>
            <button className="flex-1 btn-outline">💬 消息</button>
            <button 
              className="flex-1 btn-primary disabled:opacity-50" 
              onClick={handleComplete} 
              disabled={submitting || trade.carrier_completed || trade.status !== 'confirmed'}
            >
              {trade.carrier_completed ? '✅ 已交付' : '📦 我已完成交付'}
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 btn-outline">💬 消息</button>
            <button className="flex-1 btn-primary disabled:opacity-50" disabled>
              {trade.shipper_completed ? '✅ 已确认' : '待承接人标记完成'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
