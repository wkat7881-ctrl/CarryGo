import { supabase } from '../supabase/client'

/**
 * Get an existing conversation between two users for a specific post, or create a new one.
 */
export async function getOrCreateConversation(postId, userOneId, userTwoId) {
  // Ensure consistent ordering to avoid duplicate conversations for the same pair
  const [u1, u2] = userOneId < userTwoId ? [userOneId, userTwoId] : [userTwoId, userOneId]

  // Try to find existing
  let { data: conv, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('post_id', postId)
    .eq('user_one_id', u1)
    .eq('user_two_id', u2)
    .single()

  if (!conv && error?.code === 'PGRST116') {
    // Not found, create new
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert([{ post_id: postId, user_one_id: u1, user_two_id: u2 }])
      .select()
      .single()

    if (createError) {
      console.error('Error creating conversation:', createError.message)
      throw createError
    }
    conv = newConv
  } else if (error) {
    console.error('Error fetching conversation:', error.message)
    throw error
  }

  return conv
}

/**
 * Send a message within a conversation.
 * type: 'text' | 'image' | 'system' | 'time'
 */
export async function sendMessage(conversationId, senderId, text, type = 'text') {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: senderId,
      text,
      type
    }])
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error.message)
    throw error
  }
  return data
}
