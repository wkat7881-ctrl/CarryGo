import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { sendMessage } from '../services/messages'

export function useConversation(conversationId, currentUserId) {
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [latestTrade, setLatestTrade] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
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

      const isUserOne = conv.user_one_id === currentUserId
      const partner = isUserOne ? conv.user_two : conv.user_one

      const { data: trades, error: tradeError } = await supabase
        .from('trades')
        .select('*, post:posts!trades_post_id_fkey(*), shipper:users!trades_shipper_id_fkey(*)')
        .eq('post_id', conv.post_id)
        .in('shipper_id', [currentUserId, partner.id])
        .in('carrier_id', [currentUserId, partner.id])
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
    if (!conversationId) return
    loadData()

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

  async function handleSendMessage(text) {
    if (!text.trim() || !conversation) return
    try {
      await sendMessage(conversation.id, currentUserId, text, 'text')
      loadData()
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }

  return {
    conversation,
    messages,
    latestTrade,
    loading,
    sendMessage: handleSendMessage,
    reload: loadData
  }
}
