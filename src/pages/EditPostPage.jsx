import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CityInput from '../components/CityInput'
import { Plane, Package, AlertTriangle, Ban, ArrowLeft } from 'lucide-react'

const PROHIBITED_ITEMS = [
  '液体类（酒、饮料、化妆品等超出100ml的液体）',
  '电池及含电池物品（充电宝、笔记本电脑等）',
  '易燃易爆品（打火机、火柴、喷雾等）',
  '肉类、新鲜蔬果等需检疫食品',
  '药品（无处方或海关许可）',
  '贵重物品（现金、珠宝、护照等）',
  '违禁出版物及音像制品',
]

export default function EditPostPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'provide_help', departure_city: '', arrival_city: '',
    flight_date: '', weight_kg: '', description: '', expected_fee: '',
  })

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    const { data, error: fetchError } = await supabase.from('posts').select('*').eq('id', id).single()
    if (fetchError || !data) { navigate('/'); return }
    if (data.user_id !== user?.id) { navigate(`/post/${id}`); return }
    setForm({
      type: data.type, departure_city: data.departure_city, arrival_city: data.arrival_city,
      flight_date: data.flight_date,
      weight_kg: data.weight_kg ? String(data.weight_kg) : '',
      description: data.description, expected_fee: data.expected_fee || '',
    })
    setLoading(false)
  }

  function updateField(field, value) { setForm((prev) => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.arrival_city || !form.flight_date || !form.description) {
      setError('请填写所有必填字段'); return
    }
    if (form.type === 'provide_help' && !form.departure_city) {
      setError('「可帮带」需填写出发城市'); return
    }
    setSubmitting(true)
    const { error: submitError } = await supabase.from('posts').update({
      type: form.type, departure_city: form.departure_city || '国内', arrival_city: form.arrival_city,
      flight_date: form.flight_date,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      description: form.description, expected_fee: form.expected_fee || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (submitError) { setError(submitError.message); setSubmitting(false) }
    else navigate(`/post/${id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Link to={`/post/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-500 hover:text-muted-600 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回帖子
      </Link>

      <h2 className="text-heading text-muted-700 mb-5">编辑帖子</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-muted-600 mb-2">身份选择</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button"
              onClick={() => updateField('type', 'provide_help')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                form.type === 'provide_help' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-muted-200 text-muted-600 hover:border-muted-300'
              }`}
            >
              <Plane className="w-4 h-4" /> 我能帮带
            </button>
            <button type="button"
              onClick={() => updateField('type', 'need_help')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                form.type === 'need_help' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-muted-200 text-muted-600 hover:border-muted-300'
              }`}
            >
              <Package className="w-4 h-4" /> 我求帮带
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">
              {form.type === 'provide_help' ? '出发城市 *' : '国内城市'}
            </label>
            <CityInput value={form.departure_city} onChange={(v) => updateField('departure_city', v)}
              placeholder={form.type === 'provide_help' ? '搜索或输入城市...' : '如：北京（可省略）'} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">到达城市 *</label>
            <CityInput value={form.arrival_city} onChange={(v) => updateField('arrival_city', v)}
              placeholder={form.type === 'provide_help' ? '搜索或输入城市...' : '如：柏林'} className="input-base" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">航班日期 *</label>
            <input type="date" value={form.flight_date} onChange={(e) => updateField('flight_date', e.target.value)}
              className="input-base" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">重量 (kg)</label>
            <input type="number" value={form.weight_kg} onChange={(e) => updateField('weight_kg', e.target.value)}
              placeholder="如：5" step="0.5" min="0" className="input-base" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-600 mb-1.5">物品描述 *</label>
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)}
            rows={4} required className="input-base h-auto py-3 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-600 mb-1.5">期望报酬（选填）</label>
          <input type="text" value={form.expected_fee} onChange={(e) => updateField('expected_fee', e.target.value)}
            placeholder="如：每公斤8欧 / 整箱30欧 / 面议" className="input-base" />
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">免责声明</p>
            <p>CarryGo 仅为信息撮合平台，不参与任何资金交易。</p>
          </div>
        </div>

        <details className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-800">
          <summary className="font-semibold cursor-pointer flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" /> 常见海关违禁品（点击展开）
          </summary>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {PROHIBITED_ITEMS.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-2">请确保所带物品符合出发国和到达国海关规定。</p>
        </details>

        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full h-12 text-base">
          {submitting ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  )
}
