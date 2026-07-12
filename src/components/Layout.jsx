import { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Avatar from './Avatar'
import { Home, PlusCircle, MessageCircle, User, LogIn } from 'lucide-react'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/post/new', label: '发帖', icon: PlusCircle, requireAuth: true },
  { to: '/messages', label: '消息', icon: MessageCircle, requireAuth: true },
  { to: '/profile/me', label: '我的', icon: User, requireAuth: true },
]

export default function Layout() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  // Re-fetch unread count when route changes (e.g. after reading messages)
  useEffect(() => {
    if (user) fetchUnreadCount()
  }, [location.pathname, user])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    fetchUnreadCount()

    const channel = supabase
      .channel(`layout:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => fetchUnreadCount()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  async function fetchUnreadCount() {
    const { count: msgCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    setUnreadCount(msgCount || 0)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8F8FC' }}>
      {/* Header — transparent, no border, no backdrop */}
      <header className="sticky top-0 z-40" style={{ background: '#F8F8FC' }}>
        <div className="max-w-[960px] mx-auto px-5 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight" style={{ color: '#6D5EF5' }}>
              CarryGo
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/post/new"
                  className="btn btn-sm h-9 px-4 font-medium"
                  style={{ color: '#6B6B7B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F4F2FF'
                    e.currentTarget.style.color = '#6D5EF5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#6B6B7B'
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                  发布
                </Link>
                <Link
                  to="/profile/me"
                  className="ml-1"
                >
                  <Avatar
                    src={profile?.avatar_url}
                    name={profile?.display_name}
                    size="sm"
                  />
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="btn btn-outline btn-sm h-9 text-sm"
              >
                <LogIn className="w-4 h-4" />
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[960px] mx-auto px-5 pt-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Nav (mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t pb-safe"
        style={{ background: '#FFFFFF', borderColor: '#EBEBF0' }}
      >
        <div className="max-w-[960px] mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.requireAuth && !user ? '/auth' : item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors ${
                    isActive ? '' : ''
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? '#6D5EF5' : '#9999AA',
                })}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
                {item.label}
                {item.to === '/messages' && unreadCount > 0 && (
                  <span className="absolute top-0 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
