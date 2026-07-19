import { USERS, getCurrentUserId, setCurrentUserId } from '../../utils/auth'

export default function UserSwitcher() {
  const current = getCurrentUserId()
  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur rounded-lg shadow-lg border border-brand/20 p-2 flex items-center gap-2">
      <span className="text-[12px] font-semibold text-brand">当前身份:</span>
      <select 
        className="bg-brand-light text-brand text-[12px] font-semibold rounded border border-brand/20 px-2 py-1 outline-none"
        value={current}
        onChange={e => setCurrentUserId(e.target.value)}
      >
        {USERS.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  )
}
