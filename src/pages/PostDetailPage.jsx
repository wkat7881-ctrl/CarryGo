import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { ArrowLeft, Plane, Package, Calendar, Banknote, MessageCircle, Pencil, Trash2, AlertTriangle, ArrowRight } from 'lucide-react'

export default function PostDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fulfilling, setFulfilling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(display_name, avatar_url, bio)')
      .eq('id', id)
      .single()
    if (!error && data) setPost(data)
    setLoading(false)
  }

  async function markFulfilled() {
    if (!confirm(actionLabels.confirm)) return
    setFulfilling(true)
    const { error } = await supabase
      .from('posts').update({ status: 'fulfilled', updated_at: new Date().toISOString() }).eq('id', id)
    if (!error) setPost({ ...post, status: 'fulfilled' })
    setFulfilling(false)
  }

  async function markActive() {
    setFulfilling(true)
    const { error } = await supabase
      .from('posts').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', id)
    if (!error) setPost({ ...post, status: 'active' })
    setFulfilling(false)
  }

  async function handleDelete() {
    if (!confirm('确定要删除这个帖子吗？此操作不可撤销。')) return
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (!error) navigate('/')
    else { alert('删除失败：' + error.message); setDeleting(false) }
  }

  function handleContact() {
    if (!user) { navigate('/auth', { state: { from: { pathname: `/post/${id}` } } }); return }
    if (user.id === post.user_id) return
    navigate(`/messages/${post.user_id}?postId=${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-500 font-medium">帖子不存在或已被删除</p>
        <Link to="/" className="text-primary-600 text-sm mt-2 inline-block font-medium">返回首页</Link>
      </div>
    )
  }

  const isOwner = user?.id === post.user_id
  const isFulfilled = post.status === 'fulfilled'
  const isProvide = post.type === 'provide_help'

  const statusLabels = isProvide
    ? { active: '可接单', fulfilled: '已满' }
    : { active: '有效', fulfilled: '已找到人' }
  const statusLabel = isFulfilled ? statusLabels.fulfilled : statusLabels.active
  const actionLabels = isProvide
    ? { mark: '标记为已满', unmark: '重新开放接单', confirm: '确定标记为"已满"吗？' }
    : { mark: '标记为已找到人', unmark: '重新激活帖子', confirm: '确定标记为"已找到人"吗？' }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-500 hover:text-muted-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>

      <div className={`card p-6 ${isFulfilled ? 'opacity-50' : ''}`}>
        {/* Status badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className={isProvide ? 'tag tag-provide' : 'tag tag-request'}>
            <Plane className="w-3 h-3" />
            {isProvide ? '可帮带' : '求帮带'}
          </span>
          <span className={isFulfilled ? 'tag tag-fulfilled' : 'tag tag-active'}>
            {statusLabel}
          </span>
        </div>

        {/* Route — BIG */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[1.375rem] font-bold text-muted-700">{post.departure_city}</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-400" />
            <div className="w-8 h-px bg-muted-400" />
            <ArrowRight className="w-5 h-5 text-muted-500" strokeWidth={1.5} />
          </div>
          <span className="text-[1.375rem] font-bold text-muted-700">{post.arrival_city}</span>
        </div>

        {/* Poster info */}
        <div className="flex items-center gap-3 py-3 border-t border-muted-200 mb-4">
          <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80">
            <Avatar src={post.profiles?.avatar_url} name={post.profiles?.display_name} size="lg" />
            <div>
              <p className="text-sm font-semibold text-muted-700">{post.profiles?.display_name || '匿名用户'}</p>
              <p className="text-xs text-muted-500">
                {new Date(post.created_at).toLocaleDateString('zh-CN')} 发布
              </p>
            </div>
          </Link>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-muted-50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              航班日期
            </div>
            <p className="font-semibold text-sm text-muted-700">{post.flight_date}</p>
          </div>
          <div className="bg-muted-50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-500 mb-1">
              <Package className="w-3.5 h-3.5" />
              重量/额度
            </div>
            <p className="font-semibold text-sm text-muted-700">{post.weight_kg ? `${post.weight_kg} kg` : '未指定'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-muted-500 uppercase tracking-wide mb-2">详细描述</h3>
          <p className="text-body text-muted-600 whitespace-pre-wrap leading-relaxed">{post.description}</p>
        </div>

        {/* Expected fee */}
        {post.expected_fee && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-muted-500 uppercase tracking-wide mb-2">期望报酬</h3>
            <div className="flex items-center gap-2 text-muted-700">
              <Banknote className="w-4 h-4 text-muted-500" />
              <span className="font-medium">{post.expected_fee}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2.5 pt-4 border-t border-muted-200">
          {isOwner ? (
            <>
              <button
                onClick={isFulfilled ? markActive : markFulfilled}
                disabled={fulfilling}
                className={`btn w-full ${isFulfilled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'btn-outline'}`}
              >
                {fulfilling ? '处理中...' : isFulfilled ? actionLabels.unmark : actionLabels.mark}
              </button>
              <div className="flex gap-2">
                <Link to={`/post/${id}/edit`} className="btn btn-outline flex-1">
                  <Pencil className="w-4 h-4" />
                  编辑
                </Link>
                <button onClick={handleDelete} disabled={deleting} className="btn flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                  <Trash2 className="w-4 h-4" />
                  {deleting ? '删除中...' : '删除'}
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={handleContact} className="btn btn-primary w-full">
                <MessageCircle className="w-4 h-4" />
                联系 {post.profiles?.display_name || 'TA'}
              </button>
            </>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-2 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>CarryGo 不参与交易，价格与交接由双方自行协商。请注意安全。</span>
        </div>
      </div>

    </div>
  )
}
