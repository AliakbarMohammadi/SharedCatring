'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex">
          {leftAddon && (
            <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-secondary-200 bg-secondary-50 text-secondary-500 text-sm">
              {leftAddon}
            </span>
          )}
          <div className="relative flex-1">
            {leftIcon && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
                {leftIcon}
              </span>
            )}
            <input
              type={type}
              ref={ref}
              disabled={disabled}
              className={cn(
                `
                  w-full h-11 px-4
                  bg-white border border-secondary-200
                  rounded-xl
                  text-secondary-800 placeholder:text-secondary-400
                  transition-all duration-200
                  focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                  disabled:bg-secondary-50 disabled:cursor-not-allowed
                `,
                leftIcon && 'pr-10',
                rightIcon && 'pl-10',
                leftAddon && 'rounded-r-none',
                rightAddon && 'rounded-l-none',
                error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
                className
              )}
              {...props}
            />
            {rightIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
                {rightIcon}
              </span>
            )}
          </div>
          {rightAddon && (
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-secondary-200 bg-secondary-50 text-secondary-500 text-sm">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-secondary-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
