import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseStyles =
      'inline-flex select-none items-center justify-center rounded-full font-semibold tracking-[-0.012em] ' +
      'transition duration-200 ease-apple active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ' +
      'motion-reduce:transition-none motion-reduce:active:scale-100 [-webkit-tap-highlight-color:transparent]';

    const variants = {
      primary: 'bg-accent text-on-accent hover:bg-accent-strong',
      secondary: 'bg-fill text-ink hover:bg-line',
      outline: 'border border-line bg-surface text-ink hover:bg-fill',
      ghost: 'text-accent hover:bg-accent-soft',
      danger: 'bg-bad-soft text-bad hover:bg-bad hover:text-white',
    };

    const sizes = {
      sm: 'h-9 gap-1.5 px-4 text-[15px]',
      md: 'h-11 gap-2 px-5 text-[17px]',
      lg: 'h-[52px] gap-2.5 px-7 text-[17px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
