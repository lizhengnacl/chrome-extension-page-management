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
  }

  // 检查是否需要更新已收藏页面的信息
  if (tab.url && (changeInfo.status === 'complete' || changeInfo.title)) {
    await updatePageInfoIfNeeded(tab.url, changeInfo.title || tab.title, tab.favIconUrl);
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
      
      // favicon 变化时更新
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

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkStorage') {
    getStorageUsage().then(usage => {
      sendResponse({ usage });
    });
    return true;
  }
});

// 导出供其他模块使用
export {};
