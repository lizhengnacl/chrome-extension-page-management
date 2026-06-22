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
    
    if (tab.url) {
      await updatePageInfoIfNeeded(tab.url, tab.favIconUrl);
    }
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

async function updatePageInfoIfNeeded(url: string, favIconUrl?: string) {
  try {
    const pages = await pageStorage.getAll();
    const matchingPage = pages.find(p => p.url === url);
    
    if (matchingPage) {
      const updates: { id: string; title?: string; favicon?: string } = {
        id: matchingPage.id,
      };
      
      if (favIconUrl && favIconUrl !== matchingPage.favicon) {
        updates.favicon = favIconUrl;
      }
      
      if (updates.favicon) {
        await pageStorage.batchUpdateInfo([updates]);
        console.log('已自动更新页面图标:', url);
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
