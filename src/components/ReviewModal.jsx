import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { X, CheckCircle2, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'

const POSITIVE_TAGS = [
  { key: 'reliable', label: '靠谱' },
  { key: 'friendly', label: '友善' },
  { key: 'quick_response', label: '回复快' },
  { key: 'good_condition', label: '物品完好' },
]

const NEUTRAL_TAGS = [
  { key: 'okay', label: '中规中矩' },
  { key: 'average', label: '还行' },
]

const NEGATIVE_TAGS = [
  { key: 'unreliable', label: '放鸽子' },
  { key: 'unfriendly', label: '态度恶劣' },
  { key: 'delayed', label: '严重超时' },
]

function getTags(satisfaction) {
  if (satisfaction === 1) return POSITIVE_TAGS
  if (satisfaction === -1) return NEGATIVE_TAGS
  return NEUTRAL_TAGS
}

function getStep2Title(satisfaction) {
  if (satisfaction === 1) return '选择好评标签'
  if (satisfaction === -1) return '选择差评标签'
  return '选择标签'
}

const selectedStyle = 'bg-purple-100 text-purple-800 border-purple-300 ring-1 ring-purple-300'
const unselectedStyle = 'bg-muted-50 text-muted-600 border-muted-200 hover:border-purple-200 hover:bg-purple-50'

export default function ReviewModal({ open, onClose, targetUserId, targetUserName }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [satisfaction, setSatisfaction] = useState(null) // 1 | 0 | -1
  const [selectedTags, setSelectedTags] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const currentTags = getTags(satisfaction)

  function toggleTag(key) {
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    )
  }

  function goToTags(sat) {
    setSatisfaction(sat)
    setSelectedTags([])
    setStep(2)
  }

  function goBack() {
    setStep(1)
    setSatisfaction(null)
    setSelectedTags([])
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (selectedTags.length === 0) { setError('请至少选择一个标签'); return }
    if (!user || user.id === targetUserId) { setError('无法评价自己'); return }
    setSubmitting(true)
    const { error: submitError } = await supabase.from('user_reviews').insert({
      reviewer_id: user.id,
      target_id: targetUserId,
      selected_tags: selectedTags,
      satisfaction_level: satisfaction,
    })
    if (submitError) {
      setError(submitError.code === '23505' ? '你已经评价过该用户了' : submitError.message)
      setSubmitting(false)
    } else {
      setSuccess(true)
      setTimeout(() => { reset(); onClose() }, 1500)
    }
  }

  function reset() {
    setStep(1)
    setSatisfaction(null)
    setSelectedTags([])
    setSuccess(false)
    setError('')
  }

  function handleClose() {
    if (!submitting) { reset(); onClose() }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[85vh] overflow-y-auto p-6 shadow-xl">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-heading text-muted-700 mb-1">评价成功！</p>
            <p className="text-sm text-muted-500">
              {satisfaction === 1 ? '感谢你的好评' : satisfaction === -1 ? '感谢你的反馈' : '感谢你的反馈'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-heading text-muted-700">
                {step === 1 ? `评价 ${targetUserName}` : getStep2Title(satisfaction)}
              </h3>
              <button onClick={handleClose} className="text-muted-500 hover:text-muted-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Step 1: 满意 / 一般 / 不满意 ── */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-500 mb-2">你与 {targetUserName} 的合作体验如何？</p>

                <button
                  type="button"
                  onClick={() => goToTags(1)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                >
                  <span className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <ThumbsUp className="w-4.5 h-4.5 text-emerald-600" />
                  </span>
                  <div>
                    <span className="font-semibold text-emerald-700 text-sm block">满意</span>
                    <span className="text-xs text-emerald-600">合作愉快，值得信赖</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => goToTags(0)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                >
                  <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Minus className="w-4.5 h-4.5 text-amber-600" />
                  </span>
                  <div>
                    <span className="font-semibold text-amber-700 text-sm block">一般</span>
                    <span className="text-xs text-amber-600">不好不坏</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => goToTags(-1)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left"
                >
                  <span className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <ThumbsDown className="w-4.5 h-4.5 text-red-600" />
                  </span>
                  <div>
                    <span className="font-semibold text-red-700 text-sm block">不满意</span>
                    <span className="text-xs text-red-600">体验不佳</span>
                  </div>
                </button>
              </div>
            )}

            {/* ── Step 2: 选标签 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <button type="button" onClick={goBack}
                  className="text-xs text-muted-500 hover:text-muted-600 transition-colors">
                  ← 返回重新选择
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  {currentTags.map(({ key, label }) => {
                    const selected = selectedTags.includes(key)
                    return (
                      <button key={key} type="button" onClick={() => toggleTag(key)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          selected ? selectedStyle : unselectedStyle
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

                <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                  {submitting ? '提交中...' : '提交评价'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
