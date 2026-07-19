import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import Avatar from '../components/ui/Avatar'
import { supabase } from '../supabase/client'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

export default function ChatPage() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadConversations() {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            post:posts(*),
            user_one:users!conversations_user_one_id_fkey(*),
            user_two:users!conversations_user_two_id_fkey(*),
            messages:messages(text, created_at, sender_id, type)
          `)
          .or(`user_one_id.eq.${CURRENT_USER_ID},user_two_id.eq.${CURRENT_USER_ID}`)

        if (error) throw error

        const formatted = (data || []).map(conv => {
          const isUserOne = conv.user_one_id === CURRENT_USER_ID
          const counterparty = isUserOne ? conv.user_two : conv.user_one
          
          const sortedMsgs = conv.messages 
            ? [...conv.messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            : []
          
          const lastMsg = sortedMsgs[0]?.text || '暂无消息'
          const time = sortedMsgs[0] 
            ? new Date(sortedMsgs[0].created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            : ''

          const postPrefix = conv.post?.type === 'provide' ? '🛫 可帮带' : '📦 寻求帮带'
          const postContext = `${postPrefix} · ${conv.post?.departure} → ${conv.post?.arrival}`

          const unreadCount = sortedMsgs[0] && sortedMsgs[0].sender_id !== CURRENT_USER_ID ? 1 : 0

          const link = conv.post?.type === 'seek'
            ? `/chat/proposal/${conv.id}`
            : `/chat/${conv.id}`

          return {
            id: conv.id,
            user: {
              name: counterparty?.name || '未知用户',
              avatar: counterparty?.avatar_url || ''
            },
            postContext,
            lastMsg,
            time,
            unread: unreadCount,
            link
          }
        })

        setConversations(formatted)
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <h1 className="page-title px-5 pt-5 pb-4">消息</h1>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">正在加载消息列表...</div>
        <BottomTabBar />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <h1 className="page-title px-5 pt-5 pb-4">消息</h1>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <div
              key={conv.id}
              className="flex items-center gap-3 px-5 py-4 bg-white cursor-pointer hover:bg-surface transition-colors border-b border-border last:border-0"
              onClick={() => navigate(conv.link)}
            >
              <div className="relative flex-shrink-0">
                <Avatar src={conv.user.avatar} alt={conv.user.name} size="md" />
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-brand text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[15px] text-ink">{conv.user.name}</span>
                  <span className="text-[12px] text-muted">{conv.time}</span>
                </div>
                <div className="text-[12px] text-brand mb-1">{conv.postContext}</div>
                <div className={`text-[13px] truncate ${conv.unread > 0 ? 'text-ink font-semibold' : 'text-secondary'}`}>
                  {conv.lastMsg}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-muted text-[14px]">暂无私信对话。</div>
        )}
      </div>

      <BottomTabBar />
    </div>
  )
}
