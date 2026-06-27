import { getStorageUsage, pageStorage } from './src/storage';
import { isSpecialPage } from './src/utils';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('页集已安装');
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
  }

  if (tab.url && (changeInfo.status === 'complete' || changeInfo.title)) {
    await updatePageInfoIfNeeded(tab.url, changeInfo.title || tab.title, tab.favIconUrl);
  }
});

function updateExtensionIcon(tab: chrome.tabs.Tab) {
  const isSpecial = tab.url ? isSpecialPage(tab.url) : true;
  
  const iconPath = {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png'
  };
  
  chrome.action.setIcon({
    tabId: tab.id,
    path: iconPath,
  });
  
  chrome.action.setBadgeText({
    tabId: tab.id,
    text: isSpecial ? '' : '',
  });
}

async function updatePageInfoIfNeeded(url: string, title?: string, favIconUrl?: string) {
  try {
    const matchingPage = await pageStorage.getByUrl(url);
    
    if (matchingPage) {
      const updates: { id: string; title?: string; favicon?: string } = {
        id: matchingPage.id,
      };

      if (title) {
        updates.title = title;
      }
      
      if (favIconUrl && favIconUrl !== matchingPage.favicon) {
        updates.favicon = favIconUrl;
      }
      
      if (updates.title || updates.favicon) {
        await pageStorage.batchUpdateInfo([updates]);
        console.log('已检查页面信息:', url);
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
});

export {};
