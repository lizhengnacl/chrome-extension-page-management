import { Chip } from '@nextui-org/react';
import type { ChipProps } from '@nextui-org/react';
import { getAccessibleTextColor } from '../../utils/colors';

interface TagProps extends Omit<ChipProps, 'color'> {
  color?: string;
}

export function Tag({ color, children, ...props }: TagProps) {
  const textColor = color ? getAccessibleTextColor(color) : undefined;

  return (
    <Chip
      radius="md"
      variant="solid"
      style={color ? { backgroundColor: color, color: textColor } : undefined}
      {...props}
    >
      {children}
    </Chip>
  );
}
