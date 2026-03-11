/**
 * Toast提示组件
 * 用于显示操作成功/失败的提示信息
 */

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-fade-in z-[9999] ${styles[type]}`}>
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
};

/** Toast容器，管理多个Toast */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; props: ToastProps }>>([]);

  const showToast = (props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, props }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 暴露全局方法
  (window as any).showToast = showToast;

  return (
    <>
      {toasts.map(({ id, props }) => (
        <div key={id} className="toast-item">
          <Toast
            {...props}
            onClose={() => removeToast(id)}
          />
        </div>
      ))}
    </>
  );
};

/** 全局显示Toast的辅助函数 */
export function showToast(message: string, type: ToastProps['type'] = 'success') {
  if ((window as any).showToast) {
    (window as any).showToast({ message, type });
  }
}