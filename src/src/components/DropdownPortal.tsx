import React, { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

interface DropdownPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

const VIEWPORT_MARGIN = 8;
const ANCHOR_OFFSET = 4;
const MIN_DROPDOWN_HEIGHT = 120;

export const DropdownPortal = React.forwardRef<HTMLDivElement, DropdownPortalProps>(({
  anchorRef,
  isOpen,
  children,
  className = '',
}, ref) => {
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(rect.width, viewportWidth - VIEWPORT_MARGIN * 2);
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      viewportWidth - width - VIEWPORT_MARGIN
    );
    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const shouldOpenUp = spaceBelow < MIN_DROPDOWN_HEIGHT && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      MIN_DROPDOWN_HEIGHT,
      (shouldOpenUp ? spaceAbove : spaceBelow) - ANCHOR_OFFSET
    );

    setPosition({
      left,
      width,
      maxHeight: availableHeight,
      ...(shouldOpenUp
        ? { bottom: viewportHeight - rect.top + ANCHOR_OFFSET }
        : { top: rect.bottom + ANCHOR_OFFSET }),
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  if (!isOpen || !position) return null;

  return createPortal(
    <div
      ref={ref}
      className={className}
      style={{
        position: 'fixed',
        zIndex: 10000,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        ...(position.top !== undefined ? { top: position.top } : {}),
        ...(position.bottom !== undefined ? { bottom: position.bottom } : {}),
      }}
    >
      {children}
    </div>,
    document.body
  );
});

DropdownPortal.displayName = 'DropdownPortal';
