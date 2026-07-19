import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * RouteDisplay component
 * Props: from (string), to (string), size ('sm' | 'md' | 'lg')
 * Clean black bold text with brand-purple arrow
 */
const sizeConfig = {
  sm: {
    text: 'text-[14px]',
    icon: 14,
    gap: 'gap-1.5',
  },
  md: {
    text: 'text-[16px]',
    icon: 16,
    gap: 'gap-2',
  },
  lg: {
    text: 'text-[20px]',
    icon: 20,
    gap: 'gap-2.5',
  },
};

export default function RouteDisplay({ from, to, size = 'md', className = '' }) {
  const config = sizeConfig[size] ?? sizeConfig.md;

  return (
    <div className={`inline-flex items-center ${config.gap} ${className}`}>
      <span className={`font-bold text-ink ${config.text}`}>{from}</span>
      <ArrowRight
        size={config.icon}
        className="text-brand flex-shrink-0"
        strokeWidth={2.5}
      />
      <span className={`font-bold text-ink ${config.text}`}>{to}</span>
    </div>
  );
}
