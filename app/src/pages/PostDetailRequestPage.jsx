import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/layout/Modal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

const POST = {
  from: '柏林', to: '上海',
  desc: '需要帮带奶粉，7月20日前送达上海。奶粉是爱他美 Pre 段，共 3 罐，总重量约 3kg，希望能面交。',
  item: '爱他美奶粉（3罐）',
  weight: '3kg',
  date: '7月20日前',
  reward: '¥180',
  user: { name: 'Tom', count: 12, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
}

export default function PostDetailRequestPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

  function sendProposal() {
    setModalOpen(false)
    showToast('提议已发出，等待对方确认', 'success')
    setTimeout(() => navigate('/chat'), 1000)
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="寻求帮带" showBack onBack={() => navigate('/')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide px-5 pt-3">
        <div className="mb-4">
          <div className="inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-amber-50 text-amber-600">📦 寻求帮带</div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[24px] font-bold text-ink">{POST.from}</span>
          <span className="text-brand text-[24px] font-bold">→</span>
          <span className="text-[24px] font-bold text-ink">{POST.to}</span>
        </div>

        {/* Info tip */}
        <div className="rounded-lg bg-brand-light text-brand p-4 mb-4">
          <div className="font-semibold mb-1 text-[15px]">这是一条寻求帮带帖子</div>
          <div className="text-[13px] leading-relaxed">
            你可以先发送一条帮带提议，由需求方确认是否接受。只有对方接受后，这件物品才会正式加入你的行李箱并扣减容量。
          </div>
        </div>

        {/* Desc */}
        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-2">需求说明</div>
          <p className="text-secondary text-[14px] leading-relaxed">{POST.desc}</p>
        </div>

        {/* Item Info */}
        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">物品信息</div>
          {[
            { label: '物品类型', value: POST.item },
            { label: '重量',     value: POST.weight },
            { label: '期望日期', value: POST.date },
            { label: '报酬',     value: POST.reward, highlight: true },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0 text-[14px]">
              <span className="text-secondary">{row.label}</span>
              <span className={`font-medium ${row.highlight ? 'text-brand font-bold' : 'text-ink'}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Publisher */}
        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">发布者</div>
          <div className="flex items-center gap-3">
            <Avatar src={POST.user.avatar} alt={POST.user.name} size="md" />
            <div>
              <div className="font-semibold text-[16px] text-ink">{POST.user.name}</div>
              <div className="text-[13px] text-muted">{POST.user.count}次帮带</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
        <button
          className="flex-1 btn-outline"
          onClick={() => navigate('/chat')}
        >
          💬 消息
        </button>
        <button
          className="flex-1 btn-primary"
          onClick={() => setModalOpen(true)}
        >
          🧳 我可以帮带
        </button>
      </div>

      {/* Proposal Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="发送帮带提议">
        <div className="space-y-4">
          <div className="bg-brand-light rounded-lg p-4">
            <div className="font-semibold text-brand text-[15px] mb-2">提议内容</div>
            <div className="flex justify-between text-[14px] mb-1 text-brand">
              <span>{POST.item}</span>
              <span className="font-bold">{POST.weight}</span>
            </div>
            <div className="text-[13px] text-brand/80">发送后会先进入私信，等待 Tom 确认是否接受。</div>
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">计划放入的行李箱</label>
            <select className="input">
              <option>慕尼黑 → 成都（当前剩余 7kg）</option>
              <option>柏林 → 上海（当前剩余 5kg）</option>
            </select>
          </div>
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">给对方的留言</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="例如：我 7 月 18 日从柏林飞上海，可以机场面交。" />
          </div>
          <button className="w-full btn-primary mt-2" onClick={sendProposal}>
            ✉️ 发送帮带提议
          </button>
        </div>
      </Modal>
    </div>
  )
}
