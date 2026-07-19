import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

export default function ChatMessagesWindow({ messages, currentUserId, onSendMessage }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return
    const textToSend = input
    setInput('')
    try {
      await onSendMessage(textToSend)
    } catch (err) {
      // Error is handled by parent, we just restore input if we wanted to
      // or assume parent shows a toast
      setInput(textToSend)
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {messages.map(m => (
          m.type === 'time' ? (
            <div key={m.id} className="text-center text-[12px] text-muted py-2">{m.text}</div>
          ) : m.type === 'system' ? (
            <div key={m.id} className="text-center text-[12px] text-muted bg-surface border border-border mx-8 py-2 px-4 rounded-full my-2 leading-relaxed">
              {m.sender_id === currentUserId ? m.text : m.text.replace('你已', '对方已').replace('对方行李箱', '你的行李箱')}
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'} px-4 mb-3`}>
              <div className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed ${
                m.sender_id === currentUserId 
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
    </>
  )
}
