import { initStorage, getTags, getGroups, addPage, addTag, addGroup } from '../lib/storage.js';
import { getFaviconUrl, showToast } from '../lib/utils.js';
import { DEFAULT_TAG_COLORS } from '../lib/constants.js';

function getColorForTagName(tagName) {
  if (!tagName || tagName.trim() === '') {
    return DEFAULT_TAG_COLORS[0];
  }
  
  const hash = tagName.trim().toLowerCase().split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const colorIndex = hash % DEFAULT_TAG_COLORS.length;
  return DEFAULT_TAG_COLORS[colorIndex];
}

let currentTab = null;
let selectedTagIds = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initPopup();
});

async function initPopup() {
  try {
    await initStorage();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    
    await renderPageInfo(tab);
    await renderTags();
    await renderGroups();
    bindEvents();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showToast('初始化失败，请重试', 'error');
  }
}

async function renderPageInfo(tab) {
  const faviconEl = document.getElementById('favicon');
  const titleEl = document.getElementById('pageTitle');
  const urlEl = document.getElementById('pageUrl');
  
  const defaultFavicon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0UzRTRFNSIvPgo8cGF0aCBkPSJNMCA4QzAgNi4zNDMxNSAxLjM0MzE1IDUgMyA1SDI5QzMwLjY1NjkgNSAzMiA2LjM0MzE1IDMyIDhWMjRDMzIgMjUuNjU2OSAzMC42NTY5IDI3IDI5IDI3SDNIMUMxLjM0MzE1IDI3IDAgMjUuNjU2OSAwIDI0VjhaIiBmaWxsPSIjNUI3Rjk3Ii8+CjxwYXRoIGQ9Ik03IDExQzcgOS4zNDMxNSA4LjM0MzE1IDggMTAgOEgyMkMyMy42NTY5IDggMjUgOS4zNDMxNSAyNSAxMVYxOUMyNSAyMC42NTY5IDIzLjY1NjkgMjIgMjIgMjJIMTBDOC4zNDMxNSAyMiA3IDIwLjY1NjkgNyAxOVYxMVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+';
  
  faviconEl.src = getFaviconUrl(tab.url) || defaultFavicon;
  faviconEl.onerror = function() {
    this.src = defaultFavicon;
  };
  titleEl.textContent = tab.title || '无标题';
  urlEl.textContent = tab.url;
}

async function renderTags() {
  try {
    const tags = await getTags();
    const container = document.getElementById('tagsContainer');
    container.innerHTML = '';
    
    tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm cursor-pointer transition-all duration-200 select-none hover:opacity-80 hover:scale-[1.02]';
      tagEl.dataset.tagId = tag.id;
      tagEl.style.backgroundColor = tag.color;
      tagEl.style.color = '#ffffff';
      tagEl.innerHTML = `
        ${tag.name}
      `;
      
      tagEl.addEventListener('click', () => toggleTag(tag.id));
      container.appendChild(tagEl);
    });
  } catch (error) {
    console.error('Failed to render tags:', error);
  }
}

async function renderGroups(selectedGroupId = null) {
  try {
    const groups = await getGroups();
    const select = document.getElementById('groupSelect');
    select.innerHTML = '<option value="">未分组</option>';
    
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      if (selectedGroupId === group.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to render groups:', error);
  }
}

function toggleTag(tagId) {
  const index = selectedTagIds.indexOf(tagId);
  if (index > -1) {
    selectedTagIds.splice(index, 1);
  } else {
    selectedTagIds.push(tagId);
  }
  
  document.querySelectorAll('#tagsContainer > span').forEach(tagEl => {
    if (selectedTagIds.includes(tagEl.dataset.tagId)) {
      tagEl.classList.add('ring-2', 'ring-blue-500');
    } else {
      tagEl.classList.remove('ring-2', 'ring-blue-500');
    }
  });
}

async function handleAddTag() {
  const input = document.getElementById('newTagInput');
  const name = input.value.trim();
  
  if (!name) {
    showToast('请输入标签名称', 'error');
    return;
  }
  
  try {
    const color = getColorForTagName(name);
    await addTag({ name, color });
    input.value = '';
    await renderTags();
    showToast('标签添加成功', 'success');
  } catch (error) {
    console.error('Failed to add tag:', error);
    showToast('添加标签失败', 'error');
  }
}

async function handleAddGroup() {
  const input = document.getElementById('newGroupInput');
  const name = input.value.trim();
  
  if (!name) {
    showToast('请输入分组名称', 'error');
    return;
  }
  
  try {
    const newGroup = await addGroup({ name });
    input.value = '';
    await renderGroups(newGroup.id);
    showToast('分组添加成功', 'success');
  } catch (error) {
    console.error('Failed to add group:', error);
    showToast('添加分组失败', 'error');
  }
}

async function handleAddPage() {
  if (!currentTab) {
    showToast('无法获取当前页面信息', 'error');
    return;
  }
  
  const groupSelect = document.getElementById('groupSelect');
  const groupId = groupSelect.value || null;
  
  try {
    await addPage({
      url: currentTab.url,
      title: currentTab.title || '无标题',
      favicon: getFaviconUrl(currentTab.url) || '',
      groupId,
      tags: selectedTagIds,
      isFavorite: false,
      order: 0
    });
    
    showToast('页面添加成功！', 'success');
    
    setTimeout(() => {
      window.close();
    }, 800);
  } catch (error) {
    console.error('Failed to add page:', error);
    if (error.message === 'Page already exists') {
      showToast('该页面已存在', 'error');
    } else {
      showToast('添加页面失败，请重试', 'error');
    }
  }
}

function bindEvents() {
  const addTagBtn = document.getElementById('addTagBtn');
  if (addTagBtn) addTagBtn.addEventListener('click', handleAddTag);
  
  const newTagInput = document.getElementById('newTagInput');
  if (newTagInput) newTagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  });
  
  const addGroupBtn = document.getElementById('addGroupBtn');
  if (addGroupBtn) addGroupBtn.addEventListener('click', handleAddGroup);
  
  const newGroupInput = document.getElementById('newGroupInput');
  if (newGroupInput) newGroupInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAddGroup();
    }
  });
  
  const addPageBtn = document.getElementById('addPageBtn');
  if (addPageBtn) addPageBtn.addEventListener('click', handleAddPage);
}
