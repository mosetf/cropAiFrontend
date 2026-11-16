import React from 'react';
import Link from 'next/link';
import Card from './Card';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  description,
  trend,
  href,
  onClick,
  variant = 'default',
}) => {
  const tone = {
    default: 'bg-fill text-ink-2',
    primary: 'bg-accent-soft text-accent',
    secondary: 'bg-fill text-ink-2',
  }[variant];

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span aria-hidden="true" className={`grid h-9 w-9 place-items-center rounded-[10px] ${tone}`}>
          {icon}
        </span>
        {trend && (
          <span className={`text-[14px] font-semibold ${trend.isPositive ? 'text-good' : 'text-bad'}`}>
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-3">{label}</p>
        <p className="num mt-1 text-[34px] font-bold leading-none tracking-[-0.035em] text-ink">{value}</p>
        {description && <p className="mt-2 text-[15px] text-ink-2">{description}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card hover>{content}</Card>
      </Link>
    );
  }

  return (
    <Card hover={!!onClick} onClick={onClick}>
      {content}
    </Card>
  );
};

export default StatCard;
