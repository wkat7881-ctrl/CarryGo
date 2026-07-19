import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Modal — bottom sheet, Zenjob-inspired clean style.
 * Props: isOpen, onClose, title, children
 */
export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white rounded-t-[20px] z-[201] transition-transform duration-300 max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-border rounded-pill" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
          <span className="font-semibold text-[17px] text-ink">{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center hover:bg-border transition-colors"
            aria-label="关闭"
          >
            <X size={16} strokeWidth={2} className="text-secondary" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-5 py-5 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </>
  )
}
