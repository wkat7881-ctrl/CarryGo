import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import { useToast } from '../contexts/ToastContext'
import ContextCard from '../components/features/ContextCard'
import { ChevronLeft, Send } from 'lucide-react'

const MSGS = [
  { id: 1, type: 'received', text: '你好，我可以帮你带这 3 罐奶粉，7 月 18 日到上海。' },
  { id: 2, type: 'received', text: '如果你确认的话，我就把它加入我的行李箱，后面我们在这里同步状态。' },
  { id: 3, type: 'time', text: '今天 14:30' },
  { id: 4, type: 'sent', text: '好的，我先确认一下时间，没问题的话就接受。' },
]

// Proposal card — shown to requester (they accept/reject the proposal)
function ProposalCard({ onAccept, onReject }) {
  return (
    <div className="mx-3 mb-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-amber-600 text-[15px]">🧳 我可以帮带</span>
        <span className="text-[11px] bg-white text-ink px-2 py-0.5 rounded-[6px] font-semibold shadow-sm border border-border">待你确认</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">爱他美奶粉 3kg</span>
        <span className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-ink shadow-sm">计划放入 慕尼黑 → 成都</span>
      </div>
      <div className="text-[13px] text-amber-800/80 mb-4 leading-relaxed">
        Linda 说她可以帮你带这件物品。你可以选择同意或拒绝；同意后，这件物品会加入她的行李箱。
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
  const { showToast } = useToast()
  const [messages, setMessages] = useState(MSGS)
  const [input, setInput] = useState('')
  const [showCard, setShowCard] = useState(true)

  function send() {
    if (!input.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), type: 'sent', text: input }])
    setInput('')
  }

  function accept() {
    setShowCard(false)
    showToast('已同意，物品已加入对方行李箱', 'success')
    setTimeout(() => navigate('/orders/request/1'), 1200)
  }

  function reject() {
    setShowCard(false)
    showToast('已拒绝该提议', 'info')
    setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: '❌ 你已拒绝该帮带提议。' }])
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
        <button onClick={() => navigate('/chat')} className="w-10 h-10 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-ink" />
        </button>
        <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="Linda" size="md" />
        <div className="flex-1">
          <div className="font-semibold text-[15px] text-ink">Linda</div>
          <div className="text-[12px] text-secondary">🧳 可帮带 · 慕尼黑 → 成都</div>
        </div>
      </div>

      <ContextCard itemName="爱他美奶粉（3罐）" itemWeight="3kg" status="pending" detailLink="/luggage/item/1" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {showCard && <ProposalCard onAccept={accept} onReject={reject} />}
        {messages.map(m => (
          m.type === 'time' ? (
            <div key={m.id} className="text-center text-[12px] text-muted py-2">{m.text}</div>
          ) : m.type === 'system' ? (
            <div key={m.id} className="text-center text-[12px] text-muted bg-surface border border-border mx-8 py-2 px-4 rounded-full my-2">{m.text}</div>
          ) : (
            <div key={m.id} className={`flex ${m.type === 'sent' ? 'justify-end' : 'justify-start'} px-4 mb-3`}>
              <div className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed ${
                m.type === 'sent' ? 'bg-brand text-white rounded-[18px] rounded-br-[4px]' : 'bg-white text-ink border border-border rounded-[18px] rounded-bl-[4px] shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-border pb-8">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="输入消息..." type="text"
          className="flex-1 bg-surface rounded-full px-4 py-2.5 text-[14px] border border-border focus:outline-none focus:border-brand"
        />
        <button onClick={send} className="w-10 h-10 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
          <Send className="w-[18px] h-[18px] text-white -ml-0.5" />
        </button>
      </div>
    </div>
  )
}
