import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-fifa-blue/50 text-fifa-silver',
      gold: 'bg-fifa-accent/20 text-fifa-accent border border-fifa-accent/30',
      success: 'bg-fifa-green/20 text-fifa-green border border-fifa-green/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      danger: 'bg-fifa-red/20 text-fifa-red border border-fifa-red/30',
      info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
export { Badge };
