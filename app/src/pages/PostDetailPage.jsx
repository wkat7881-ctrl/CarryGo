import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import InfoRow from '../components/ui/InfoRow'
import Modal from '../components/layout/Modal'
import { ChevronRight } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { getPostById } from '../services/posts'
import { createTrade } from '../services/orders'
import { getOrCreateConversation, sendMessage } from '../services/messages'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemWeight, setItemWeight] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await getPostById(id)
        setPost(data)
      } catch (err) {
        showToast('加载详情失败', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id])

  async function submitApplication() {
    if (!itemName || !itemWeight) {
      showToast('请填写物品名称和重量', 'error')
      return
    }

    setSubmitting(true)
    try {
      // 1. Create a pending trade
      // For a provide post, the carrier_post_id IS the post_id itself.
      const trade = await createTrade({
        post_id: post.id,
        carrier_post_id: post.id,
        carrier_id: post.user_id,
        shipper_id: CURRENT_USER_ID,
        item_name: itemName,
        item_weight: Number(itemWeight),
        status: 'pending'
      })

      // 2. Find or create conversation
      const conv = await getOrCreateConversation(post.id, CURRENT_USER_ID, post.user_id)
      
      // 3. Send initial message
      if (note) {
        await sendMessage(conv.id, CURRENT_USER_ID, note, 'text')
      }
      
      showToast('申请已发送，等待对方确认', 'success')
      setModalOpen(false)
      navigate(`/chat/${conv.id}`)
    } catch (err) {
      showToast('提交失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !post) {
    return <div className="flex-1 bg-surface flex items-center justify-center text-muted">加载中...</div>
  }

  // Calculate remaining weight
  const activeTrades = post.trades.filter(t => t.status === 'confirmed' || t.status === 'pending')
  const usedWeight = activeTrades.reduce((sum, t) => sum + t.item_weight, 0)
  const remain = post.weight - usedWeight

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="帖子详情" showBack onBack={() => navigate('/')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide px-0 pt-3">
        {/* Detail Card */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="flex justify-between items-start mb-6">
            <div className="px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-brand-light text-brand">🛫 提供帮带</div>
            <span className="text-[12px] text-muted">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-center gap-6 my-6">
            <div className="text-center">
              <div className="text-[24px] font-bold text-ink">{post.departure}</div>
            </div>
            <span className="text-[24px] text-brand font-bold">→</span>
            <div className="text-center">
              <div className="text-[24px] font-bold text-ink">{post.arrival}</div>
            </div>
          </div>

          <InfoRow label="出发日期" value={post.date} />
          <InfoRow label="可带重量" value={`总 ${post.weight}kg（剩余 ${remain}kg）`} />
          <InfoRow label="收费标准" value={post.price_info || '无'} />
          <InfoRow label="交易方式" value="面交或邮寄" noBorder />
        </div>

        {/* Description */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="font-semibold text-ink mb-2 text-[15px]">帮带说明</div>
          <p className="text-[14px] text-secondary leading-relaxed">{post.price_info || '暂无说明'}</p>
        </div>

        {/* Disclaimer */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="font-semibold text-ink mb-3 text-[15px]">⚠️ 责任声明</div>
          <div className="bg-surface rounded-lg p-3 text-[13px] text-secondary leading-relaxed">
            海关征税罚款、没收由物品主人自行承担。请确保所托物品须符合两国海关规定。
          </div>
        </div>

        {/* User card */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5 flex items-center gap-3 cursor-pointer">
          <Avatar src={post.user.avatar_url} alt={post.user.name} size="lg" />
          <div className="flex-1">
            <div className="font-semibold text-[16px] text-ink">{post.user.name}</div>
            <div className="text-[13px] text-muted mt-0.5">历史帮带记录</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted" />
        </div>
      </div>

      {/* Action Bar */}
      {post.user_id !== CURRENT_USER_ID && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
          <button className="flex-1 btn-outline" onClick={async () => {
            const conv = await getOrCreateConversation(post.id, CURRENT_USER_ID, post.user_id)
            navigate(`/chat/${conv.id}`)
          }}>
            💬 联系TA
          </button>
          <button className="flex-1 btn-primary" onClick={() => setModalOpen(true)}>
            📦 申请帮带
          </button>
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="申请帮带">
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">物品名称</label>
            <input className="input w-full" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="例如：奶粉、化妆品" />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">物品重量 (kg)</label>
            <input type="number" className="input w-full" value={itemWeight} onChange={e => setItemWeight(e.target.value)} placeholder="输入重量" />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">留言说明</label>
            <textarea className="input min-h-[80px] w-full resize-none" value={note} onChange={e => setNote(e.target.value)} placeholder="向旅行者打个招呼..." />
          </div>
          <button className="w-full btn-primary mt-2 disabled:opacity-50" onClick={submitApplication} disabled={submitting}>
            {submitting ? '提交中...' : '提交申请'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
