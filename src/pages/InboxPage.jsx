import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function InboxPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchConversations() }, [user])

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel(`inbox:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchConversations())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function fetchConversations() {
    const { data: messages } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(display_name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (!messages) { setConversations([]); setLoading(false); return }
    const chatMap = new Map()
    for (const msg of messages) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
      if (!chatMap.has(partnerId)) {
        const partner = msg.sender_id === user.id ? msg.receiver : msg.sender
        chatMap.set(partnerId, { partnerId, partnerName: partner?.display_name || '未知用户', partnerAvatar: partner?.avatar_url, lastMessage: msg.content, lastTime: msg.created_at, unreadCount: 0 })
      }
    }
    for (const [partnerId, convo] of chatMap) {
      convo.unreadCount = messages.filter((m) => m.sender_id === partnerId && m.receiver_id === user.id && !m.is_read).length
    }
    setConversations(Array.from(chatMap.values()).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime)))
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 animate-pulse"><div className="h-4 bg-muted-100 rounded w-1/3 mb-2" /><div className="h-3 bg-muted-100 rounded w-2/3" /></div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-heading text-muted-700 mb-4">消息</h2>

      {conversations.length === 0 ? (
        <div className="text-center py-16"><p className="text-muted-500 font-medium">暂无消息</p><p className="text-muted-400 text-sm mt-1">去发现帖子，联系其他用户吧！</p></div>
      ) : (
        <div className="space-y-1">
          {conversations.map((convo) => (
            <Link key={convo.partnerId} to={`/messages/${convo.partnerId}`} className="card p-4 flex items-center gap-3 hover:bg-muted-50">
              <div className="relative flex-shrink-0">
                <Avatar src={convo.partnerAvatar} name={convo.partnerName} size="lg" />
                {convo.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                    {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-muted-700">{convo.partnerName}</span>
                  <span className="text-caption text-muted-500">{new Date(convo.lastTime).toLocaleDateString('zh-CN')}</span>
                </div>
                <p className="text-sm text-muted-600 truncate mt-0.5">{convo.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
