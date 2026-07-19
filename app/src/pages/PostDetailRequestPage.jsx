import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomTabBar from '../components/layout/BottomTabBar'
import PageHeader from '../components/layout/PageHeader'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/layout/Modal'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../supabase/client'
import { getPostById, createPost } from '../services/posts'
import { createTrade } from '../services/orders'
import { getOrCreateConversation, sendMessage } from '../services/messages'

import { getCurrentUserId } from '../utils/auth'
const CURRENT_USER_ID = getCurrentUserId()

export default function PostDetailRequestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [post, setPost] = useState(null)
  const [suitcases, setSuitcases] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSuitcaseId, setSelectedSuitcaseId] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Inline suitcase creation state
  const [isCreatingSuitcase, setIsCreatingSuitcase] = useState(false)
  const [newDeparture, setNewDeparture] = useState('')
  const [newArrival, setNewArrival] = useState('')
  const [newWeight, setNewWeight] = useState(15)

  useEffect(() => {
    async function loadData() {
      try {
        const postData = await getPostById(id)
        setPost(postData)

        // Fetch current user's suitcases (both public and private)
        const { data: suitcaseData, error: suitcaseError } = await supabase
          .from('posts')
          .select(`
            *,
            trades:trades!trades_carrier_post_id_fkey(*)
          `)
          .eq('user_id', CURRENT_USER_ID)
          .eq('type', 'provide')

        if (suitcaseError) throw suitcaseError
        setSuitcases(suitcaseData || [])
        if (suitcaseData && suitcaseData.length > 0) {
          setSelectedSuitcaseId(suitcaseData[0].id)
        } else {
          setIsCreatingSuitcase(true) // Force creation if no suitcases
        }
        setNewDeparture(postData.departure)
        setNewArrival(postData.arrival)
      } catch (err) {
        showToast('加载失败', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  async function sendProposal() {
    if (!isCreatingSuitcase && !selectedSuitcaseId) {
      showToast('请选择要放入的行李箱', 'error')
      return
    }

    setSubmitting(true)
    try {
      let finalSuitcaseId = selectedSuitcaseId

      if (isCreatingSuitcase) {
        // Create the private suitcase first
        const newSuitcase = await createPost({
          user_id: CURRENT_USER_ID,
          type: 'provide',
          departure: newDeparture,
          arrival: newArrival,
          weight: newWeight,
          is_active: false, // Private by default
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        finalSuitcaseId = newSuitcase.id
      }

      // Create a pending trade
      const trade = await createTrade({
        post_id: post.id,
        carrier_post_id: finalSuitcaseId,
        carrier_id: CURRENT_USER_ID,
        shipper_id: post.user_id,
        item_name: post.item_name,
        item_weight: Number(post.weight),
        status: 'pending'
      })

      // Find or create conversation
      const conv = await getOrCreateConversation(post.id, CURRENT_USER_ID, post.user_id)
      
      // Send initial message
      const sysMsg = `🔔 发起了帮带提议：[${post.item_name}] (${post.weight}kg)。留言：${note || '无'}`
      await sendMessage(conv.id, CURRENT_USER_ID, sysMsg, 'system')
      
      showToast('提议已发出，等待对方确认', 'success')
      setModalOpen(false)
      navigate(`/chat/proposal/${conv.id}`)
    } catch (err) {
      showToast('提议发送失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !post) {
    return <div className="flex-1 bg-surface flex items-center justify-center text-muted">加载中...</div>
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <PageHeader title="寻求帮带" showBack onBack={() => navigate('/')} />

      <div className="flex-1 overflow-y-auto pb-36 scrollbar-hide px-5 pt-3">
        <div className="mb-4">
          <div className="inline-block px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-amber-50 text-amber-600">📦 寻求帮带</div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-[24px] font-bold text-ink">{post.departure}</span>
          <span className="text-brand text-[24px] font-bold">→</span>
          <span className="text-[24px] font-bold text-ink">{post.arrival}</span>
        </div>

        <div className="rounded-lg bg-brand-light text-brand p-4 mb-4">
          <div className="font-semibold mb-1 text-[15px]">这是一条寻求帮带帖子</div>
          <div className="text-[13px] leading-relaxed">
            你可以先发送一条帮带提议，由需求方确认是否接受。只有对方接受后，这件物品才会正式加入你的行李箱并扣减容量。
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-2">需求说明</div>
          <p className="text-secondary text-[14px] leading-relaxed">{post.item_desc || '暂无详细说明'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">物品信息</div>
          {[
            { label: '物品类型', value: post.item_name },
            { label: '重量',     value: `${post.weight}kg` },
            { label: '期望日期', value: post.date },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0 text-[14px]">
              <span className="text-secondary">{row.label}</span>
              <span className={`font-medium text-ink`}>{row.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-card p-5 mb-3">
          <div className="font-semibold text-ink text-[15px] mb-3">发布者</div>
          <div className="flex items-center gap-3">
            <Avatar src={post.user.avatar_url} alt={post.user.name} size="md" />
            <div>
              <div className="font-semibold text-[16px] text-ink">{post.user.name}</div>
              <div className="text-[13px] text-muted">历史帮带记录</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {post.user_id !== CURRENT_USER_ID && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-5 py-4 flex gap-3 z-10 pb-8">
          <button className="flex-1 btn-outline" onClick={async () => {
            const conv = await getOrCreateConversation(post.id, CURRENT_USER_ID, post.user_id)
            navigate(`/chat/proposal/${conv.id}`)
          }}>
            💬 消息
          </button>
          <button className="flex-1 btn-primary" onClick={() => setModalOpen(true)}>
            🧳 我可以帮带
          </button>
        </div>
      )}

      {/* Proposal Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="发送帮带提议">
        <div className="space-y-4">
          <div className="bg-brand-light rounded-lg p-4">
            <div className="font-semibold text-brand text-[15px] mb-2">提议内容</div>
            <div className="flex justify-between text-[14px] mb-1 text-brand">
              <span>{post.item_name}</span>
              <span className="font-bold">{post.weight}kg</span>
            </div>
            <div className="text-[13px] text-brand/80">发送后会先进入私信，等待对方确认是否接受。</div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[14px] font-semibold text-ink">计划放入的行李箱</label>
              {suitcases.length > 0 && (
                <button onClick={() => setIsCreatingSuitcase(!isCreatingSuitcase)} className="text-[12px] text-brand font-medium">
                  {isCreatingSuitcase ? '使用现有行李箱' : '➕ 新建行李箱'}
                </button>
              )}
            </div>

            {isCreatingSuitcase ? (
              <div className="bg-surface p-3 rounded-lg space-y-3 border border-border">
                <div className="text-[12px] text-secondary mb-2">将为你创建一个<span className="font-semibold text-brand">私人行李箱</span>专门管理此单：</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-muted mb-1">出发地</label>
                    <input className="input w-full text-[13px] py-1.5" value={newDeparture} onChange={e => setNewDeparture(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] text-muted mb-1">目的地</label>
                    <input className="input w-full text-[13px] py-1.5" value={newArrival} onChange={e => setNewArrival(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-muted mb-1">总容量 (kg)</label>
                  <input type="number" className="input w-full text-[13px] py-1.5" value={newWeight} onChange={e => setNewWeight(Number(e.target.value))} />
                </div>
              </div>
            ) : (
              <select className="input w-full" value={selectedSuitcaseId} onChange={e => setSelectedSuitcaseId(e.target.value)}>
                {suitcases.map(s => {
                  const used = s.trades?.filter(t => t.status === 'confirmed' || t.status === 'pending').reduce((sum, t) => sum + t.item_weight, 0) || 0
                  return (
                    <option key={s.id} value={s.id}>
                      {s.departure} → {s.arrival} (剩余 {s.weight - used}kg)
                    </option>
                  )
                })}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-[14px] font-semibold text-ink mb-2">给对方的留言</label>
            <textarea className="input w-full min-h-[80px] resize-none" value={note} onChange={e => setNote(e.target.value)} placeholder="例如：我这几天就飞，可以机场面交。" />
          </div>
          
          <button className="w-full btn-primary mt-2 disabled:opacity-50" onClick={sendProposal} disabled={submitting || suitcases.length === 0}>
            {submitting ? '发送中...' : '✉️ 发送帮带提议'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
