import React from 'react';

/**
 * CapacityBar component
 * Props: used (number), total (number)
 * Shows luggage capacity with a thin progress bar
 */
export default function CapacityBar({ used = 0, total = 20, className = '' }) {
  const safeUsed = Math.min(Math.max(used, 0), total);
  const remaining = total - safeUsed;
  const percent = total > 0 ? (safeUsed / total) * 100 : 0;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-secondary">行李容量</span>
        <span className="text-[13px] font-semibold text-ink">
          {safeUsed}/{total}kg
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Caption */}
      <span className="text-[12px] text-muted">
        剩余 {remaining}kg 可用
      </span>
    </div>
  );
}
