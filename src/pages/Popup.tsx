import { useState, useEffect } from 'react';
import { Button } from '../components/common';
import { PageInfo } from '../components/popup/PageInfo';
import { TagSelector } from '../components/popup/TagSelector';
import { GroupSelector } from '../components/popup/GroupSelector';
import { initStorage, addPage as addPageToStorage } from '../utils/storage';
import { usePages } from '../hooks/usePages';
import { useGroups } from '../hooks/useGroups';
import { useTags } from '../hooks/useTags';
import { getFaviconUrl, showToast } from '../utils/utils';

interface CurrentTab {
  url: string;
  title: string;
}

export function Popup() {
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { addPage } = usePages();
  const { groups, addGroup } = useGroups();
  const { tags, addTag } = useTags();

  useEffect(() => {
    const init = async () => {
      try {
        await initStorage();
        setIsInitialized(true);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          setCurrentTab({
            url: tab.url || '',
            title: tab.title || '无标题',
          });
        }
      } catch (error) {
        console.error('Failed to initialize popup:', error);
        showToast('初始化失败，请重试', 'error');
      }
    };

    init();
  }, []);

  const handleAddPage = async () => {
    if (!currentTab) {
      showToast('无法获取当前页面信息', 'error');
      return;
    }

    try {
      setIsAdding(true);
      
      await addPage({
        url: currentTab.url,
        title: currentTab.title,
        favicon: getFaviconUrl(currentTab.url) || '',
        groupId: selectedGroupId,
        tags: selectedTagIds,
        isFavorite: false,
        order: 0,
      });

      showToast('页面添加成功！', 'success');

      setTimeout(() => {
        window.close();
      }, 800);
    } catch (error) {
      console.error('Failed to add page:', error);
      if (error instanceof Error && error.message === 'Page already exists') {
        showToast('该页面已存在', 'error');
      } else {
        showToast('添加页面失败，请重试', 'error');
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (!isInitialized || !currentTab) {
    return (
      <div className="w-[420px] p-8 flex flex-col items-center justify-center min-h-[240px] bg-background-primary">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary text-lg">加载中...</p>
      </div>
    );
  }

  return (
    <div className="w-[420px] p-6 bg-background-primary">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
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
          <h1 className="text-xl font-bold text-gradient">添加当前页面</h1>
        </div>

        <div className="space-y-5 animate-fade-in">
          <PageInfo
            url={currentTab.url}
            title={currentTab.title}
            favicon={getFaviconUrl(currentTab.url)}
          />

          <TagSelector
            selectedTags={selectedTagIds}
            availableTags={tags}
            onChange={setSelectedTagIds}
            onAddTag={addTag}
          />

          <GroupSelector
            selectedGroupId={selectedGroupId}
            availableGroups={groups}
            onChange={setSelectedGroupId}
            onAddGroup={addGroup}
          />

          <Button
            color="primary"
            fullWidth
            onClick={handleAddPage}
            isLoading={isAdding}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all py-3 text-lg font-semibold"
          >
            {isAdding ? '添加中...' : '添加页面'}
          </Button>
        </div>
      </div>
    </div>
  );
}
