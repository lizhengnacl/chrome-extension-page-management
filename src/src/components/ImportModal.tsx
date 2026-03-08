/**
 * 导入弹窗组件
 * 用于浏览器书签导入
 */

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { showToast } from './ui/Toast';
import { importBookmarks } from '../utils/bookmarkImport';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(null);

    try {
      const result = await importBookmarks();

      if (result.success) {
        setImportProgress({
          imported: result.importedCount,
          skipped: result.skippedCount,
        });
        showToast(
          `导入成功！共导入 ${result.importedCount} 个页面，跳过 ${result.skippedCount} 个重复项`,
          'success'
        );
        setTimeout(() => {
          onImportComplete();
          onClose();
        }, 1500);
      } else {
        showToast(result.error || '导入失败，请重试', 'error');
      }
    } catch (error) {
      console.error('导入过程出错:', error);
      showToast('导入失败，请重试', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="导入浏览器书签"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isImporting}>
            取消
          </Button>
          <Button onClick={handleImport} loading={isImporting}>
            开始导入
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">此操作将：</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>将浏览器书签导入到页面管理器</li>
            <li>书签文件夹将映射为分组</li>
            <li>根目录书签将归入"未分类"分组</li>
            <li>自动跳过已存在的重复链接</li>
          </ul>
        </div>

        {importProgress && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">导入完成</span>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <p>成功导入：{importProgress.imported} 个页面</p>
              <p>跳过重复：{importProgress.skipped} 个</p>
            </div>
          </div>
        )}

        {isImporting && !importProgress && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">正在导入书签，请稍候...</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
