import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * PageHeader — used on sub-pages (with back button).
 * Main tab pages render their own <h1 className="page-title"> inline.
 *
 * Props:
 *   title       - string | ReactNode
 *   showBack    - bool
 *   onBack      - function (defaults to navigate(-1))
 *   rightSlot   - ReactNode
 *   border      - bool (default true) show border-bottom
 */
export default function PageHeader({
  title,
  showBack = false,
  onBack,
  rightSlot,
  border = true,
}) {
  const navigate = useNavigate()

  function handleBack() {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className={`flex items-center h-[52px] px-2 bg-white ${border ? 'border-b border-border' : ''}`}>
      {/* Left — back button */}
      <div className="w-12 flex items-center justify-start">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-ink rounded-full active:bg-surface transition-colors"
            aria-label="返回"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Center — title */}
      <div className="flex-1 text-center">
        {typeof title === 'string' ? (
          <span className="font-semibold text-[17px] text-ink">{title}</span>
        ) : (
          title
        )}
      </div>

      {/* Right — optional slot */}
      <div className="w-12 flex items-center justify-end pr-2">
        {rightSlot}
      </div>
    </div>
  )
}
