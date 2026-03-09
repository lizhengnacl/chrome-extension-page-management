/**
 * 导入弹窗组件
 * 用于浏览器书签导入
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { showToast } from './ui/Toast';
import { getBookmarkTree, importSelectedBookmarks, type BookmarkNode } from '../utils/bookmarkImport';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface FolderNode {
  id: string;
  title: string;
  children: (BookmarkNode | FolderNode)[];
  isFolder: true;
  expanded: boolean;
}

const BookmarkItem: React.FC<{
  node: BookmarkNode | FolderNode;
  selectedIds: Set<string>;
  onToggle: (id: string, isSelected: boolean) => void;
  onToggleFolder: (id: string) => void;
  level: number;
}> = ({ node, selectedIds, onToggle, onToggleFolder, level }) => {
  const isFolder = 'isFolder' in node;
  const isSelected = selectedIds.has(node.id);
  const hasChildren = !isFolder ? false : node.children.length > 0;
  
  const getChildCount = (n: BookmarkNode | FolderNode): number => {
    if ('isFolder' in n) {
      return n.children.reduce((sum, child) => sum + getChildCount(child), 0);
    }
    return n.url ? 1 : 0;
  };

  const getSelectedChildCount = (n: BookmarkNode | FolderNode): number => {
    if ('isFolder' in n) {
      return n.children.reduce((sum, child) => sum + getSelectedChildCount(child), 0);
    }
    return selectedIds.has(n.id) ? 1 : 0;
  };

  const childCount = isFolder ? getChildCount(node) : 0;
  const selectedChildCount = isFolder ? getSelectedChildCount(node) : 0;
  const isPartiallySelected = isFolder && selectedChildCount > 0 && selectedChildCount < childCount;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    
    const toggleAll = (n: BookmarkNode | FolderNode, isChecked: boolean) => {
      if ('isFolder' in n) {
        n.children.forEach(child => toggleAll(child, isChecked));
      } else if (n.url) {
        onToggle(n.id, isChecked);
      }
    };

    toggleAll(node, checked);
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors`}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {isFolder && hasChildren && (
          <button
            type="button"
            onClick={() => onToggleFolder(node.id)}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform ${node.expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {isFolder && !hasChildren && <span className="w-4" />}
        
        {(!isFolder || hasChildren) && (
          <input
            type="checkbox"
            checked={isSelected || (isFolder && selectedChildCount === childCount && childCount > 0)}
            ref={(input) => {
              if (input) {
                input.indeterminate = isPartiallySelected;
              }
            }}
            onChange={handleToggle}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        )}
        {isFolder && !hasChildren && <span className="w-4" />}
        
        {isFolder ? (
          <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ) : node.url ? (
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        ) : null}
        
        <span className={`flex-1 text-sm truncate ${isFolder ? 'font-medium' : ''}`}>
          {node.title || (node.url ? new URL(node.url).hostname : '无标题')}
        </span>
        
        {isFolder && childCount > 0 && (
          <span className="text-xs text-gray-400 flex-shrink-0">
            {selectedChildCount}/{childCount}
          </span>
        )}
      </div>
      
      {isFolder && node.expanded && node.children.length > 0 && (
        <div>
          {node.children
            .sort((a, b) => {
              const aIsFolder = 'isFolder' in a || (!('url' in a) || !a.url);
              const bIsFolder = 'isFolder' in b || (!('url' in b) || !b.url);
              if (aIsFolder && !bIsFolder) return -1;
              if (!aIsFolder && bIsFolder) return 1;
              return 0;
            })
            .map((child) => (
              <BookmarkItem
                key={child.id}
                node={child}
                selectedIds={selectedIds}
                onToggle={onToggle}
                onToggleFolder={onToggleFolder}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [step, setStep] = useState<'select' | 'importing' | 'complete'>('select');
  const [bookmarkTree, setBookmarkTree] = useState<(BookmarkNode | FolderNode)[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);

  const convertToFolderNode = (node: BookmarkNode): BookmarkNode | FolderNode => {
    if (node.children && node.children.length > 0) {
      return {
        id: node.id,
        title: node.title,
        children: node.children.map(convertToFolderNode),
        isFolder: true,
        expanded: true,
      };
    }
    return node;
  };

  const loadBookmarks = useCallback(async () => {
    try {
      const tree = await getBookmarkTree();
      const converted = tree.flatMap(root => 
        root.children ? root.children.map(convertToFolderNode) : []
      );
      setBookmarkTree(converted);
    } catch (error) {
      console.error('加载书签失败:', error);
      showToast('加载书签失败，请重试', 'error');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedIds(new Set());
      setImportProgress(null);
      loadBookmarks();
    }
  }, [isOpen, loadBookmarks]);

  const handleToggle = (id: string, isSelected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleFolder = (id: string) => {
    const toggleExpand = (nodes: (BookmarkNode | FolderNode)[]): (BookmarkNode | FolderNode)[] => {
      return nodes.map(node => {
        if ('isFolder' in node) {
          if (node.id === id) {
            return { ...node, expanded: !node.expanded };
          }
          return { ...node, children: toggleExpand(node.children) };
        }
        return node;
      });
    };
    setBookmarkTree(toggleExpand(bookmarkTree));
  };

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    
    const collectIds = (nodes: (BookmarkNode | FolderNode)[]) => {
      nodes.forEach(node => {
        if ('isFolder' in node) {
          collectIds(node.children);
        } else if (node.url) {
          allIds.add(node.id);
        }
      });
    };
    
    collectIds(bookmarkTree);
    setSelectedIds(allIds);
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) {
      showToast('请选择要导入的书签', 'error');
      return;
    }

    setStep('importing');
    
    try {
      const result = await importSelectedBookmarks(selectedIds);

      if (result.success) {
        setImportProgress({
          imported: result.importedCount,
          skipped: result.skippedCount,
        });
        setStep('complete');
        showToast(
          `导入成功！共导入 ${result.importedCount} 个页面，跳过 ${result.skippedCount} 个重复项`,
          'success'
        );
      } else {
        showToast(result.error || '导入失败，请重试', 'error');
        setStep('select');
      }
    } catch (error) {
      console.error('导入过程出错:', error);
      showToast('导入失败，请重试', 'error');
      setStep('select');
    }
  };

  const totalBookmarks = bookmarkTree.reduce((sum, node) => {
    const count = (n: BookmarkNode | FolderNode): number => {
      if ('isFolder' in n) {
        return n.children.reduce((s, child) => s + count(child), 0);
      }
      return n.url ? 1 : 0;
    };
    return sum + count(node);
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="导入浏览器书签"
      size="lg"
      footer={
        step === 'select' ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={selectedIds.size === 0}
            >
              导入选中 ({selectedIds.size})
            </Button>
          </>
        ) : step === 'complete' ? (
          <>
            <Button onClick={() => {
              onImportComplete();
              onClose();
            }}>
              完成
            </Button>
          </>
        ) : null
      }
    >
      <div className="space-y-4">
        {step === 'select' && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共找到 {totalBookmarks} 个书签
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  全选
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  清空
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {bookmarkTree.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">正在加载书签...</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {bookmarkTree
                    .sort((a, b) => {
                      const aIsFolder = 'isFolder' in a || (!('url' in a) || !a.url);
                      const bIsFolder = 'isFolder' in b || (!('url' in b) || !b.url);
                      if (aIsFolder && !bIsFolder) return -1;
                      if (!aIsFolder && bIsFolder) return 1;
                      return 0;
                    })
                    .map((node) => (
                      <BookmarkItem
                        key={node.id}
                        node={node}
                        selectedIds={selectedIds}
                        onToggle={handleToggle}
                        onToggleFolder={handleToggleFolder}
                        level={0}
                      />
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {step === 'importing' && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">正在导入书签，请稍候...</p>
            </div>
          </div>
        )}

        {step === 'complete' && importProgress && (
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
      </div>
    </Modal>
  );
};
