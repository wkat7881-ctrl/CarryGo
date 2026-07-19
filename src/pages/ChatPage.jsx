import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { ArrowLeft, Send, Plane, ArrowRight, Star } from 'lucide-react'
import ReviewModal from '../components/ReviewModal'

export default function ChatPage() {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const postId = searchParams.get('postId')
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [partner, setPartner] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [contextPost, setContextPost] = useState(null)
  const [showReview, setShowReview] = useState(false)
  const bottomRef = useRef(null)
  const hasAutoSent = useRef(false)

  // Fetch post context when postId is present
  useEffect(() => {
    if (!postId) return
    supabase.from('posts').select('*').eq('id', postId).single()
      .then(({ data }) => { if (data) setContextPost(data) })
  }, [postId])

  useEffect(() => { if (user) fetchChat() }, [userId, user])

  useEffect(() => {
    if (!user || !userId) return
    const channel = supabase
      .channel(`chat:${user.id}:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id},sender_id=eq.${userId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id)
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, userId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function fetchChat() {
    setLoading(true)
    const { data: partnerData } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setPartner(partnerData)
    // Mark received messages as read
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', userId).eq('receiver_id', user.id).eq('is_read', false)
    const { data: msgs } = await supabase.from('messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(msgs || [])
    setLoading(false)
  }

  // Auto-send initial message when contacting from a post
  useEffect(() => {
    if (!postId || !user || !partner || loading) return
    if (hasAutoSent.current) return
    if (contextPost && messages.length === 0) {
      hasAutoSent.current = true
      const initialMsg = `👋 你好！我对你发布的「${contextPost.departure_city} → ${contextPost.arrival_city}」帖子感兴趣，请问还可以帮带吗？`
      supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: userId,
        content: initialMsg
      })
    }
  }, [postId, user, partner, loading, contextPost, messages.length, userId])

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim()) return
    setSending(true)
    const content = newMsg.trim()
    // Optimistic: immediately show the message in UI
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: userId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])
    setNewMsg('')
    const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: userId, content })
    if (error) {
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id))
      setNewMsg(content)
    }
    setSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  // 双方各发 ≥ 10 条消息，评价按钮才解锁
  const myMsgCount = messages.filter((m) => m.sender_id === user?.id).length
  const theirMsgCount = messages.filter((m) => m.sender_id === userId).length
  const canReview = myMsgCount >= 10 && theirMsgCount >= 10

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 border-b border-muted-200">
        <Link to="/messages" className="text-muted-500 hover:text-muted-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link to={`/profile/${userId}`} className="flex items-center gap-2 hover:opacity-80 flex-1">
          <Avatar src={partner?.avatar_url} name={partner?.display_name} size="md" />
          <span className="font-semibold text-sm text-muted-700">{partner?.display_name || '用户'}</span>
        </Link>
        {user && partner && user.id !== userId && canReview && (
          <button
            onClick={() => setShowReview(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
            title="评价此用户"
          >
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">评价</span>
          </button>
        )}
      </div>

      {/* Review unlock banner */}
      {canReview && !contextPost && (
        <div className="mx-1 mt-3 p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
          <p className="text-xs text-purple-700 font-medium">
            你们已经聊了不少了，觉得 {partner?.display_name || '对方'} 怎么样？
          </p>
          <button
            onClick={() => setShowReview(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors flex-shrink-0"
          >
            <Star className="w-3.5 h-3.5" />
            评价
          </button>
        </div>
      )}

      {/* Post Context Card */}
      {contextPost && (
        <Link
          to={`/post/${contextPost.id}`}
          className="block mx-1 mt-3 p-3 rounded-xl border border-muted-200 bg-white hover:border-muted-300 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={contextPost.type === 'provide_help' ? 'tag tag-provide' : 'tag tag-request'}>
              <Plane className="w-3 h-3" />
              {contextPost.type === 'provide_help' ? '可帮带' : '求帮带'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-700 mb-1">
            <span>{contextPost.departure_city}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-400" />
            <span>{contextPost.arrival_city}</span>
          </div>
          <p className="text-xs text-muted-600 line-clamp-1 mb-1.5">{contextPost.description}</p>
          <span className="text-xs font-medium" style={{ color: '#6D5EF5' }}>查看帖子详情 →</span>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
        {messages.length === 0 && !contextPost && <p className="text-center text-muted-500 text-sm py-10">发条消息开始对话吧！</p>}
        {messages.map((msg) => {
          const isMine = msg.sender_id === user.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine ? 'bg-primary-600 text-white rounded-br-lg' : 'bg-white border border-muted-200 text-muted-700 rounded-bl-lg shadow-sm'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-muted-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 py-3 border-t border-muted-200">
        <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 h-11 px-4 border border-muted-200 rounded-full text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
        />
        <button type="submit" disabled={sending || !newMsg.trim()}
          className="btn btn-primary h-11 w-11 rounded-full p-0 flex items-center justify-center">
          <Send className="w-4 h-4" />
        </button>
      </form>

      <ReviewModal
        open={showReview}
        onClose={() => setShowReview(false)}
        targetUserId={userId}
        targetUserName={partner?.display_name || '用户'}
      />
    </div>
  )
}
