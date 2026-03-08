/**
 * 后台脚本
 * 处理扩展的生命周期事件和后台任务
 */

import { getStorageUsage, pageStorage } from './storage';

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('页面管理器已安装');
    // 可以在这里初始化默认数据
  }
});

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkStorage') {
    getStorageUsage().then(usage => {
      sendResponse({ usage });
    });
    return true; // 保持消息通道开启
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

    for (const page of pages) {
      // 检查页面favicon是否有效
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

// 定期执行自动更新（每6小时）
chrome.alarms?.create('autoUpdate', { periodInMinutes: 360 });
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoUpdate') {
    autoUpdatePagesInfo();
  }
});

// 监听标签页更新，自动刷新页面信息
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.title) {
    // 可以在这里检查是否需要更新收藏的页面信息
  }
});

// 导出供其他模块使用
export {};