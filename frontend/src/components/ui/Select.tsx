'use client';

import { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'انتخاب کنید',
      label,
      error,
      disabled,
      className,
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
        <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              `
                w-full h-11 px-4
                flex items-center justify-between gap-2
                bg-white border border-secondary-200
                rounded-xl
                text-secondary-800
                transition-all duration-200
                focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                disabled:bg-secondary-50 disabled:cursor-not-allowed
                data-[placeholder]:text-secondary-400
              `,
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="w-4 h-4 text-secondary-400" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="
                overflow-hidden bg-white rounded-xl shadow-soft-lg border border-secondary-100
                animate-slide-down z-50
              "
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="
                      relative flex items-center h-10 px-8 pr-3
                      text-sm text-secondary-700
                      rounded-lg cursor-pointer
                      outline-none
                      data-[highlighted]:bg-primary-50 data-[highlighted]:text-primary-700
                      data-[disabled]:text-secondary-300 data-[disabled]:cursor-not-allowed
                    "
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute left-2">
                      <Check className="w-4 h-4 text-primary-500" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
