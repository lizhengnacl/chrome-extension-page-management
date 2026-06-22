/**
 * 后台脚本
 * 处理扩展的生命周期事件和后台任务
 */

import { getStorageUsage, pageStorage } from './storage';
import { isSpecialPage } from './utils';

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('页集已安装');
  }
});

// 监听当前标签页变化，更新插件图标状态
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateExtensionIcon(tab);
  } catch {
    // 忽略错误
  }
});

// 监听标签页更新，更新插件图标状态和页面信息
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateExtensionIcon(tab);
    
    // 检查是否需要更新已收藏页面的信息
    if (tab.url) {
      await updatePageInfoIfNeeded(tab.url, tab.favIconUrl);
    }
  }
});

// 更新扩展图标状态
function updateExtensionIcon(tab: chrome.tabs.Tab) {
  const isSpecial = tab.url ? isSpecialPage(tab.url) : true;
  
  // 设置图标路径（使用相同图标，但通过禁用状态来区分）
  const iconPath = 'icons/icon.svg';
  
  chrome.action.setIcon({
    tabId: tab.id,
    path: iconPath,
  });
  
  // 设置图标禁用状态
  chrome.action.setBadgeText({
    tabId: tab.id,
    text: isSpecial ? '' : '',
  });
}

// 更新已收藏页面的信息
async function updatePageInfoIfNeeded(url: string, favIconUrl?: string) {
  try {
    const pages = await pageStorage.getAll();
    const matchingPage = pages.find(p => p.url === url);
    
    if (matchingPage) {
      const updates: { id: string; title?: string; favicon?: string } = {
        id: matchingPage.id,
      };
      
      // favicon 变化时更新
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

// 监听来自内容脚本或弹出窗口的消息
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

// 定期检查并更新页面信息（标题、favicon）
async function autoUpdatePagesInfo() {
  try {
    const pages = await pageStorage.getAll();
    const updates: { id: string; title?: string; favicon?: string }[] = [];

    for (const page of pages.slice(0, 20)) { // 限制每次检查20个
      try {
        // 更新空的 favicon
        if (!page.favicon || page.favicon.includes('undefined')) {
          // 尝试从 URL 提取域名并获取 favicon
          try {
            const urlObj = new URL(page.url);
            updates.push({
              id: page.id,
              favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`,
            });
          } catch {
            // 忽略 URL 解析错误
          }
        }
      } catch {
        // 忽略单个页面的错误
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

// 定期执行自动更新（每6小时）
chrome.alarms?.create('autoUpdate', { periodInMinutes: 360 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoUpdate') {
    autoUpdatePagesInfo();
  }
});

// 导出供其他模块使用
export {};
