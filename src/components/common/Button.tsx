import { Button as NextUIButton } from '@nextui-org/react';
import type { ButtonProps as NextUIButtonProps } from '@nextui-org/react';

interface ButtonProps extends NextUIButtonProps {}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <NextUIButton
      radius="md"
      {...props}
    >
      {children}
    </NextUIButton>
  );
}
