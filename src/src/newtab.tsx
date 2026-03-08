/**
 * New Tab界面入口组件
 * 页面管理主界面，支持列表展示、搜索、筛选、编辑等操作
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Modal, ConfirmModal } from './components/ui/Modal';
import { Toast, showToast } from './components/ui/Toast';
import { TagTree } from './components/TagTree';
import { PageListItem } from './components/PageListItem';
import { StorageWarning } from './components/StorageWarning';
import { TagInput, type TagInputRef } from './components/TagInput';
import { GroupSelector } from './components/GroupSelector';
import { ImportModal } from './components/ImportModal';
import { ExportModal } from './components/ExportModal';
import { pageStorage, groupStorage, tagStorage, getStorageData, setStorageData } from './storage';
import { sortByTitle, debounce } from './utils';
import type { Page, Group, TagNode } from './types';

const NewTab: React.FC = () => {
  // 数据状态
  const [pages, setPages] = useState<Page[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<TagNode[]>([]);
  const tagInputRef = useRef<TagInputRef>(null);
  
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
  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    type: 'page' | 'group' | 'tag' | 'all';
    id?: string;
    name?: string;
  } | null>(null);

  // 编辑分组弹窗
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editGroupForm, setEditGroupForm] = useState({
    name: '',
    description: '',
  });

  // 编辑标签弹窗
  const [editTagModalOpen, setEditTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ path: string; name: string } | null>(null);
  const [editTagForm, setEditTagForm] = useState({
    name: '',
  });

  // 导入弹窗状态
  const [importModalOpen, setImportModalOpen] = useState(false);

  // 导出弹窗状态
  const [exportModalOpen, setExportModalOpen] = useState(false);

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

    tagInputRef.current?.flushInput();

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

  // 处理删除页面
  const handleDelete = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    setDeleteConfirmData({
      type: 'page',
      id: pageId,
      name: page?.title
    });
    setDeleteModalOpen(true);
  };

  // 处理删除分组
  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group?.id === 'default') {
      showToast('默认分组不能删除', 'error');
      return;
    }
    setDeleteConfirmData({
      type: 'group',
      id: groupId,
      name: group?.name
    });
    setDeleteModalOpen(true);
  };

  // 处理删除标签
  const handleDeleteTag = (tagPath: string) => {
    setDeleteConfirmData({
      type: 'tag',
      id: tagPath,
      name: tagPath
    });
    setDeleteModalOpen(true);
  };

  // 二次确认状态
  const [deleteAllStep, setDeleteAllStep] = useState<'confirm' | 'final'>('confirm');
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState('');

  // 处理删除所有页面
  const handleDeleteAll = () => {
    setDeleteAllStep('confirm');
    setDeleteAllConfirmText('');
    setDeleteConfirmData({
      type: 'all',
      name: '所有页面'
    });
    setDeleteModalOpen(true);
  };

  // 处理编辑分组
  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setEditGroupForm({
      name: group.name,
      description: group.description || '',
    });
    setEditGroupModalOpen(true);
  };

  // 保存编辑分组
  const handleSaveEditGroup = async () => {
    if (!editingGroup) return;
    if (!editGroupForm.name.trim()) {
      showToast('分组名称不能为空', 'error');
      return;
    }

    const success = await groupStorage.update(editingGroup.id, {
      name: editGroupForm.name,
      description: editGroupForm.description,
    });

    if (success) {
      showToast('分组更新成功', 'success');
      setEditGroupModalOpen(false);
      setEditingGroup(null);
      loadData();
    } else {
      showToast('分组更新失败', 'error');
    }
  };

  // 处理编辑标签
  const handleEditTag = (tagPath: string, tagName: string) => {
    setEditingTag({ path: tagPath, name: tagName });
    setEditTagForm({
      name: tagName,
    });
    setEditTagModalOpen(true);
  };

  // 递归更新标签树
  const updateTagTree = (nodes: TagNode[], oldPath: string, newName: string): TagNode[] => {
    const oldPathParts = oldPath.split('/');
    const targetName = oldPathParts[oldPathParts.length - 1];
    
    return nodes.map(node => {
      // 检查是否是目标节点
      if (node.path === oldPath) {
        // 计算新路径
        const pathParts = oldPath.split('/');
        pathParts[pathParts.length - 1] = newName;
        const newPath = pathParts.join('/');
        
        // 更新当前节点及其子节点
        const updateNodePath = (n: TagNode, parentOldPath: string, parentNewPath: string): TagNode => {
          const relativePath = n.path.substring(parentOldPath.length);
          const newNodePath = parentNewPath + relativePath;
          
          return {
            ...n,
            name: n.path === oldPath ? newName : n.name,
            path: newNodePath,
            children: n.children.map(child => updateNodePath(child, parentOldPath, parentNewPath)),
          };
        };
        
        return updateNodePath(node, oldPath, newPath);
      }
      
      // 递归处理子节点
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateTagTree(node.children, oldPath, newName),
        };
      }
      
      return node;
    });
  };

  // 保存编辑标签
  const handleSaveEditTag = async () => {
    if (!editingTag) return;
    if (!editTagForm.name.trim()) {
      showToast('标签名称不能为空', 'error');
      return;
    }

    // 计算新的标签路径
    const pathParts = editingTag.path.split('/');
    pathParts[pathParts.length - 1] = editTagForm.name;
    const newPath = pathParts.join('/');

    // 获取所有数据
    const data = await getStorageData();
    
    // 更新标签树
    data.tags = updateTagTree(data.tags, editingTag.path, editTagForm.name);
    
    // 更新页面中的标签引用
    data.pages.forEach(page => {
      page.tags = page.tags.map(tag => {
        if (tag === editingTag.path) {
          return newPath;
        }
        if (tag.startsWith(editingTag.path + '/')) {
          return newPath + tag.substring(editingTag.path.length);
        }
        return tag;
      });
    });

    // 保存更新
    const success = await setStorageData(data);

    if (success) {
      showToast('标签更新成功', 'success');
      setEditTagModalOpen(false);
      setEditingTag(null);
      loadData();
    } else {
      showToast('标签更新失败', 'error');
    }
  };

  // 获取删除确认消息
  const getDeleteMessage = () => {
    if (!deleteConfirmData) {
      return '确定要删除吗？此操作不可恢复。';
    }
    
    if (deleteConfirmData.type === 'page') {
      return `确定要删除页面"${deleteConfirmData.name}"吗？此操作不可恢复。`;
    } else if (deleteConfirmData.type === 'group') {
      return `确定要删除分组"${deleteConfirmData.name}"吗？该分组下的页面不会被删除，但会从该分组中移除。`;
    } else if (deleteConfirmData.type === 'tag') {
      return `确定要删除标签"${deleteConfirmData.name}"吗？该标签及其子标签将从所有页面中移除。`;
    } else if (deleteConfirmData.type === 'all') {
      if (deleteAllStep === 'confirm') {
        return '⚠️ 警告：此操作将删除所有收藏的页面和自定义分组，只保留默认的"未分类"分组。此操作不可恢复！';
      } else {
        return '请在下方输入"删除所有"以确认此操作。';
      }
    }
    return '确定要删除吗？此操作不可恢复。';
  };

  // 增强的删除确认逻辑
  const confirmDelete = async () => {
    if (!deleteConfirmData) return;
    
    if (deleteConfirmData.type === 'all') {
      if (deleteAllStep === 'confirm') {
        setDeleteAllStep('final');
        return;
      } else if (deleteAllConfirmText !== '删除所有') {
        showToast('请输入"删除所有"以确认', 'error');
        return;
      }
    }
    
    let success = false;
    
    if (deleteConfirmData.type === 'page' && deleteConfirmData.id) {
      success = await pageStorage.delete(deleteConfirmData.id);
    } else if (deleteConfirmData.type === 'group' && deleteConfirmData.id) {
      success = await groupStorage.delete(deleteConfirmData.id);
      if (success && selectedGroup === deleteConfirmData.id) {
        setSelectedGroup('');
      }
    } else if (deleteConfirmData.type === 'tag' && deleteConfirmData.id) {
      success = await tagStorage.deleteTag(deleteConfirmData.id);
      if (success && selectedTag === deleteConfirmData.id) {
        setSelectedTag('');
      }
    } else if (deleteConfirmData.type === 'all') {
      success = await pageStorage.deleteAll();
    }
    
    if (success) {
      showToast('删除成功', 'success');
      setDeleteModalOpen(false);
      setDeleteConfirmData(null);
      setDeleteAllStep('confirm');
      setDeleteAllConfirmText('');
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
    try {
      const pages = await pageStorage.getByGroup(groupId);
      if (pages.length === 0) {
        showToast('该分组下没有页面', 'info');
        return;
      }
      showToast(`正在打开 ${pages.length} 个页面...`, 'info');
      await groupStorage.openAll(groupId);
    } catch (error) {
      console.error('打开分组失败:', error);
      showToast('打开分组失败，请重试', 'error');
    }
  };

  // 处理分组置顶
  const handleTogglePinGroup = async (groupId: string) => {
    const success = await groupStorage.togglePin(groupId);
    if (success) {
      showToast('分组置顶状态已更新', 'success');
      loadData();
    } else {
      showToast('操作失败', 'error');
    }
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
              {pages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除所有
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setImportModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导入书签
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportModalOpen(true)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                导出书签
              </Button>
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
                  <div key={group.id} className="group/item">
                    <div className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedGroup === group.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${group.pinned ? 'border-l-4 border-amber-500 bg-amber-50/50' : ''}`}>
                      <button
                        onClick={() => setSelectedGroup(selectedGroup === group.id ? '' : group.id)}
                        className="flex items-center gap-2 truncate flex-1 text-left"
                      >
                        {group.pinned && (
                          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 4l-4 11h-2L7 4h10zm-5 14a2 2 0 100 4 2 2 0 000-4z" />
                          </svg>
                        )}
                        {!group.pinned && (
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        )}
                        {group.name}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinGroup(group.id);
                          }}
                          className={`opacity-0 group-hover/item:opacity-100 p-1 rounded transition-all ${
                            group.pinned 
                              ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                              : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={group.pinned ? "取消置顶" : "置顶分组"}
                        >
                          <svg className="w-4 h-4" fill={group.pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        {group.id !== 'default' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGroup(group);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                              title="编辑分组"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              title="删除分组"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                        <span className="text-xs text-gray-400">
                          {pages.filter(p => p.groups.includes(group.id)).length}
                        </span>
                      </div>
                    </div>
                  </div>
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
                  onDeleteTag={handleDeleteTag}
                  onEditTag={handleEditTag}
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
              ref={tagInputRef}
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
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmData(null);
          setDeleteAllStep('confirm');
          setDeleteAllConfirmText('');
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        variant="danger"
        confirmText={deleteConfirmData?.type === 'all' && deleteAllStep === 'confirm' ? '继续' : '删除'}
      >
        {deleteConfirmData?.type === 'all' ? (
          <div>
            <p className={`text-gray-600 mb-4 ${deleteAllStep === 'confirm' ? 'text-red-600 font-medium' : ''}`}>
              {getDeleteMessage()}
            </p>
            {deleteAllStep === 'final' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认输入
                </label>
                <input
                  type="text"
                  value={deleteAllConfirmText}
                  onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                  placeholder="输入&quot;删除所有&quot;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-50"
                  autoFocus
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">{getDeleteMessage()}</p>
        )}
      </ConfirmModal>

      {/* 编辑分组弹窗 */}
      <Modal
        isOpen={editGroupModalOpen}
        onClose={() => setEditGroupModalOpen(false)}
        title="编辑分组"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditGroupModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEditGroup}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分组名称
            </label>
            <input
              type="text"
              value={editGroupForm.name}
              onChange={(e) => setEditGroupForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入分组名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={editGroupForm.description}
              onChange={(e) => setEditGroupForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="请输入分组描述"
            />
          </div>
        </div>
      </Modal>

      {/* 编辑标签弹窗 */}
      <Modal
        isOpen={editTagModalOpen}
        onClose={() => setEditTagModalOpen(false)}
        title="编辑标签"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTagModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEditTag}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签名称
            </label>
            <input
              type="text"
              value={editTagForm.name}
              onChange={(e) => setEditTagForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入标签名称"
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>提示：修改标签名称会同时更新所有相关页面的标签引用。</p>
          </div>
        </div>
      </Modal>

      {/* 导入弹窗 */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={loadData}
      />

      {/* 导出弹窗 */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
};

export default NewTab;