import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import Avatar from '../components/ui/Avatar'
import { getPublicPosts } from '../services/posts'
import { Search, Calendar, Weight, Banknote, ChevronRight } from 'lucide-react'

// ─── Filter Tabs ─────────────────────────────────────────────────────────────
const FILTER_TABS = ['全部', '慕尼黑', '柏林', '巴黎', '伦敦']

// Helper to format date from YYYY-MM-DD to MM月DD日
function formatDateChinese(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  return `${Number(parts[1])}月${Number(parts[2])}日`
}

// Helper to calculate time distance
function getTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diffMs = new Date() - new Date(dateStr)
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1}分钟前`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}天前`
}

// ─── PostCard ────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const navigate = useNavigate()
  
  // Calculate remaining weight for provide posts
  let weightDisplay = ''
  if (post.type === 'provide') {
    const usedWeight = post.trades
      ? post.trades.filter(t => t.status === 'confirmed').reduce((sum, t) => sum + Number(t.item_weight), 0)
      : 0
    const remaining = Math.max(0, Number(post.weight) - usedWeight)
    weightDisplay = `剩余 ${remaining}kg / ${post.weight}kg`
  } else {
    weightDisplay = `需要 ${post.weight}kg`
  }

  const badgeText = post.type === 'provide' ? '🛫 提供帮带' : '📦 寻求帮带'
  const linkPath = post.type === 'provide' ? `/post/${post.id}` : `/request/${post.id}`
  const description = post.type === 'provide' 
    ? (post.price_info ? `可帮带，收费 ${post.price_info}` : '可提供随身行李额度帮带物品。')
    : post.item_desc

  // Fetch completed trades count for this user
  const completedCount = post.user?.trades
    ? post.user.trades.filter(t => t.status === 'completed').length
    : 0

  return (
    <div
      className={`mx-5 mb-4 bg-white rounded-lg p-5 shadow-card cursor-pointer border-l-[3px] overflow-hidden ${post.type === 'provide' ? 'border-l-brand' : 'border-l-amber-400'}`}
      onClick={() => navigate(linkPath)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold ${post.type === 'provide' ? 'bg-brand-light text-brand' : 'bg-amber-50 text-amber-600'}`}>
          {badgeText}
        </div>
        <span className="text-[12px] text-muted">{getTimeAgo(post.created_at)}</span>
      </div>

      {/* Route */}
      <div className="text-[20px] font-bold text-ink mb-1">
        {post.departure} → {post.arrival}
      </div>

      {/* Description */}
      <p className="text-[14px] text-secondary mb-3 line-clamp-2">
        {post.type === 'seek' && <span className="font-bold text-ink mr-1">[{post.item_name}]</span>}
        {description}
      </p>

      {/* Meta */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5" />
          {formatDateChinese(post.date)}
        </div>
        <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
          <Weight className="w-3.5 h-3.5" />
          {weightDisplay}
        </div>
        {post.price_info && (
          <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
            <Banknote className="w-3.5 h-3.5" />
            {post.price_info}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Avatar src={post.user?.avatar_url} alt={post.user?.name} size="sm" />
        <div className="flex-1">
          <div className="text-[14px] font-medium text-ink">{post.user?.name}</div>
          <div className="text-[12px] text-muted">{completedCount}次帮带</div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted" />
      </div>
    </div>
  )
}

// ─── HomePage ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('全部')

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPublicPosts()
        setPosts(data)
      } catch (err) {
        console.error('Failed to load posts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  // Filter logic: search and city tabs
  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === '全部' || post.departure.includes(activeTab)
    const matchesSearch = searchQuery === '' ||
      post.departure.includes(searchQuery) ||
      post.arrival.includes(searchQuery) ||
      (post.item_name && post.item_name.includes(searchQuery))
    return matchesTab && matchesSearch
  })

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="text-brand font-bold text-[17px]">CarryGo</div>
        <Avatar src={currentUserAvatar} alt="我" size="md" />
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        <h1 className="page-title px-5 pb-1">发现帮带</h1>
        <div className="text-[13px] text-secondary px-5 pb-4">找到你的帮带伙伴</div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索城市或物品..."
              className="input pl-11"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const isTabActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                  isTabActive ? 'bg-brand text-white' : 'bg-white text-secondary border border-border'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Post List */}
        {loading ? (
          <div className="text-center py-10 text-muted text-[14px]">正在加载帮带信息...</div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-20 text-muted text-[14px]">没有找到符合条件的帮带帖子。</div>
        )}

        <div className="h-[72px]" />
      </div>

      <BottomTabBar />
    </div>
  )
}
