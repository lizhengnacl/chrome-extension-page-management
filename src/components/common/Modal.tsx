import {
  Modal as NextUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import type { ModalProps as NextUIModalProps } from '@nextui-org/react';

interface ModalProps extends Omit<NextUIModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  classNames?: {
    base?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
}

export function Modal({ title, children, footer, isOpen, onClose, classNames, ...props }: ModalProps) {
  return (
    <NextUIModal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      radius="xl"
      classNames={{
        base: 'bg-background-secondary border border-border/50',
        header: `border-b border-border/50 ${classNames?.header || ''}`,
        body: `text-text-primary ${classNames?.body || ''}`,
        footer: `border-t border-border/50 ${classNames?.footer || ''}`,
        backdrop: 'bg-black/70 backdrop-blur-sm',
        ...classNames,
      }}
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && <ModalHeader className="flex flex-col gap-1 text-text-primary font-bold text-xl">{title}</ModalHeader>}
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </NextUIModal>
  );
}
