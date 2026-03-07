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
}

export function Modal({ title, children, footer, isOpen, onClose, ...props }: ModalProps) {
  return (
    <NextUIModal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      radius="lg"
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>}
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </NextUIModal>
  );
}
