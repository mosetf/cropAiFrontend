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
  const variantStyles = {
    default: 'bg-white',
    primary: 'bg-primary-50 border-primary-200',
    secondary: 'bg-neutral-50',
  };
  
  const iconColorStyles = {
    default: 'text-neutral-600',
    primary: 'text-primary-600',
    secondary: 'text-neutral-600',
  };
  
  const content = (
    <div className={`flex flex-col space-y-3 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <span className={`flex-shrink-0 ${iconColorStyles[variant]}`}>{icon}</span>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
  
  if (href) {
    return (
      <Link href={href}>
        <Card hover className={variantStyles[variant]}>
          {content}
        </Card>
      </Link>
    );
  }
  
  if (onClick) {
    return (
      <Card 
        hover 
        className={`cursor-pointer ${variantStyles[variant]}`}
        onClick={onClick}
      >
        {content}
      </Card>
    );
  }
  
  return (
    <Card className={variantStyles[variant]}>
      {content}
    </Card>
  );
};

export default StatCard;
