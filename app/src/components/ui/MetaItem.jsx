import React from 'react';

/**
 * MetaItem component
 * Props: icon (ReactNode), text (string)
 * Small chip: surface background, secondary text, 12px, rounded-md
 */
export default function MetaItem({ icon, text, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface text-secondary text-[12px] font-normal ${className}`}
    >
      {icon && (
        <span className="flex-shrink-0 leading-none text-[12px]">{icon}</span>
      )}
      {text}
    </span>
  );
}
