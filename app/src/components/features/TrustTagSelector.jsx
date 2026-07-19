import React from 'react';

/**
 * TrustTagSelector component
 * Export TRUST_TAGS array and the selector component
 * Props: selected[], onChange, maxSelect, onLimitError
 */
export const TRUST_TAGS = [
  { id: 'smooth_comm', icon: '✔', label: '沟通顺畅' },
  { id: 'fast_reply',  icon: '⏰', label: '回复及时' },
  { id: 'careful_pack', icon: '📦', label: '包装认真' },
  { id: 'on_time',    icon: '🤝', label: '准时赴约' },
  { id: 'recommend',  icon: '❤️', label: '值得再次合作' },
];

export default function TrustTagSelector({
  selected = [],
  onChange,
  maxSelect = 3,
  onLimitError,
  className = '',
}) {
  const handleToggle = (tagId) => {
    const isSelected = selected.includes(tagId);

    if (!isSelected && selected.length >= maxSelect) {
      if (onLimitError) {
        onLimitError(maxSelect);
      }
      return;
    }

    const next = isSelected
      ? selected.filter((id) => id !== tagId)
      : [...selected, tagId];

    if (onChange) {
      onChange(next);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Hint text */}
      <p className="text-[12px] text-muted leading-relaxed">
        双方完成订单后才能评价 · 每个订单只能评价一次 · 最多选 {maxSelect} 个标签
      </p>

      {/* Tag buttons */}
      <div className="flex flex-wrap gap-2">
        {TRUST_TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggle(tag.id)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-[13px] font-medium border transition-all duration-150
                ${
                  isSelected
                    ? 'bg-brand text-white border-brand shadow-card'
                    : 'bg-white text-secondary border-border hover:border-brand'
                }
              `}
            >
              <span className="leading-none">{tag.icon}</span>
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      <p className="text-[12px] text-muted">
        已选 {selected.length}/{maxSelect}
      </p>
    </div>
  );
}
