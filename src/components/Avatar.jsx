import { useState } from 'react'

/**
 * Avatar component with image support and fallback to initials.
 * @param {{ src?: string, name?: string, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }} props
 */
export default function Avatar({ src, name, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-16 h-16 text-2xl',
  }

  const initial = (name || '?')[0].toUpperCase()

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0 ${className}`}
    >
      {initial}
    </div>
  )
}
