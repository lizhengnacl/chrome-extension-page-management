import { Button as NextUIButton } from '@nextui-org/react';
import type { ButtonProps as NextUIButtonProps } from '@nextui-org/react';

interface ButtonProps extends NextUIButtonProps {}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <NextUIButton
      radius="lg"
      className={`transition-all duration-200 ${className || ''}`}
      {...props}
    >
      {children}
    </NextUIButton>
  );
}
