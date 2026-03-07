import { useState, useEffect } from 'react';
import { Button, Input, Modal } from '../components/common';
import { Sidebar } from '../components/newtab/Sidebar';
import { FavoritesSection } from '../components/newtab/FavoritesSection';
import { GroupsSection } from '../components/newtab/GroupsSection';
import { usePages } from '../hooks/usePages';
import { useGroups } from '../hooks/useGroups';
import { useTags } from '../hooks/useTags';
import { generateColorFromTagName } from '../utils/colors';
import { showToast } from '../utils/utils';

export function Newtab() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isEditPageModalOpen, setIsEditPageModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageForm, setEditPageForm] = useState({
    title: '',
    url: '',
    groupId: null as string | null,
    tags: [] as string[]
  });

  const { pages, toggleFavorite, updatePage, deletePage } = usePages();
  const { groups, addGroup, updateGroup, deleteGroup } = useGroups();
  const { tags, addTag } = useTags();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const filteredPages = pages.filter((page) => {
    let matches = true;

    if (searchKeyword) {
      const lowerKeyword = searchKeyword.toLowerCase();
      const tagIdToName: Record<string, string> = {};
      tags.forEach((tag) => {
        tagIdToName[tag.id] = tag.name.toLowerCase();
      });

      const titleMatch = page.title.toLowerCase().includes(lowerKeyword);
      const urlMatch = page.url.toLowerCase().includes(lowerKeyword);
      const tagMatch = page.tags.some(
        (tagId) => tagIdToName[tagId] && tagIdToName[tagId].includes(lowerKeyword)
      );
      matches = matches && (titleMatch || urlMatch || tagMatch);
    }

    if (selectedTagId) {
      matches = matches && page.tags.includes(selectedTagId);
    }

    return matches;
  });

  const favoritePages = filteredPages.filter((p) => p.isFavorite);

  const handleToggleFavorite = async (pageId: string) => {
    try {
      const page = pages.find((p) => p.id === pageId);
      if (!page) return;

      await toggleFavorite(pageId);
      showToast(page.isFavorite ? '已取消常用' : '已添加到常用', 'success');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('操作失败', 'error');
    }
  };

  const handleEditPage = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    setEditingPageId(pageId);
    setEditPageForm({
      title: page.title,
      url: page.url,
      groupId: page.groupId,
      tags: [...page.tags]
    });
    setIsEditPageModalOpen(true);
  };

  const handleSaveEditPage = async () => {
    if (!editingPageId || !editPageForm.title.trim() || !editPageForm.url.trim()) {
      showToast('请填写完整的信息', 'error');
      return;
    }

    try {
      await updatePage(editingPageId, {
        title: editPageForm.title.trim(),
        url: editPageForm.url.trim(),
        groupId: editPageForm.groupId,
        tags: editPageForm.tags
      });
      
      setIsEditPageModalOpen(false);
      setEditingPageId(null);
      showToast('页面已更新', 'success');
    } catch (error) {
      console.error('Failed to update page:', error);
      showToast('更新失败', 'error');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    const confirmed = window.confirm('确定要删除这个页面吗？');
    if (!confirmed) return;

    try {
      await deletePage(pageId);
      showToast('页面已删除', 'success');
    } catch (error) {
      console.error('Failed to delete page:', error);
      showToast('删除失败', 'error');
    }
  };

  const handleAddTag = async (name: string) => {
    try {
      const color = generateColorFromTagName(name);
      await addTag({ name, color });
      showToast('标签已添加', 'success');
    } catch (error) {
      console.error('Failed to add tag:', error);
      showToast('添加失败', 'error');
    }
  };

  const handleOpenGroup = async (groupId: string | null) => {
    try {
      const groupPages = pages.filter((p) => p.groupId === groupId);
      for (const page of groupPages) {
        chrome.tabs.create({ url: page.url, active: false });
      }
      showToast(`已打开 ${groupPages.length} 个页面`, 'success');
    } catch (error) {
      console.error('Failed to open group:', error);
      showToast('打开失败', 'error');
    }
  };

  const handleEditGroup = (groupId: string) => {
    console.log('Edit group:', groupId);
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      showToast('请输入分组名称', 'error');
      return;
    }

    try {
      await addGroup({ name: newGroupName.trim(), order: groups.length });
      setNewGroupName('');
      setIsAddGroupModalOpen(false);
      showToast('分组已添加', 'success');
    } catch (error) {
      console.error('Failed to add group:', error);
      showToast('添加失败', 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const confirmed = window.confirm('确定要删除这个分组吗？该分组下的页面将变为未分组。');
    if (!confirmed) return;

    try {
      await deleteGroup(groupId);
      showToast('分组已删除', 'success');
    } catch (error) {
      console.error('Failed to delete group:', error);
      showToast('删除失败', 'error');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onAddTag={handleAddTag}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">页面管理</h1>
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索页面..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                startContent={
                  <svg
                    className="w-5 h-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                导入
              </Button>
              <Button variant="ghost" size="sm">
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                导出
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsAddGroupModalOpen(true)}>
                <svg
                  className="w-4 h-4 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                添加分组
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <FavoritesSection
              pages={favoritePages}
              tags={tags}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditPage}
              onDelete={handleDeletePage}
            />

            <GroupsSection
              pages={filteredPages}
              groups={groups}
              tags={tags}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditPage}
              onDelete={handleDeletePage}
              onOpenGroup={handleOpenGroup}
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>
        </main>

        <Modal
          isOpen={isAddGroupModalOpen}
          onClose={() => {
            setIsAddGroupModalOpen(false);
            setNewGroupName('');
          }}
          title="添加分组"
          footer={
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddGroupModalOpen(false);
                  setNewGroupName('');
                }}
              >
                取消
              </Button>
              <Button color="primary" onClick={handleAddGroup}>
                添加
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="分组名称"
              placeholder="输入分组名称"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddGroup();
              }}
              autoFocus
            />
          </div>
        </Modal>

        <Modal
          isOpen={isEditPageModalOpen}
          onClose={() => {
            setIsEditPageModalOpen(false);
            setEditingPageId(null);
          }}
          title="编辑页面"
          footer={
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditPageModalOpen(false);
                  setEditingPageId(null);
                }}
              >
                取消
              </Button>
              <Button color="primary" onClick={handleSaveEditPage}>
                保存
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="页面标题"
              placeholder="输入页面标题"
              value={editPageForm.title}
              onChange={(e) => setEditPageForm({ ...editPageForm, title: e.target.value })}
            />
            <Input
              label="页面 URL"
              placeholder="https://example.com"
              value={editPageForm.url}
              onChange={(e) => setEditPageForm({ ...editPageForm, url: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">分组</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
                value={editPageForm.groupId || ''}
                onChange={(e) => setEditPageForm({ ...editPageForm, groupId: e.target.value || null })}
              >
                <option value="">未分组</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">标签</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPageForm.tags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditPageForm({
                            ...editPageForm,
                            tags: [...editPageForm.tags, tag.id]
                          });
                        } else {
                          setEditPageForm({
                            ...editPageForm,
                            tags: editPageForm.tags.filter((id) => id !== tag.id)
                          });
                        }
                      }}
                    />
                    <span
                      className="px-2 py-1 rounded-full text-xs text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </label>
                ))}
                {tags.length === 0 && (
                  <p className="text-gray-500 text-sm">暂无标签</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
