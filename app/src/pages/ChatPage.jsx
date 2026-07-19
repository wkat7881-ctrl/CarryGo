import { useNavigate } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import Avatar from '../components/ui/Avatar'

const CONVERSATIONS = [
  {
    id: 'conv-1',
    user: { name: 'Linda', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    postContext: '🛫 可帮带 · 慕尼黑 → 成都',
    lastMsg: '好的，我来看看时间安排',
    time: '刚刚',
    unread: 2,
    link: '/chat/conv-1',
  },
  {
    id: 'conv-proposal',
    user: { name: 'Tom', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    postContext: '📦 寻求帮带 · 柏林 → 上海',
    lastMsg: '你好，我可以帮你带这 3 罐奶粉',
    time: '14:30',
    unread: 1,
    link: '/chat/proposal/conv-proposal',
  },
  {
    id: 'conv-2',
    user: { name: 'Sophie', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    postContext: '🛫 可帮带 · 巴黎 → 北京',
    lastMsg: '感谢，已收到！',
    time: '昨天',
    unread: 0,
    link: '/chat/conv-2',
  },
]

export default function ChatPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-surface">
      <h1 className="page-title px-5 pt-5 pb-4">消息</h1>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {CONVERSATIONS.map(conv => (
          <div
            key={conv.id}
            className="flex items-center gap-3 px-5 py-4 bg-white cursor-pointer hover:bg-surface transition-colors border-b border-border last:border-0"
            onClick={() => navigate(conv.link)}
          >
            <div className="relative flex-shrink-0">
              <Avatar src={conv.user.avatar} alt={conv.user.name} size="md" />
              {conv.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-brand text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {conv.unread}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-[15px] text-ink">{conv.user.name}</span>
                <span className="text-[12px] text-muted">{conv.time}</span>
              </div>
              <div className="text-[12px] text-brand mb-1">{conv.postContext}</div>
              <div className={`text-[13px] truncate ${conv.unread > 0 ? 'text-ink font-semibold' : 'text-secondary'}`}>
                {conv.lastMsg}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomTabBar />
    </div>
  )
}
