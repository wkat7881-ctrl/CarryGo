import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CityInput from '../components/CityInput'
import Avatar from '../components/Avatar'
import { Plane, Package, Calendar, Banknote, ArrowRight, Search, FileText, Handshake } from 'lucide-react'

const PAGE_SIZE = 10

const HOT_ROUTES = [
  { departure: '法兰克福', arrival: '广州' },
  { departure: '伦敦', arrival: '北京' },
  { departure: '巴黎', arrival: '上海' },
  { departure: '柏林', arrival: '成都' },
]

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({ type: '', departure: '', arrival: '' })
  const sentinelRef = useRef(null)
  const resultsRef = useRef(null)

  useEffect(() => { fetchPosts(true) }, [])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) fetchPosts(false)
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore])

  const fetchPosts = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); setHasMore(true) }
    else setLoadingMore(true)

    const from = reset ? 0 : posts.length
    const to = from + PAGE_SIZE - 1

    const { data, count, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(display_name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error && data) {
      if (reset) setPosts(data)
      else setPosts((prev) => [...prev, ...data])
      if (data.length < PAGE_SIZE || (count && from + data.length >= count)) setHasMore(false)
    }
    setLoading(false)
    setLoadingMore(false)
  }, [posts.length])

  const filteredPosts = posts.filter((post) => {
    if (filters.type && post.type !== filters.type) return false
    if (filters.departure && !post.departure_city.toLowerCase().includes(filters.departure.toLowerCase())) return false
    if (filters.arrival && !post.arrival_city.toLowerCase().includes(filters.arrival.toLowerCase())) return false
    return true
  })

  function handleHotRoute(departure, arrival) {
    setFilters((prev) => ({ ...prev, departure, arrival }))
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleSearch() {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cityInputClass = 'h-full bg-transparent border-none outline-none text-sm placeholder-[#BBBBC8] w-full focus:shadow-none focus:border-none'

  return (
    <div>
      {/* ============================================
          HERO + SEARCH
          ============================================ */}
      <section className="text-center pt-10 pb-12 md:pt-16 md:pb-16">
        {/* Title */}
        <h1 className="text-display mb-3" style={{ color: '#1A1A2E' }}>
          跨国帮带，顺路送达
        </h1>
        <p className="text-base mb-8" style={{ color: '#6B6B7B' }}>
          连接旅行者与需要帮带的人
        </p>

        {/* Unified Search Bar */}
        <div className="max-w-[680px] mx-auto">
          <div className="search-bar flex items-center h-14"
            style={{ borderRadius: '1rem' }}
          >
            {/* Search icon */}
            <Search className="w-[18px] h-[18px] ml-4 flex-shrink-0" color="#BBBBC8" strokeWidth={1.5} />

            {/* Departure */}
            <div className="flex-1 min-w-0 ml-3 h-full flex items-center">
              <CityInput
                value={filters.departure}
                onChange={(v) => setFilters({ ...filters, departure: v })}
                placeholder="出发城市"
                className={cityInputClass}
              />
            </div>

            {/* Divider + Arrow — hidden on small screens */}
            <div className="hidden sm:flex items-center gap-1 px-2 flex-shrink-0">
              <div className="w-px h-6" style={{ background: '#EBEBF0' }} />
              <ArrowRight className="w-4 h-4" color="#BBBBC8" strokeWidth={1.5} />
              <div className="w-px h-6" style={{ background: '#EBEBF0' }} />
            </div>

            {/* Arrival */}
            <div className="flex-1 min-w-0 h-full flex items-center">
              <CityInput
                value={filters.arrival}
                onChange={(v) => setFilters({ ...filters, arrival: v })}
                placeholder="目的城市"
                className={cityInputClass}
              />
            </div>

            {/* Type select — hidden on small screens */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <div className="w-px h-6" style={{ background: '#EBEBF0' }} />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-sm bg-transparent border-none outline-none cursor-pointer"
                style={{ color: '#6B6B7B' }}
              >
                <option value="">全部类型</option>
                <option value="provide_help">可帮带</option>
                <option value="need_help">求帮带</option>
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="btn btn-primary h-10 rounded-xl mr-2 flex-shrink-0 text-sm"
              style={{ padding: '0 16px' }}
            >
              <Search className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">搜索</span>
            </button>
          </div>
        </div>

        {/* Hot Routes */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {HOT_ROUTES.map((route) => (
            <button
              key={`${route.departure}-${route.arrival}`}
              onClick={() => handleHotRoute(route.departure, route.arrival)}
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: '#6D5EF5' }}
            >
              {route.departure} → {route.arrival}
            </button>
          ))}
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section className="py-12 md:py-16">
        <h2 className="text-heading text-center mb-10" style={{ color: '#1A1A2E' }}>
          如何使用
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#F4F2FF' }}>
              <FileText className="w-6 h-6" color="#6D5EF5" strokeWidth={1.5} />
            </div>
            <h3 className="text-title mb-2" style={{ color: '#1A1A2E' }}>发布需求</h3>
            <p className="text-body" style={{ color: '#6B6B7B' }}>
              说明你需要帮带的物品或出行计划
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#F4F2FF' }}>
              <Search className="w-6 h-6" color="#6D5EF5" strokeWidth={1.5} />
            </div>
            <h3 className="text-title mb-2" style={{ color: '#1A1A2E' }}>找到顺路</h3>
            <p className="text-body" style={{ color: '#6B6B7B' }}>
              浏览出行者，选择合适的帮带伙伴
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#F4F2FF' }}>
              <Handshake className="w-6 h-6" color="#6D5EF5" strokeWidth={1.5} />
            </div>
            <h3 className="text-title mb-2" style={{ color: '#1A1A2E' }}>安全交接</h3>
            <p className="text-body" style={{ color: '#6B6B7B' }}>
              双方沟通协商，完成帮带
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          FEED
          ============================================ */}
      <section ref={resultsRef} className="py-8 md:py-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-heading" style={{ color: '#1A1A2E' }}>最新帮带信息</h2>
          <Link
            to="/"
            className="text-sm font-medium hover:underline"
            style={{ color: '#6D5EF5' }}
            onClick={() => {
              setFilters({ type: '', departure: '', arrival: '' })
            }}
          >
            查看全部 →
          </Link>
        </div>

        {/* Post Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse" style={{ borderColor: '#EBEBF0' }}>
                <div className="h-5 bg-muted-100 rounded w-2/3 mb-3" />
                <div className="h-4 bg-muted-100 rounded w-full mb-2" />
                <div className="h-4 bg-muted-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-10 h-10 mx-auto mb-3" color="#BBBBC8" />
            <p className="text-body font-medium" style={{ color: '#6B6B7B' }}>还没有帖子</p>
            <p className="text-caption mt-1" style={{ color: '#9999AA' }}>快来发布第一条吧！</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/post/${post.id}`} className="block">
                  <PostCard post={post} />
                </Link>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#6D5EF5', borderTopColor: 'transparent' }} />
              )}
              {!hasMore && filteredPosts.length > 0 && (
                <p className="text-caption font-medium" style={{ color: '#BBBBC8' }}>— 已加载全部 —</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

/* ============================================
   PostCard
   ============================================ */
function PostCard({ post }) {
  const isFulfilled = post.status === 'fulfilled'
  const isProvide = post.type === 'provide_help'

  return (
    <div
      className="card p-6"
      style={{
        opacity: isFulfilled ? 0.5 : 1,
        borderColor: '#EBEBF0',
      }}
    >
      {/* Row 1: Tags + Time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className={isProvide ? 'tag tag-provide' : 'tag tag-request'}>
            <Plane className="w-3 h-3" />
            {isProvide ? '可帮带' : '求帮带'}
          </span>
          <span className={isFulfilled ? 'tag tag-fulfilled' : 'tag tag-active'}>
            {isProvide
              ? (isFulfilled ? '已满' : '可接单')
              : (isFulfilled ? '已找到人' : '有效')}
          </span>
        </div>
        <span className="text-caption" style={{ color: '#9999AA' }}>
          {formatRelativeTime(post.created_at)}
        </span>
      </div>

      {/* Row 2: Route — VISUAL CENTER */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-title" style={{ color: '#1A1A2E', fontWeight: 700 }}>
          {post.departure_city}
        </span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full" style={{ background: '#BBBBC8' }} />
          <div className="w-6 h-px" style={{ background: '#BBBBC8' }} />
          <ArrowRight className="w-4 h-4" color="#BBBBC8" strokeWidth={1.5} />
        </div>
        <span className="text-title" style={{ color: '#1A1A2E', fontWeight: 700 }}>
          {post.arrival_city}
        </span>
      </div>

      {/* Row 3: Info — date / weight / fee */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B6B7B' }}>
          <Calendar className="w-3.5 h-3.5" color="#BBBBC8" strokeWidth={1.5} />
          <span>{post.flight_date}</span>
        </div>
        {post.weight_kg && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B6B7B' }}>
            <Package className="w-3.5 h-3.5" color="#BBBBC8" strokeWidth={1.5} />
            <span>{post.weight_kg} kg</span>
          </div>
        )}
        {post.expected_fee && (
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B6B7B' }}>
            <Banknote className="w-3.5 h-3.5" color="#BBBBC8" strokeWidth={1.5} />
            <span>{post.expected_fee}</span>
          </div>
        )}
      </div>

      {/* Row 4: Description */}
      <p className="text-body line-clamp-2 mb-3 leading-relaxed" style={{ color: '#6B6B7B' }}>
        {post.description}
      </p>

      {/* Row 5: Divider */}
      <div className="border-t mb-3" style={{ borderColor: '#F0F0F5' }} />

      {/* Row 6: Author + tags */}
      <div className="flex items-center gap-2">
        <Avatar src={post.profiles?.avatar_url} name={post.profiles?.display_name} size="sm" />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
            {post.profiles?.display_name || '匿名用户'}
          </span>
          {/* Author tags — extract from profile or leave empty */}
        </div>
      </div>
    </div>
  )
}

function formatRelativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  return date.toLocaleDateString('zh-CN')
}
