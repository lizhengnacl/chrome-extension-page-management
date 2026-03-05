chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: 'add-page-to-management',
    title: '添加到页面管理',
    contexts: ['page']
  });

  chrome.alarms.create('thumbnail-update', {
    periodInMinutes: 60
  });
});

async function addCurrentPage(tab) {
  try {
    const result = await chrome.storage.local.get('pages');
    const pages = result.pages || [];
    const now = new Date().toISOString();
    
    const newPage = {
      id: 'page_' + Date.now(),
      url: tab.url,
      title: tab.title || '',
      tags: [],
      notes: '',
      folderId: null,
      visitCount: 0,
      createdAt: now,
      updatedAt: now,
      lastVisitedAt: now,
      order: pages.length
    };
    
    pages.push(newPage);
    await chrome.storage.local.set({ pages: pages });
    
    chrome.action.setBadgeText({ text: '✓' });
    setTimeout(function() {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  } catch (error) {
    console.error('添加页面失败:', error);
  }
}

chrome.contextMenus.onClicked.addListener(async function(info, tab) {
  if (info.menuItemId === 'add-page-to-management' && tab) {
    await addCurrentPage(tab);
  }
});

chrome.commands.onCommand.addListener(async function(command) {
  if (command === 'add-current-page') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await addCurrentPage(tab);
    }
  }
});

chrome.alarms.onAlarm.addListener(async function(alarm) {
  if (alarm.name === 'thumbnail-update') {
    console.log('缩略图定期更新任务执行');
  }
});
