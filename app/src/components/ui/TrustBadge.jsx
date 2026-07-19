import React from 'react';

/**
 * TrustBadge component
 * Props: icon (ReactNode), label (string)
 * Style: inline pill with brand-light background and brand text
 */
export default function TrustBadge({ icon, label, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-brand-light text-brand ${className}`}
    >
      {icon && <span className="flex-shrink-0 leading-none">{icon}</span>}
      {label}
    </span>
  );
}
