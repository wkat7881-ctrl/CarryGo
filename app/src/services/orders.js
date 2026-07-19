import { supabase } from '../supabase/client'
import { getOrCreateConversation, sendMessage } from './messages'
import { togglePostActive } from './posts'

/**
 * Create a new pending Trade
 */
export async function createTrade(tradeData) {
  const { data, error } = await supabase
    .from('trades')
    .insert([tradeData])
    .select()

  if (error) {
    console.error('Error creating trade:', error.message)
    throw error
  }
  return data[0]
}

/**
 * Update trade status (e.g., 'confirmed', 'cancelled')
 */
export async function updateTradeStatus(tradeId, status) {
  const { data, error } = await supabase
    .from('trades')
    .update({ status })
    .eq('id', tradeId)
    .select()

  if (error) {
    console.error('Error updating trade status:', error.message)
    throw error
  }
  return data[0]
}

/**
 * Update any trade fields (e.g. carrier_completed, shipper_completed, status)
 */
export async function updateTrade(tradeId, updates) {
  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .select()

  if (error) {
    console.error('Error updating trade completion:', error.message)
    throw error
  }
  return data[0]
}

// --- Semantic State Transitions ---

export async function acceptProposal(tradeId, actorId) {
  const { data: trade, error } = await supabase.from('trades').select('*, post:posts(*)').eq('id', tradeId).single()
  if (error) throw error

  await updateTradeStatus(tradeId, 'confirmed')
  const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)

  if (trade.post.type === 'seek') {
    await sendMessage(conv.id, actorId, '✅ 你已同意帮带，物品已放入对方行李箱。', 'system')
    try {
      await togglePostActive(trade.post_id, false)
    } catch (e) {
      console.error('Failed to auto-hide post:', e)
    }
  } else {
    await sendMessage(conv.id, actorId, '✅ 你已确认帮带，物品已加入行李箱。', 'system')
  }
}

export async function rejectProposal(tradeId, actorId) {
  const { data: trade, error } = await supabase.from('trades').select('*, post:posts(*)').eq('id', tradeId).single()
  if (error) throw error

  await updateTradeStatus(tradeId, 'cancelled')
  const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)

  if (trade.post.type === 'seek') {
    await sendMessage(conv.id, actorId, '❌ 你已拒绝该帮带提议。', 'system')
  } else {
    await sendMessage(conv.id, actorId, '❌ 你已拒绝该帮带申请。', 'system')
  }
}

export async function cancelTrade(tradeId, actorId) {
  const { data: trade, error } = await supabase.from('trades').select('*').eq('id', tradeId).single()
  if (error) throw error

  await updateTradeStatus(tradeId, 'cancelled')
  const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)
  
  const isCarrier = actorId === trade.carrier_id
  const msg = isCarrier ? '❌ 旅行者已将你的物品从行李箱移除/取消。' : '❌ 发货人取消了这笔帮带。'
  await sendMessage(conv.id, actorId, msg, 'system')
}

export async function confirmDelivery(tradeId, actorId) {
  const { data: trade, error } = await supabase.from('trades').select('*').eq('id', tradeId).single()
  if (error) throw error

  await updateTrade(tradeId, { carrier_completed: true })
  const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)
  await sendMessage(conv.id, actorId, '📦 旅行者已标记物品为已送达，等待发货人确认。', 'system')
}

export async function confirmReceipt(tradeId, actorId) {
  const { data: trade, error } = await supabase.from('trades').select('*').eq('id', tradeId).single()
  if (error) throw error

  await updateTrade(tradeId, { shipper_completed: true, status: 'completed' })
  const conv = await getOrCreateConversation(trade.post_id, trade.carrier_id, trade.shipper_id)
  await sendMessage(conv.id, actorId, '✅ 发货人已确认送达，本单完结！', 'system')
}
