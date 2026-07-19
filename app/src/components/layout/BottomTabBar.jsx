import { NavLink, useLocation } from 'react-router-dom'
import { Home, Plus, Package, MessageSquare, User } from 'lucide-react'

const TABS = [
  { to: '/',        label: '首页',   Icon: Home },
  { to: '/publish', label: '发布',   Icon: Plus },
  { to: '/luggage', label: '行李箱', Icon: Package },
  { to: '/chat',    label: '消息',   Icon: MessageSquare },
  { to: '/profile', label: '我的',   Icon: User },
]

export default function BottomTabBar() {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-[72px] bg-white border-t border-border flex items-start justify-around pt-2 pb-safe z-50">
      {TABS.map(({ to, label, Icon }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to)

        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center gap-[4px] min-w-[52px] transition-colors duration-150 ${
              isActive ? 'text-brand' : 'text-muted'
            }`}
          >
            <Icon size={23} strokeWidth={isActive ? 2.4 : 1.5} />
            <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          </NavLink>
        )
      })}
    </div>
  )
}
