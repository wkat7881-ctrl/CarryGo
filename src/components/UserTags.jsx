import { Smile, Zap, Shield, Clock, Package, MessageCircle } from 'lucide-react'

const TAG_CONFIG = {
  friendly: { label: '友好', icon: Smile, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  quick_response: { label: '响应迅速', icon: Zap, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  reliable: { label: '可靠', icon: Shield, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  punctual: { label: '准时', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  good_condition: { label: '物品完好', icon: Package, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  good_communication: { label: '沟通顺畅', icon: MessageCircle, color: 'bg-pink-50 text-pink-700 border-pink-200' },
}

export const TAG_OPTIONS = Object.entries(TAG_CONFIG).map(([key, val]) => ({
  key,
  label: val.label,
}))

export default function UserTags({ tags, compact = false }) {
  if (!tags || tags.length === 0) {
    return <span className="text-xs text-muted-500">暂无标签</span>
  }

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {tags.map(({ tag, count }) => {
        const config = TAG_CONFIG[tag]
        if (!config) return null
        const Icon = config.icon
        return (
          <span key={tag}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
            {count > 1 && <span className="opacity-60">×{count}</span>}
          </span>
        )
      })}
    </div>
  )
}

export { TAG_CONFIG }
