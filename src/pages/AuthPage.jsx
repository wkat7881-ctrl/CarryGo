import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        if (!displayName.trim()) { setError('请输入昵称'); setSubmitting(false); return }
        await signUp(email, password, displayName.trim())
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    try { await signInWithGoogle() }
    catch (err) { setError(err.message || 'Google 登录失败') }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-display text-primary-600 mb-2">CarryGo</h1>
          <p className="text-body text-muted-600">跨国帮带互助平台</p>
        </div>

        <div className="card p-6">
          {/* Tab */}
          <div className="flex mb-6 bg-muted-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-white text-muted-700 shadow-sm' : 'text-muted-600'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-white text-muted-700 shadow-sm' : 'text-muted-600'
              }`}
            >
              注册
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-muted-600 mb-1.5">昵称</label>
                <input
                  type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  className="input-base" placeholder="你的昵称" required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-600 mb-1.5">邮箱</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-base" placeholder="your@email.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-600 mb-1.5">密码</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-base" placeholder="至少6位密码" required minLength={6}
              />
            </div>
            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-muted-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-muted-500">或</span></div>
          </div>

          <button onClick={handleGoogleLogin} className="btn btn-outline w-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google 登录
          </button>
        </div>
      </div>
    </div>
  )
}
