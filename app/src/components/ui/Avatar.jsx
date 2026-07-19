/**
 * Avatar
 * Props: src, alt, size ('sm'=32|'md'=40|'lg'=56|'xl'=72), className
 */
const SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-[72px] h-[72px]',
}

export default function Avatar({ src, alt = '', size = 'md', className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover flex-shrink-0 ${SIZE_MAP[size] || SIZE_MAP.md} ${className}`}
    />
  )
}
