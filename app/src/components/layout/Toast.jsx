import { useToast } from '../../contexts/ToastContext'

const TYPE_STYLES = {
  success: 'bg-ink text-white',
  error:   'bg-danger text-white',
  info:    'bg-ink text-white',
}

export default function Toast() {
  const { toast } = useToast()

  return (
    <div
      className={`
        fixed top-14 left-1/2 -translate-x-1/2 z-[300]
        px-5 py-3 rounded-pill shadow-float
        text-[14px] font-medium whitespace-nowrap
        transition-all duration-300
        ${TYPE_STYLES[toast.type] || TYPE_STYLES.info}
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
      `}
      role="alert"
      aria-live="polite"
    >
      {toast.message}
    </div>
  )
}
