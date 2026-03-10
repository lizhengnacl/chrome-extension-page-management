import { getStorageUsage, pageStorage, getStorageData, setStorageData } from './src/storage';
import { isSpecialPage } from './src/utils';

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
      
      if (isSpecialPage(url)) {
        chrome.notifications?.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: '页集',
          message: '该页面不支持收藏',
        });
        return;
      }
      
      const title = tab.title || url;
      const favicon = tab.favIconUrl || '';
      
      const data = await getStorageData();
      
      const isDuplicate = data.pages.some(p => p.url === url);
      
      if (isDuplicate) {
        console.log('页面已收藏');
        chrome.notifications?.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: '页集',
          message: '该页面已收藏',
        });
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

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateExtensionIcon(tab);
  } catch {
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateExtensionIcon(tab);
    
    if (tab.url && tab.title) {
      await updatePageInfoIfNeeded(tab.url, tab.title, tab.favIconUrl);
    }
  }
});

function updateExtensionIcon(tab: chrome.tabs.Tab) {
  const isSpecial = tab.url ? isSpecialPage(tab.url) : true;
  
  const iconPath = 'icons/icon.svg';
  
  chrome.action.setIcon({
    tabId: tab.id,
    path: iconPath,
  });
  
  chrome.action.setBadgeText({
    tabId: tab.id,
    text: isSpecial ? '' : '',
  });
}

async function updatePageInfoIfNeeded(url: string, title: string, favIconUrl?: string) {
  try {
    const pages = await pageStorage.getAll();
    const matchingPage = pages.find(p => p.url === url);
    
    if (matchingPage) {
      const updates: { id: string; title?: string; favicon?: string } = {
        id: matchingPage.id,
      };
      
      if (title && title !== matchingPage.title) {
        updates.title = title;
      }
      
      if (favIconUrl && favIconUrl !== matchingPage.favicon) {
        updates.favicon = favIconUrl;
      }
      
      if (updates.title || updates.favicon) {
        await pageStorage.batchUpdateInfo([updates]);
        console.log('已自动更新页面信息:', url);
      }
    }
  } catch (error) {
    console.error('更新页面信息失败:', error);
  }
}

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

    for (const page of pages.slice(0, 20)) {
      try {
        if (!page.favicon || page.favicon.includes('undefined')) {
          try {
            const urlObj = new URL(page.url);
            updates.push({
              id: page.id,
              favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`,
            });
          } catch {
          }
        }
      } catch {
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

export {};
