import { supabase } from '../supabase/client'

/**
 * Fetch all active public posts for the home page.
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
      trades:trades!trades_post_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching public posts:', error.message)
    throw error
  }

  // Filter posts in JS based on our domain rules
  return data.filter(post => {
    if (post.type === 'seek') {
      const isMatched = post.trades.some(trade => 
        trade.status === 'confirmed' || trade.status === 'completed'
      )
      return !isMatched
    }
    if (post.type === 'provide') {
      return post.is_active
    }
    return true
  })
}

/**
 * Fetch a single post by ID with explicit joins.
 */
export async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*),
      trades:trades!trades_post_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error.message)
    throw error
  }
  return data
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
 * Toggle the active state of a Provide Post (Suitcase).
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

/**
 * Update an existing Post.
 */
export async function updatePost(postId, postData) {
  const { data, error } = await supabase
    .from('posts')
    .update(postData)
    .eq('id', postId)
    .select()

  if (error) {
    console.error('Error updating post:', error.message)
    throw error
  }

  return data[0]
}
