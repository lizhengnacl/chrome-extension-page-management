/**
 * New Tab界面入口组件
 * 页面管理主界面，支持列表展示、搜索、筛选、编辑等操作
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal, ConfirmModal } from './components/ui/Modal';
import { Toast, showToast } from './components/ui/Toast';
import { TagTree } from './components/TagTree';
import { PageListItem } from './components/PageListItem';
import { StorageWarning } from './components/StorageWarning';
import { TagInput } from './components/TagInput';
import { GroupSelector } from './components/GroupSelector';
import { pageStorage, groupStorage, tagStorage } from './storage';
import { sortByTitle, debounce } from './utils';
import type { Page, Group, TagNode } from './types';

const NewTab: React.FC = () => {
  // 数据状态
  const [pages, setPages] = useState<Page[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<TagNode[]>([]);
  
  // 筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  
  // 编辑弹窗状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    tags: [] as string[],
    groups: [] as string[],
  });

  // 删除确认弹窗
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<string>('');

  // 初始化加载数据
  useEffect(() => {
    loadData();
    // 后台自动更新页面信息
    autoUpdatePages();
  }, []);

  const loadData = async () => {
    const [pagesData, groupsData, tagsData] = await Promise.all([
      pageStorage.getAll(),
      groupStorage.getAll(),
      tagStorage.getAll(),
    ]);
    setPages(pagesData);
    setGroups(groupsData);
    setTags(tagsData);
  };

  // 自动更新页面标题和favicon
  const autoUpdatePages = async () => {
    const allPages = await pageStorage.getAll();
    const updates: { id: string; title?: string; favicon?: string }[] = [];

    for (const page of allPages.slice(0, 10)) { // 限制每次检查10个
      try {
        // 尝试获取最新信息（实际应用中可能需要通过后台脚本获取）
        // 这里简化处理，只更新空favicon
        if (!page.favicon) {
          updates.push({
            id: page.id,
            favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(page.url)}&sz=32`,
          });
        }
      } catch {
        // 忽略错误
      }
    }

    if (updates.length > 0) {
      await pageStorage.batchUpdateInfo(updates);
      loadData();
    }
  };

  // 筛选后的页面列表
  const filteredPages = React.useMemo(() => {
    let result = [...pages];

    // 搜索关键词筛选
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(page =>
        page.title.toLowerCase().includes(lowerQuery) ||
        page.url.toLowerCase().includes(lowerQuery) ||
        page.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        page.groups.some(gId => {
          const group = groups.find(gr => gr.id === gId);
          return group?.name.toLowerCase().includes(lowerQuery);
        })
      );
    }

    // 标签筛选
    if (selectedTag) {
      result = result.filter(page =>
        page.tags.some(t => t === selectedTag || t.startsWith(`${selectedTag}/`))
      );
    }

    // 分组筛选
    if (selectedGroup) {
      result = result.filter(page => page.groups.includes(selectedGroup));
    }

    // 按标题排序
    return sortByTitle(result);
  }, [pages, searchQuery, selectedTag, selectedGroup, groups]);

  // 搜索防抖
  const debouncedSearch = useCallback(
    debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  // 处理编辑
  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setEditForm({
      title: page.title,
      tags: page.tags,
      groups: page.groups,
    });
    setEditModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingPage) return;

    const success = await pageStorage.update(editingPage.id, {
      title: editForm.title,
      tags: editForm.tags,
      groups: editForm.groups,
    });

    if (success) {
      showToast('更新成功', 'success');
      setEditModalOpen(false);
      loadData();
    } else {
      showToast('更新失败', 'error');
    }
  };

  // 处理删除
  const handleDelete = (pageId: string) => {
    setDeletingPageId(pageId);
    setDeleteModalOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    const success = await pageStorage.delete(deletingPageId);
    if (success) {
      showToast('删除成功', 'success');
      setDeleteModalOpen(false);
      loadData();
    } else {
      showToast('删除失败', 'error');
    }
  };

  // 从分组中移除
  const handleRemoveFromGroup = async (pageId: string, groupId: string) => {
    const success = await pageStorage.removeFromGroup(pageId, groupId);
    if (success) {
      showToast('已从分组中移除', 'success');
      loadData();
    }
  };

  // 一键打开分组所有页面
  const handleOpenGroup = async (groupId: string) => {
    await groupStorage.openAll(groupId);
  };

  // 获取当前分组名称
  const getCurrentGroupName = () => {
    if (!selectedGroup) return '';
    return groups.find(g => g.id === selectedGroup)?.name || '';
  };

  // 清除筛选
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedGroup('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">页面管理器</h1>
                <p className="text-xs text-gray-500">{filteredPages.length} 个收藏</p>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索标题、URL、标签或分组..."
                  defaultValue={searchQuery}
                  onChange={e => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 右侧操作 */}
            <div className="flex items-center gap-3">
              {(searchQuery || selectedTag || selectedGroup) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  清除筛选
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 存储警告 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <StorageWarning />
        </div>
      </header>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* 侧边栏 */}
          <aside className="w-64 flex-shrink-0">
            {/* 分组列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  分组
                </h3>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(selectedGroup === group.id ? '' : group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedGroup === group.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      {group.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {pages.filter(p => p.groups.includes(group.id)).length}
                    </span>
                  </button>
                ))}
              </div>
              {selectedGroup && (
                <div className="px-3 pb-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleOpenGroup(selectedGroup)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    一键打开分组
                  </Button>
                </div>
              )}
            </div>

            {/* 标签树 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  标签
                </h3>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                <TagTree
                  nodes={tags}
                  onTagClick={tagPath => setSelectedTag(selectedTag === tagPath ? '' : tagPath)}
                  selectedTag={selectedTag}
                />
              </div>
            </div>
          </aside>

          {/* 主列表 */}
          <main className="flex-1">
            {/* 当前筛选状态 */}
            {(selectedTag || selectedGroup) && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">当前筛选：</span>
                {selectedTag && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    标签: {selectedTag}
                    <button onClick={() => setSelectedTag('')} className="hover:text-blue-900">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGroup && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    分组: {getCurrentGroupName()}
                    <button onClick={() => setSelectedGroup('')} className="hover:text-purple-900">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* 页面列表 */}
            {filteredPages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">暂无收藏的页面</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  点击浏览器工具栏上的页面管理器图标，开始收藏您常用的网页。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPages.map(page => (
                  <PageListItem
                    key={page.id}
                    page={page}
                    groups={groups}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRemoveFromGroup={handleRemoveFromGroup}
                    currentGroupId={selectedGroup}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="编辑页面信息"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="页面标题"
            value={editForm.title}
            onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
            <TagInput
              value={editForm.tags}
              onChange={tags => setEditForm(prev => ({ ...prev, tags }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分组</label>
            <GroupSelector
              value={editForm.groups}
              onChange={groups => setEditForm(prev => ({ ...prev, groups }))}
            />
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这个收藏的页面吗？此操作不可恢复。"
        variant="danger"
        confirmText="删除"
      />
    </div>
  );
};

export default NewTab;