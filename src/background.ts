import { getStorageUsage, pageStorage } from './src/storage';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('页面管理器已安装');
  }
  
  chrome.contextMenus?.create({
    id: 'pageManagerMenu',
    title: '收藏当前页面',
    contexts: ['page', 'selection', 'link']
  });
});

chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'pageManagerMenu' && tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.startsWith('http')) {
        chrome.runtime.sendMessage({ 
          action: 'openPopup' });
      }
    });
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
