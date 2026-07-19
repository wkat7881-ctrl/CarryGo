import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import { Camera, Mail } from 'lucide-react'

export default function EditProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('图片大小不能超过 2MB'); return }
    setUploading(true)
    setError('')
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
    if (uploadError) { setError('上传失败：' + uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    try { await updateProfile({ avatar_url: urlData.publicUrl }) }
    catch (err) { setError('更新头像失败：' + err.message) }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!displayName.trim()) { setError('昵称不能为空'); return }
    setSaving(true); setError('')
    try { await updateProfile({ display_name: displayName.trim(), bio: bio.trim() }); navigate('/profile/me') }
    catch (err) { setError(err.message || '保存失败') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <h2 className="text-heading text-muted-700 mb-5">编辑资料</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group" disabled={uploading}>
              <Avatar src={profile?.avatar_url} name={displayName} size="xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <p className="text-caption text-muted-500">{uploading ? '上传中...' : '点击头像更换，≤2MB'}</p>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 bg-muted-50 rounded-xl p-3">
            <Mail className="w-4 h-4 text-muted-500" />
            <div>
              <p className="text-caption text-muted-500">注册邮箱</p>
              <p className="text-sm font-medium text-muted-600">{user?.email || '未知'}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">昵称</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="input-base" placeholder="你的昵称" required />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-muted-600 mb-1.5">个人简介</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              className="input-base h-auto py-3 resize-none" placeholder="介绍一下你自己..." rows={3} />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={saving} className="btn btn-primary w-full h-12 text-base">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
