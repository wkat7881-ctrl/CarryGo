import React from 'react';

/**
 * StatusTag component
 * Statuses: confirmed, pending, completed
 */
const statusConfig = {
  confirmed: {
    bg: 'bg-success-bg',
    text: 'text-success',
    label: '已确认',
  },
  pending: {
    bg: 'bg-warning-bg',
    text: 'text-warning',
    label: '待确认',
  },
  completed: {
    bg: 'bg-surface',
    text: 'text-secondary',
    label: '已完成',
  },
};

export default function StatusTag({ status = 'pending', label, className = '' }) {
  const config = statusConfig[status] ?? statusConfig.pending;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[12px] font-medium leading-none ${config.bg} ${config.text} ${className}`}
      style={{ borderRadius: '6px' }}
    >
      {displayLabel}
    </span>
  );
}
