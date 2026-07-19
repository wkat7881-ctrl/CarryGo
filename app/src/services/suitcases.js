import { supabase } from '../supabase/client'

/**
 * Fetch a user's suitcases (Provide Posts) and return them grouped into { current, history }.
 * Each suitcase is augmented with `used_capacity`, `active_trades`, and `all_completed`.
 */
export async function getUserSuitcases(userId) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      trades:trades!trades_carrier_post_id_fkey(
        *,
        shipper:users!trades_shipper_id_fkey(*)
      )
    `)
    .eq('user_id', userId)
    .eq('type', 'provide')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching suitcases:', error.message)
    throw error
  }

  const now = new Date()
  const current = []
  const history = []

  for (const suitcase of data) {
    const activeTrades = suitcase.trades?.filter(t => 
      t.status === 'confirmed' || t.status === 'pending' || t.status === 'completed'
    ) || []
    
    const used_capacity = activeTrades.reduce((sum, t) => sum + t.item_weight, 0)
    const all_completed = activeTrades.length > 0 && activeTrades.every(t => t.status === 'completed')

    // Augment the suitcase object
    suitcase.active_trades = activeTrades
    suitcase.used_capacity = used_capacity
    suitcase.all_completed = all_completed

    if (new Date(suitcase.date) > now) {
      current.push(suitcase)
    } else {
      history.push(suitcase)
    }
  }

  return { current, history }
}

/**
 * Create a new Suitcase (a Provide Post).
 */
export async function createSuitcase(suitcaseData) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ ...suitcaseData, type: 'provide' }])
    .select()

  if (error) {
    console.error('Error creating suitcase:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Update an existing Suitcase.
 */
export async function updateSuitcase(id, suitcaseData) {
  const { data, error } = await supabase
    .from('posts')
    .update(suitcaseData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating suitcase:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Mark a Suitcase as completed, moving it to history.
 * (Internally this sets the date to 1970-01-01 and is_active to false).
 */
export async function markSuitcaseCompleted(id) {
  return await updateSuitcase(id, { date: '1970-01-01', is_active: false })
}

/**
 * Toggle the active state (published to Hall) of a Suitcase.
 */
export async function toggleSuitcaseActive(id, isActive) {
  return await updateSuitcase(id, { is_active: isActive })
}
