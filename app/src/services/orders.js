import { supabase } from '../supabase/client'

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
 * Mark a trade as carrier_completed
 */
export async function updateTradeCompletion(tradeId, isCarrierCompleted) {
  const { data, error } = await supabase
    .from('trades')
    .update({ carrier_completed: isCarrierCompleted })
    .eq('id', tradeId)
    .select()

  if (error) {
    console.error('Error updating trade completion:', error.message)
    throw error
  }
  return data[0]
}
