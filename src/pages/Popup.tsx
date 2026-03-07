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
      <div className="w-[400px] p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="w-[400px] p-5">
      <h1 className="text-xl font-semibold mb-5 text-gray-900">添加当前页面</h1>

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
      >
        添加页面
      </Button>
    </div>
  );
}
