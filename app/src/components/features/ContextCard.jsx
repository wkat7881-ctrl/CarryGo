import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ContextCard component
 * Props: itemName, itemWeight, status ('pending'|'confirmed'|'completed'), detailLink
 * Displays order context with animated status dot and navigation link
 */
const statusConfig = {
  pending: {
    label: '等待确认',
    dotColor: 'bg-warning',
    textColor: 'text-warning',
    bg: 'bg-warning-bg border-warning/20',
  },
  confirmed: {
    label: '已确认，进行中',
    dotColor: 'bg-success',
    textColor: 'text-success',
    bg: 'bg-success-bg border-success/20',
  },
  completed: {
    label: '双方已完成',
    dotColor: 'bg-muted',
    textColor: 'text-secondary',
    bg: 'bg-surface border-border',
  },
};

export default function ContextCard({
  itemName,
  itemWeight,
  status = 'pending',
  detailLink,
  className = '',
}) {
  const navigate = useNavigate();
  const config = statusConfig[status] ?? statusConfig.pending;

  const handleViewDetail = (e) => {
    e.preventDefault();
    if (detailLink) {
      navigate(detailLink);
    }
  };

  return (
    <div
      className={`mx-4 mb-2 px-4 py-3 rounded-lg border ${config.bg} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: item name + weight */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[14px] font-semibold text-ink leading-snug truncate">
            {itemName}
          </span>
          {itemWeight != null && (
            <span className="text-[12px] text-muted">{itemWeight}kg</span>
          )}
        </div>

        {/* Right: status indicator + detail link */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Status dot + label */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotColor}`}
            />
            <span className={`text-[12px] font-medium ${config.textColor}`}>
              {config.label}
            </span>
          </div>

          {/* Detail link */}
          {detailLink && (
            <button
              onClick={handleViewDetail}
              className="text-[12px] font-medium text-brand hover:opacity-75 transition-opacity"
            >
              查看详情
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
