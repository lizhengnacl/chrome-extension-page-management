import { Input as NextUIInput } from '@nextui-org/react';
import type { InputProps as NextUIInputProps } from '@nextui-org/react';

interface InputProps extends NextUIInputProps {}

export function Input({ className, classNames, ...props }: InputProps) {
  return (
    <NextUIInput
      radius="lg"
      className={`transition-all duration-200 ${className || ''}`}
      classNames={{
        input: 'text-text-primary placeholder-text-muted',
        inputWrapper: 'bg-background-tertiary/30 border border-border/50 data-[hover=true]:border-primary-500/50 data-[focus=true]:border-primary-500',
        label: 'text-text-secondary',
        ...classNames,
      }}
      {...props}
    />
  );
}
