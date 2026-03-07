import { Input as NextUIInput } from '@nextui-org/react';
import type { InputProps as NextUIInputProps } from '@nextui-org/react';

interface InputProps extends NextUIInputProps {}

export function Input({ ...props }: InputProps) {
  return (
    <NextUIInput
      radius="md"
      {...props}
    />
  );
}
