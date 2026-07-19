import React from 'react';

/**
 * InfoRow component
 * Props: label (string), value (string | ReactNode), noBorder (bool)
 * Label: 13px secondary, fixed width. Value: 15px medium ink.
 */
export default function InfoRow({ label, value, noBorder = false, className = '' }) {
  return (
    <div
      className={`flex items-center py-4 ${
        noBorder ? '' : 'border-b border-border'
      } ${className}`}
    >
      <span className="w-20 flex-shrink-0 text-[13px] text-secondary">
        {label}
      </span>
      <span className="flex-1 text-[15px] font-medium text-ink">
        {value}
      </span>
    </div>
  );
}
