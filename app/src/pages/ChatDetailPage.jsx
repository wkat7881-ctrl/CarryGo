import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import ContextCard from '../components/features/ContextCard'
import { ChevronLeft, Send } from 'lucide-react'
import { supabase } from '../supabase/client'
import { sendMessage } from '../services/messages'
import { acceptProposal, rejectProposal } from '../services/orders'
import { getCurrentUserId } from '../utils/auth'

const CURRENT_USER_ID = getCurrentUserId()

function ApplicationCard({ trade, isActionable, onAccept, onReject }) {
  if (!isActionable) {
    return (
      <div className="mx-3 mb-3 p-4 bg-surface rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-secondary text-[15px]">📦 帮带申请已发送</span>
          <span className="text-[11px] bg-white text-ink px-2 py-0.5 rounded-[6px] font-semibold shadow-sm border border-border">等待对方确认</span>
        </div>
        <div className="text-[13px] text-secondary leading-relaxed">
          你已申请让对方帮带 {trade.item_name} ({trade.item_weight}kg)。等待对方确认。
        </div>
      </div>
    )
  }
  return (
    <div className="mx-3 mb-3 p-4 bg-brand-light rounded-lg border border-brand/20">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-brand text-[15px]">📦 帮带申请</span>
        <span className="text-[11px] bg-white text-ink px-2 py-0.5 rounded-[6px] font-semibold shadow-sm border border-border">待你确认</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">
          {trade.item_name} {trade.item_weight}kg
        </span>
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">
          {trade.post?.departure} → {trade.post?.arrival}
        </span>
      </div>
      <div className="text-[13px] text-brand/80 mb-4 leading-relaxed">
        {trade.shipper?.name} 想把这件物品放入你的行李箱。同意后，该物品将正式加入你的行李箱并扣减容量。
      </div>
      <div className="flex gap-3">
        <button onClick={onReject} className="flex-1 btn-outline bg-white border-brand/20">拒绝</button>
        <button onClick={onAccept} className="flex-1 btn-primary">✅ 确认帮带</button>
      </div>
    </div>
  )
}

export default function ChatDetailPage() {
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const { showToast } = useToast()
  
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [latestTrade, setLatestTrade] = useState(null)
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversationAndMessages() {
    try {
      const { data: conv, error } = await supabase
        .from('conversations')
        .select(`
          *,
          post:posts(*),
          user_one:users!conversations_user_one_id_fkey(*),
          user_two:users!conversations_user_two_id_fkey(*)
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error
      setConversation(conv)

      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) throw msgError
      setMessages(msgs || [])

      const isUserOne = conv.user_one_id === CURRENT_USER_ID
      const partner = isUserOne ? conv.user_two : conv.user_one

      const { data: trades, error: tradeError } = await supabase
        .from('trades')
        .select('*, post:posts!trades_post_id_fkey(*), shipper:users!trades_shipper_id_fkey(*)')
        .eq('post_id', conv.post_id)
        .in('shipper_id', [CURRENT_USER_ID, partner.id])
        .in('carrier_id', [CURRENT_USER_ID, partner.id])
        .order('created_at', { ascending: false })

      if (tradeError) throw tradeError
      if (trades && trades.length > 0) {
        setLatestTrade(trades[0])
      } else {
        setLatestTrade(null)
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversationAndMessages()

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, payload => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  async function handleSend() {
    if (!input.trim() || !conversation) return
    try {
      const textToSend = input
      setInput('')
      await sendMessage(conversation.id, CURRENT_USER_ID, textToSend, 'text')
      loadConversationAndMessages()
    } catch (err) {
      console.error('Failed to send message:', err)
      showToast('发送失败，请重试', 'error')
    }
  }

  async function handleAccept() {
    if (!latestTrade) return
    try {
      await acceptProposal(latestTrade.id, CURRENT_USER_ID)
      showToast('已确认，物品已加入你的行李箱', 'success')
      loadConversationAndMessages()
    } catch (err) {
      console.error('Failed to accept trade:', err)
    }
  }

  async function handleReject() {
    if (!latestTrade) return
    try {
      await rejectProposal(latestTrade.id, CURRENT_USER_ID)
      showToast('已拒绝该申请', 'info')
      loadConversationAndMessages()
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

  // For a Provide post application, the carrier is the owner of the post.
  const isActionable = latestTrade && latestTrade.status === 'pending' && CURRENT_USER_ID === latestTrade.carrier_id

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
        detailLink={latestTrade && latestTrade.status !== 'pending' ? `/luggage/item/${latestTrade.id}` : `/post/${conversation.post_id}`} 
      />

      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {latestTrade && latestTrade.status === 'pending' && (
          <ApplicationCard trade={latestTrade} isActionable={isActionable} onAccept={handleAccept} onReject={handleReject} />
        )}
        
        {messages.map(m => (
          m.type === 'time' ? (
            <div key={m.id} className="text-center text-[12px] text-muted py-2">{m.text}</div>
          ) : m.type === 'system' ? (
            <div key={m.id} className="text-center text-[12px] text-muted bg-surface border border-border mx-8 py-2 px-4 rounded-full my-2">
              {m.sender_id === CURRENT_USER_ID ? m.text : m.text.replace('你已', '对方已').replace('对方行李箱', '你的行李箱')}
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.sender_id === CURRENT_USER_ID ? 'justify-end' : 'justify-start'} px-4 mb-3`}>
              <div className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed ${
                m.sender_id === CURRENT_USER_ID 
                  ? 'bg-brand text-white rounded-[18px] rounded-br-[4px]' 
                  : 'bg-white text-ink border border-border rounded-[18px] rounded-bl-[4px] shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-border pb-8">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..." type="text"
          className="flex-1 bg-surface rounded-full px-4 py-2.5 text-[14px] border border-border focus:outline-none focus:border-brand"
        />
        <button onClick={handleSend} className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
          <Send className="w-[18px] h-[18px] text-white -ml-0.5" />
        </button>
      </div>
    </div>
  )
}
