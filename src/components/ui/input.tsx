import { type InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-fifa-silver">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fifa-gray" aria-hidden="true">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'w-full rounded-xl border border-glass-border bg-white/5 px-4 py-2.5 text-fifa-white',
              'placeholder:text-fifa-gray/60',
              'focus:outline-none focus:ring-2 focus:ring-fifa-accent/50 focus:border-fifa-accent',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-fifa-red focus:ring-fifa-red/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p id={errorId} className="text-sm text-fifa-red" role="alert">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
