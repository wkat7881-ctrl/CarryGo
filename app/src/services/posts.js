import { supabase } from '../supabase/client'

/**
 * Fetch all active public posts for the home page.
 * Applies the automatic hiding rules:
 * - Seek Posts are hidden if a Trade is confirmed/completed.
 * - Provide Posts are hidden if the Carrier marked it inactive (is_active = false).
 */
export async function getPublicPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(
        *,
        trades:trades!trades_carrier_id_fkey(status)
      ),
      trades(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public posts:', error.message)
    throw error
  }

  // Filter posts in JS based on our domain rules
  return data.filter(post => {
    if (post.type === 'seek') {
      // Hide if there is a confirmed or completed trade for this seek request
      const isMatched = post.trades.some(trade => 
        trade.status === 'confirmed' || trade.status === 'completed'
      )
      return !isMatched
    }

    if (post.type === 'provide') {
      // Hide if carrier marked it inactive
      return post.is_active
    }

    return true
  })
}

/**
 * Create a new Post.
 */
export async function createPost(postData) {
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()

  if (error) {
    console.error('Error creating post:', error.message)
    throw error
  }

  return data[0]
}

/**
 * Toggle the active state of a Provide Post.
 */
export async function togglePostActive(postId, isActive) {
  const { data, error } = await supabase
    .from('posts')
    .update({ is_active: isActive })
    .eq('id', postId)
    .select()

  if (error) {
    console.error('Error toggling post status:', error.message)
    throw error
  }

  return data[0]
}
