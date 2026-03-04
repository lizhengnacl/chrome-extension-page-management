import { PageManager } from '../js/page-manager.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-page-to-management',
    title: '添加到页面管理',
    contexts: ['page']
  });
});

async function addCurrentPage(tab) {
  try {
    const pageData = {
      url: tab.url,
      title: tab.title || '',
      tags: [],
      notes: ''
    };
    
    await PageManager.addPage(pageData);
    
    chrome.action.setBadgeText({ text: '✓' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  } catch (error) {
    console.error('添加页面失败:', error);
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'add-page-to-management' && tab) {
    await addCurrentPage(tab);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'add-current-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await addCurrentPage(tab);
    }
  }
});
