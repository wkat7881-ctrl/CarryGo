import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import ContextCard from '../components/features/ContextCard'
import ChatMessagesWindow from '../components/features/ChatMessagesWindow'
import { ChevronLeft } from 'lucide-react'
import { useConversation } from '../hooks/useConversation'
import { acceptProposal, rejectProposal } from '../services/orders'

import { getCurrentUserId } from '../utils/auth'

const CURRENT_USER_ID = getCurrentUserId()

function ProposalCard({ trade, isActionable, onAccept, onReject }) {
  if (!isActionable) {
    return (
      <div className="mx-3 mb-3 p-4 bg-surface rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-secondary text-[15px]">🧳 帮带提议已发送</span>
          <span className="text-[11px] bg-white text-ink px-2 py-0.5 rounded-[6px] font-semibold shadow-sm border border-border">等待对方确认</span>
        </div>
        <div className="text-[13px] text-secondary leading-relaxed">
          你已提议帮带 {trade.item_name} ({trade.item_weight}kg)，放入 {trade.carrier_post?.departure} → {trade.carrier_post?.arrival} 的行李箱。等待对方确认。
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 mb-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-amber-600 text-[15px]">🧳 我可以帮带</span>
        <span className="text-[11px] bg-white text-ink px-2 py-0.5 rounded-[6px] font-semibold shadow-sm border border-border">待你确认</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">
          {trade.item_name} {trade.item_weight}kg
        </span>
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">
          放入: {trade.carrier_post?.departure} → {trade.carrier_post?.arrival}
        </span>
      </div>
      <div className="text-[13px] text-amber-800/80 mb-4 leading-relaxed">
        {trade.carrier?.name} 说她可以帮你带这件物品。你可以选择同意或拒绝；同意后，这件物品会正式加入她的行李箱。
      </div>
      <div className="flex gap-3">
        <button onClick={onReject} className="flex-1 btn-outline bg-white border-amber-200">拒绝</button>
        <button onClick={onAccept} className="flex-1 btn-primary">同意</button>
      </div>
    </div>
  )
}

export default function ChatDetailProposalPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const { showToast } = useToast()
  
  const { conversation, messages, latestTrade, loading, sendMessage, reload } = useConversation(conversationId, CURRENT_USER_ID)

  async function handleAccept() {
    if (!latestTrade) return
    try {
      await acceptProposal(latestTrade.id, CURRENT_USER_ID)

      showToast('已同意，物品已加入对方行李箱。大厅帖子已自动隐藏。', 'success')
      reload()
    } catch (err) {
      console.error('Failed to accept trade:', err)
    }
  }

  async function handleReject() {
    if (!latestTrade) return
    try {
      await rejectProposal(latestTrade.id, CURRENT_USER_ID)
      showToast('已拒绝该提议', 'info')
      reload()
    } catch (err) {
      console.error('Failed to reject trade:', err)
    }
  }

  if (loading || !conversation) {
    return <div className="flex flex-col h-full bg-surface items-center justify-center text-muted text-[14px]">加载中...</div>
  }

  const isUserOne = conversation.user_one_id === CURRENT_USER_ID
  const partner = isUserOne ? conversation.user_two : conversation.user_one
  const postPrefix = conversation.post?.type === 'provide' ? '🛫 可帮带' : '📦 寻求帮带'
  const postContext = `${postPrefix} · ${conversation.post?.departure} → ${conversation.post?.arrival}`

  // For a Seek post proposal, the shipper is the owner of the post.
  const isActionable = latestTrade && latestTrade.status === 'pending' && CURRENT_USER_ID === latestTrade.shipper_id

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
        <button onClick={() => navigate('/chat')} className="w-10 h-10 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-ink" />
        </button>
        <Avatar src={partner?.avatar_url} alt={partner?.name} size="md" />
        <div className="flex-1">
          <div className="font-semibold text-[15px] text-ink">{partner?.name}</div>
          <div className="text-[12px] text-secondary">{postContext}</div>
        </div>
      </div>

      <ContextCard 
        itemName={conversation.post?.item_name || '帮带说明'} 
        itemWeight={`${conversation.post?.weight}kg`} 
        status={latestTrade ? latestTrade.status : 'pending'} 
        detailLink={latestTrade && latestTrade.status !== 'pending' ? `/luggage/item/${latestTrade.id}` : `/request/${conversation.post_id}`} 
      />

      <div className="flex-1 flex flex-col min-h-0 pt-3">
        <div className="flex-shrink-0">
          {latestTrade && latestTrade.status === 'pending' && (
            <ProposalCard trade={latestTrade} isActionable={isActionable} onAccept={handleAccept} onReject={handleReject} />
          )}
        </div>
        <ChatMessagesWindow messages={messages} currentUserId={CURRENT_USER_ID} onSendMessage={sendMessage} />
      </div>
    </div>
  )
}
