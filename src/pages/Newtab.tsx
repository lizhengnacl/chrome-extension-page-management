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
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
      </div>

      <Sidebar
        selectedTagId={selectedTagId}
        onTagSelect={setSelectedTagId}
        onAddTag={handleAddTag}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="bg-background-secondary/80 backdrop-blur-xl border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <svg
                  className="w-6 h-6 text-white"
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
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gradient">Page Manager</h1>
            </div>
            <div className="flex-1 max-w-xl">
              <Input
                placeholder="搜索页面标题、URL 或标签..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                classNames={{
                  input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
                  inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl hover:border-primary-500/50 transition-colors',
                }}
                startContent={
                  <svg
                    className="w-5 h-5 text-text-muted"
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
              <Button
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
              <Button
                variant="ghost"
                size="sm"
                className="text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
              <Button
                variant="flat"
                color="primary"
                size="sm"
                onClick={() => setIsAddGroupModalOpen(true)}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                添加分组
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
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
          classNames={{
            base: 'bg-background-secondary border border-border/50',
            header: 'border-b border-border/50',
            body: 'text-text-primary',
            footer: 'border-t border-border/50',
          }}
          footer={
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddGroupModalOpen(false);
                  setNewGroupName('');
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                取消
              </Button>
              <Button
                color="primary"
                onClick={handleAddGroup}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white"
              >
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
              labelPlacement="outside"
              classNames={{
                label: 'text-text-secondary',
                input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
                inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl',
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
          classNames={{
            base: 'bg-background-secondary border border-border/50',
            header: 'border-b border-border/50',
            body: 'text-text-primary',
            footer: 'border-t border-border/50',
          }}
          footer={
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditPageModalOpen(false);
                  setEditingPageId(null);
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                取消
              </Button>
              <Button
                color="primary"
                onClick={handleSaveEditPage}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white"
              >
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
              labelPlacement="outside"
              classNames={{
                label: 'text-text-secondary',
                input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
                inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl',
              }}
            />
            <Input
              label="页面 URL"
              placeholder="https://example.com"
              value={editPageForm.url}
              onChange={(e) => setEditPageForm({ ...editPageForm, url: e.target.value })}
              labelPlacement="outside"
              classNames={{
                label: 'text-text-secondary',
                input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
                inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl',
              }}
            />
            <div>
              <label className="block text-sm font-medium mb-2 text-text-secondary">分组</label>
              <select
                className="w-full px-4 py-3 bg-background-tertiary/50 border border-border/50 rounded-xl text-sm text-text-primary cursor-pointer outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
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
              <label className="block text-sm font-medium mb-2 text-text-secondary">标签</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer group">
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
                      className="w-4 h-4 rounded border-border bg-background-tertiary/50 text-primary-500 focus:ring-primary-500/20"
                    />
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </label>
                ))}
                {tags.length === 0 && (
                  <p className="text-text-muted text-sm">暂无标签</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
