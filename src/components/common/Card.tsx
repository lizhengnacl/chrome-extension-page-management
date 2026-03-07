import { Card as NextUICard, CardHeader, CardBody, CardFooter } from '@nextui-org/react';
import type { CardProps as NextUICardProps } from '@nextui-org/react';

interface CardProps extends NextUICardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ header, footer, children, ...props }: CardProps) {
  return (
    <NextUICard radius="lg" {...props}>
      {header && <CardHeader>{header}</CardHeader>}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </NextUICard>
  );
}
