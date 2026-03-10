import { getStorageUsage, pageStorage, getStorageData, setStorageData } from './src/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('页集已安装');
  }
  
  chrome.contextMenus?.create({
    id: 'pageManagerMenu',
    title: '收藏到页集',
    contexts: ['page', 'selection', 'link']
  });
});

chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'pageManagerMenu' && tab && tab.url && tab.title) {
    try {
      const url = info.linkUrl || tab.url;
      const title = tab.title || url;
      const favicon = tab.favIconUrl || '';
      
      const data = await getStorageData();
      
      const isDuplicate = data.pages.some(p => p.url === url);
      
      if (isDuplicate) {
        console.log('页面已收藏');
        return;
      }
      
      const newPage = {
        url,
        title,
        favicon,
        tags: [],
        groups: ['default'],
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      data.pages.push(newPage);
      await setStorageData(data);
      
      console.log('页面收藏成功:', title);
      
      chrome.notifications?.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: '页集',
        message: `已收藏: ${title}`,
      });
    } catch (error) {
      console.error('收藏失败:', error);
      chrome.notifications?.create({
        type: 'basic',
        iconUrl: 'icons/icon-128.png',
        title: '页集',
        message: '收藏失败，请重试',
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkStorage') {
    getStorageUsage().then(usage => {
      sendResponse({ usage });
    });
    return true;
  }
  
  if (request.action === 'autoUpdatePages') {
    autoUpdatePagesInfo();
    sendResponse({ success: true });
  }
});

async function autoUpdatePagesInfo() {
  try {
    const pages = await pageStorage.getAll();
    const updates: { id: string; title?: string; favicon?: string }[] = [];

    for (const page of pages) {
      if (!page.favicon || page.favicon.includes('undefined')) {
        updates.push({
          id: page.id,
          favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(page.url)}&sz=32`,
        });
      }
    }

    if (updates.length > 0) {
      await pageStorage.batchUpdateInfo(updates);
      console.log(`已自动更新 ${updates.length} 个页面的信息`);
    }
  } catch (error) {
    console.error('自动更新页面信息失败:', error);
  }
}

chrome.alarms?.create('autoUpdate', { periodInMinutes: 360 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoUpdate') {
    autoUpdatePagesInfo();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.title) {
  }
});

export {};
