import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import InfoRow from '../components/ui/InfoRow'
import Modal from '../components/layout/Modal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const POST = {
  type: 'provide',
  from: '慕尼黑', fromCountry: '德国',
  to: '成都', toCountry: '中国',
  date: '2024年8月18日',
  weight: '总 10kg（剩余 8kg）',
  price: '普通物品 ¥50/kg',
  exchange: '面交或邮寄',
  desc: '可帮带中德两国法律允许的航空携带物品。文件15欧/份，普通物品20欧/kg。不接受奢侈品、药品等特殊物品。',
  timeAgo: '2小时前',
  user: { name: 'Linda', count: 23, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', id: 'linda' },
}

export default function PostDetailPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="帖子详情" showBack onBack={() => navigate('/')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide px-0 pt-3">
        {/* Detail Card */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="flex justify-between items-start mb-6">
            <div className="px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-brand-light text-brand">🛫 提供帮带</div>
            <span className="text-[12px] text-muted">{POST.timeAgo}</span>
          </div>

          {/* Route large display */}
          <div className="flex items-center justify-center gap-6 my-6">
            <div className="text-center">
              <div className="text-[24px] font-bold text-ink">{POST.from}</div>
              <div className="text-[12px] text-muted">{POST.fromCountry}</div>
            </div>
            <span className="text-[24px] text-brand font-bold">→</span>
            <div className="text-center">
              <div className="text-[24px] font-bold text-ink">{POST.to}</div>
              <div className="text-[12px] text-muted">{POST.toCountry}</div>
            </div>
          </div>

          <InfoRow label="出发日期" value={POST.date} />
          <InfoRow label="可带重量" value={POST.weight} />
          <InfoRow label="收费标准" value={POST.price} />
          <InfoRow label="交易方式" value={POST.exchange} noBorder />
        </div>

        {/* Description */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="font-semibold text-ink mb-2 text-[15px]">帮带说明</div>
          <p className="text-[14px] text-secondary leading-relaxed">{POST.desc}</p>
        </div>

        {/* Disclaimer */}
        <div className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5">
          <div className="font-semibold text-ink mb-3 text-[15px]">⚠️ 责任声明</div>
          <div className="bg-surface rounded-lg p-3 text-[13px] text-secondary leading-relaxed">
            海关征税罚款、没收由物品主人自行承担。请确保所托物品须符合两国海关规定。
          </div>
        </div>

        {/* User card */}
        <div
          className="mx-5 mb-3 bg-white rounded-lg shadow-card p-5 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/profile/${POST.user.id}`)}
        >
          <Avatar src={POST.user.avatar} alt={POST.user.name} size="lg" />
          <div className="flex-1">
            <div className="font-semibold text-[16px] text-ink">{POST.user.name}</div>
            <div className="text-[13px] text-muted mt-0.5">{POST.user.count}次帮带</div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted" />
        </div>
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
        <button
          className="flex-1 btn-outline"
          onClick={() => navigate('/chat/alice-1')}
        >
          💬 联系TA
        </button>
        <button
          className="flex-1 btn-primary"
          onClick={() => setModalOpen(true)}
        >
          📦 申请帮带
        </button>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="申请帮带">
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">物品名称</label>
            <input className="input" placeholder="例如：奶粉、化妆品" />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">物品重量</label>
            <input type="number" className="input" placeholder="输入重量（kg）" />
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">备注说明</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="补充说明..." />
          </div>
          <button
            className="w-full btn-primary mt-2"
            onClick={() => { setModalOpen(false); navigate('/apply-success') }}
          >
            提交申请
          </button>
        </div>
      </Modal>
    </div>
  )
}
