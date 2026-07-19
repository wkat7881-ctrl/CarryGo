import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { Pencil, LogOut, Plane, ArrowRight, ArrowLeft } from 'lucide-react'

const BADGE_LABELS = {
  reliable: '靠谱',
  friendly: '友善',
  quick_response: '回复快',
  good_condition: '物品完好',
}

export default function ProfilePage() {
  const { userId: paramUserId } = useParams()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const targetUserId = paramUserId === 'me' ? user?.id : paramUserId

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [badges, setBadges] = useState([]) // [{ tag, count }]
  const [loading, setLoading] = useState(true)

  const isOwnProfile = user?.id === targetUserId

  useEffect(() => { if (targetUserId) fetchProfile() }, [targetUserId])

  async function fetchProfile() {
    setLoading(true)

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', targetUserId).single()
    setProfile(prof)

    const { data: userPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
    setPosts(userPosts || [])

    // Fetch positive reviews for trust badges
    const { data: reviews } = await supabase
      .from('user_reviews')
      .select('selected_tags')
      .eq('target_id', targetUserId)
      .eq('satisfaction_level', 1)

    if (reviews && reviews.length > 0) {
      const countMap = {}
      for (const r of reviews) {
        if (r.selected_tags && Array.isArray(r.selected_tags)) {
          for (const tag of r.selected_tags) {
            countMap[tag] = (countMap[tag] || 0) + 1
          }
        }
      }
      // Only show tags chosen by 2+ different users
      const earned = Object.entries(countMap)
        .filter(([, count]) => count >= 2)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
      setBadges(earned)
    } else {
      setBadges([])
    }

    setLoading(false)
  }

  async function handleSignOut() { await signOut(); navigate('/') }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-500 font-medium">用户不存在</p>
        <Link to="/" className="text-primary-600 text-sm mt-2 inline-block font-medium">返回首页</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-500 hover:text-muted-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回首页
      </Link>

      {/* Profile header */}
      <div className="card p-6 text-center mb-5">
        <Avatar src={profile?.avatar_url} name={profile?.display_name} size="xl" className="mx-auto mb-3" />

        {/* Name + Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
          <h1 className="text-heading text-muted-700">{profile?.display_name || '未设置昵称'}</h1>
          {badges.map(({ tag, count }) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 text-xs px-2 py-1 rounded-md font-medium bg-purple-100 text-purple-800"
            >
              {BADGE_LABELS[tag] || tag}
              {count >= 3 && <span className="opacity-60 text-[10px]">×{count}</span>}
            </span>
          ))}
        </div>

        {profile?.bio && <p className="text-body text-muted-600 mt-1">{profile.bio}</p>}

        <p className="text-caption text-muted-500 mt-3">
          {profile?.created_at ? `${new Date(profile.created_at).toLocaleDateString('zh-CN')} 加入` : ''}
        </p>

        {isOwnProfile ? (
          <div className="flex gap-2.5 mt-5 justify-center">
            <Link to="/profile/edit" className="btn btn-outline h-9 text-sm">
              <Pencil className="w-4 h-4" /> 编辑资料
            </Link>
            <button onClick={handleSignOut} className="btn h-9 text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
              <LogOut className="w-4 h-4" /> 退出登录
            </button>
          </div>
        ) : null}
      </div>

      {/* Posts */}
      <h2 className="text-subhead text-muted-600 mb-3">
        {isOwnProfile ? '我的帖子' : 'TA 的帖子'} ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <div className="text-center py-12"><p className="text-muted-500 text-sm">暂无帖子</p></div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="block">
              <div className={`card p-4 ${post.status === 'fulfilled' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={post.type === 'provide_help' ? 'tag tag-provide' : 'tag tag-request'}>
                      <Plane className="w-3 h-3" />
                      {post.type === 'provide_help' ? '可帮带' : '求帮带'}
                    </span>
                    <span className={post.status === 'fulfilled' ? 'tag tag-fulfilled' : 'tag tag-active'}>
                      {post.type === 'provide_help'
                        ? (post.status === 'fulfilled' ? '已满' : '可接单')
                        : (post.status === 'fulfilled' ? '已找到人' : '有效')}
                    </span>
                  </div>
                  <span className="text-caption text-muted-500">
                    {new Date(post.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-700 mb-1">
                  <span>{post.departure_city}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-500" />
                  <span>{post.arrival_city}</span>
                </div>
                <p className="text-sm text-muted-600 line-clamp-1 mb-1">{post.description}</p>
                <span className="text-caption text-muted-500">{post.flight_date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
