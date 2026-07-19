import React from 'react';

/**
 * Badge component
 * Variants: provide (purple), seek (amber), default (gray)
 */
const variantStyles = {
  provide: 'bg-brand-light text-brand border border-brand/20',
  seek: 'bg-amber-50 text-amber-600 border border-amber-200',
  default: 'bg-surface text-secondary border border-border',
};

const variantLabels = {
  provide: '我来携带',
  seek: '我要寄送',
};

export default function Badge({ variant = 'default', label, className = '' }) {
  const styles = variantStyles[variant] ?? variantStyles.default;
  const displayLabel = label ?? variantLabels[variant] ?? variant;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-none ${styles} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
