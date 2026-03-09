/**
 * 导出弹窗组件
 * 用于导出到浏览器书签
 */

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { showToast } from './ui/Toast';
import { exportBookmarks } from '../utils/bookmarkExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    exported: number;
  } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await exportBookmarks();

      if (result.success) {
        setExportResult({
          exported: result.exportedCount,
        });
        showToast(
          `导出成功！共导出 ${result.exportedCount} 个页面到浏览器书签`,
          'success'
        );
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        showToast(result.error || '导出失败，请重试', 'error');
      }
    } catch (error) {
      console.error('导出过程出错:', error);
      showToast('导出失败，请重试', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="导出到浏览器书签"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            取消
          </Button>
          <Button onClick={handleExport} loading={isExporting}>
            开始导出
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">此操作将：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>将页集中的页面导出到浏览器书签</li>
            <li>分组将映射为书签文件夹</li>
            <li>多归属页面会在多个文件夹中出现</li>
            <li>标签信息将被忽略</li>
            <li>书签将保存在"其他书签"文件夹中</li>
          </ul>
        </div>

        {exportResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">导出完成</span>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <p>成功导出：{exportResult.exported} 个页面</p>
            </div>
          </div>
        )}

        {isExporting && !exportResult && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">正在导出书签，请稍候...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
