'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isLoadingState = isLoading || loading;
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-primary-500 text-white
        hover:bg-primary-600 active:bg-primary-700
        focus-visible:ring-primary-500
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-secondary-100 text-secondary-700
        hover:bg-secondary-200 active:bg-secondary-300
        focus-visible:ring-secondary-500
      `,
      outline: `
        border-2 border-primary-500 text-primary-600
        hover:bg-primary-50 active:bg-primary-100
        focus-visible:ring-primary-500
      `,
      ghost: `
        text-secondary-600
        hover:bg-secondary-100 active:bg-secondary-200
        focus-visible:ring-secondary-500
      `,
      danger: `
        bg-error-500 text-white
        hover:bg-error-600 active:bg-red-700
        focus-visible:ring-error-500
        shadow-sm hover:shadow-md
      `,
      success: `
        bg-success-500 text-white
        hover:bg-success-600 active:bg-green-700
        focus-visible:ring-success-500
        shadow-sm hover:shadow-md
      `,
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoadingState}
        {...props}
      >
        {isLoadingState ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoadingState && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
