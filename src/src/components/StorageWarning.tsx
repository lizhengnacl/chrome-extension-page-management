/**
 * 存储警告组件
 * 当本机存储用量超过80%时显示警告提示
 */

import React, { useEffect, useState } from 'react';
import { getStorageUsage, shouldShowStorageWarning } from '../storage';
import type { StorageUsage } from '../types';

interface StorageWarningProps {
  className?: string;
}

export const StorageWarning: React.FC<StorageWarningProps> = ({ className = '' }) => {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkStorage();
    // 每30秒检查一次
    const interval = setInterval(checkStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStorage = async () => {
    const shouldWarn = await shouldShowStorageWarning();
    if (shouldWarn) {
      const usage = await getStorageUsage();
      setUsage(usage);
      setShowWarning(true);
    }
  };

  if (!showWarning || dismissed) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="font-medium text-orange-800 text-sm">本机存储空间不足</h4>
          <p className="text-xs text-orange-700 mt-1">
            已使用 {usage ? usage.percentage.toFixed(1) : 0}% ({usage ? formatBytes(usage.used) : '0'} / {usage ? formatBytes(usage.total) : '10MB'}) 的本机存储空间。
            请删除一些页面或导出备份，否则可能导致本机保存失败。
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
