import BottomTabBar from '../components/layout/BottomTabBar'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import RouteDisplay from '../components/ui/RouteDisplay'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, Weight, Banknote, ChevronRight } from 'lucide-react'

// ─── Mock data (matches prototype) ───────────────────────────────────────────
const FILTER_TABS = ['全部', '慕尼黑', '柏林', '巴黎', '伦敦']

const POSTS = [
  {
    id: 'post-1',
    type: 'provide',
    badge: '🛫 提供帮带',
    from: '慕尼黑',
    to: '成都',
    description: '可帮带物品，8月18日出发',
    date: '8月18日',
    weight: '剩余 8kg',
    price: '¥50/kg',
    timeAgo: '2小时前',
    user: { name: 'Linda', count: 23, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    link: '/post/1',
  },
  {
    id: 'post-2',
    type: 'seek',
    badge: '📦 寻求帮带',
    from: '柏林',
    to: '上海',
    description: '需要帮带奶粉，7月20日前',
    date: '7月20日',
    weight: '需要 3kg',
    price: null,
    timeAgo: '5小时前',
    user: { name: 'Tom', count: 12, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    link: '/request/2',
  },
  {
    id: 'post-3',
    type: 'provide',
    badge: '🛫 提供帮带',
    from: '巴黎',
    to: '北京',
    description: '可帮带奢侈品，8月25日出发',
    date: '8月25日',
    weight: '剩余 5kg',
    price: '¥80/kg',
    timeAgo: '昨天',
    user: { name: 'Sophie', count: 45, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    link: '/post/3',
  },
]

// ─── PostCard ────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const navigate = useNavigate()
  return (
    <div
      className={`mx-5 mb-4 bg-white rounded-lg p-5 shadow-card cursor-pointer border-l-[3px] overflow-hidden ${post.type === 'provide' ? 'border-l-brand' : 'border-l-amber-400'}`}
      onClick={() => navigate(post.link)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold ${post.type === 'provide' ? 'bg-brand-light text-brand' : 'bg-amber-50 text-amber-600'}`}>
          {post.badge}
        </div>
        <span className="text-[12px] text-muted">{post.timeAgo}</span>
      </div>

      {/* Route */}
      <div className="text-[20px] font-bold text-ink mb-1">
        {post.from} → {post.to}
      </div>

      {/* Description */}
      <p className="text-[14px] text-secondary mb-3">{post.description}</p>

      {/* Meta */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5" />
          {post.date}
        </div>
        <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
          <Weight className="w-3.5 h-3.5" />
          {post.weight}
        </div>
        {post.price && (
          <div className="flex items-center gap-1 bg-surface text-secondary text-[12px] px-2.5 py-1 rounded-md">
            <Banknote className="w-3.5 h-3.5" />
            {post.price}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <Avatar src={post.user.avatar} alt={post.user.name} size="sm" />
        <div className="flex-1">
          <div className="text-[14px] font-medium text-ink">{post.user.name}</div>
          <div className="text-[12px] text-muted">{post.user.count}次帮带</div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted" />
      </div>
    </div>
  )
}

// ─── HomePage ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const currentUserAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'

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
              placeholder="搜索城市或物品..."
              className="input pl-11"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                i === 0 ? 'bg-brand text-white' : 'bg-white text-secondary border border-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Post List */}
        {POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}

        <div className="h-[72px]" />
      </div>

      <BottomTabBar />
    </div>
  )
}
