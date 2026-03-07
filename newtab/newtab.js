import {
  initStorage,
  getPages,
  getGroups,
  getTags,
  getFavoritePages,
  searchPages,
  getPagesByGroupId,
  getPagesByTagId,
  addPage,
  updatePage,
  deletePage,
  addGroup,
  updateGroup,
  deleteGroup,
  addTag,
  updateTag,
  deleteTag,
  exportData,
  importData
} from '../lib/storage.js';
import {
  showToast,
  showConfirm,
  downloadJsonFile,
  readJsonFile,
  getFaviconUrl
} from '../lib/utils.js';
import { generateColorFromTagName } from '../lib/colors.js';

let state = {
  pages: [],
  groups: [],
  tags: [],
  searchKeyword: '',
  selectedTagId: null,
  editingPageId: null,
  editingGroupId: null,
  editingTagId: null,
  draggedPageId: null,
  isSidebarCollapsed: false
};

let lastTagClickTime = 0;
let tagClickTimeout = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initNewtab();
});

async function initNewtab() {
  try {
    await initStorage();
    await loadData();
    renderAll();
    bindEvents();
    
    document.addEventListener('click', (e) => {
      if (state.editingTagId) {
        const isEditingElement = e.target.closest('[data-tag-id="' + state.editingTagId + '"]');
        if (!isEditingElement) {
          saveTagEdit(state.editingTagId);
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize newtab:', error);
    showToast('初始化失败，请刷新页面', 'error');
  }
}

async function loadData() {
  state.pages = await getPages();
  state.groups = await getGroups();
  state.tags = await getTags();
}

function renderAll() {
  renderSidebar();
  renderFavorites();
  renderGroups();
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (state.isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
  
  renderTags();
}

function toggleSidebarCollapse() {
  state.isSidebarCollapsed = !state.isSidebarCollapsed;
  renderSidebar();
}

function renderFavorites() {
  const container = document.getElementById('favoritesList');
  const section = document.getElementById('favoritesSection');
  
  let pages = state.pages.filter(p => p.isFavorite);
  
  if (state.searchKeyword) {
    pages = filterPagesByKeyword(pages, state.searchKeyword);
  }
  
  if (state.selectedTagId) {
    pages = pages.filter(p => p.tags.includes(state.selectedTagId));
  }
  
  if (pages.length === 0) {
    section.classList.add('hidden');
    return;
  }
  
  section.classList.remove('hidden');
  container.innerHTML = pages.map(page => renderPageItem(page, true)).join('');
  container.querySelectorAll('.page-item').forEach(el => {
    setupPageItemEvents(el);
  });
}

function renderEditingTag(tag) {
  return `
    <div class="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg" data-tag-id="${tag.id}">
      <div class="flex items-center gap-2 flex-1">
        <input type="text" 
               value="${tag.name}" 
               class="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none border-2 border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
               data-tag-id="${tag.id}"
               id="editTagInput"
               tabindex="0"
               autofocus>
        <div class="flex gap-1">
          <button class="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-green-600 transition-all duration-200 shadow-sm save-edit-btn" 
                  data-tag-id="${tag.id}" 
                  title="保存 (Enter)"
                  tabindex="1">✓ 保存</button>
          <button class="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-600 transition-all duration-200 shadow-sm cancel-edit-btn" 
                  data-tag-id="${tag.id}" 
                  title="取消 (Esc)"
                  tabindex="2">✕ 取消</button>
        </div>
      </div>
    </div>
  `;
}

function handleTagClick(tagId, event) {
  const currentTime = Date.now();
  const timeSinceLastClick = currentTime - lastTagClickTime;
  
  if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
    if (tagClickTimeout) {
      clearTimeout(tagClickTimeout);
      tagClickTimeout = null;
    }
    startTagEdit(tagId);
  } else {
    tagClickTimeout = setTimeout(() => {
      state.selectedTagId = state.selectedTagId === tagId ? null : tagId;
      renderAll();
    }, 300);
  }
  
  lastTagClickTime = currentTime;
}

function startTagEdit(tagId) {
  state.editingTagId = tagId;
  renderTags();
  
  const input = document.getElementById('editTagInput');
  if (input) {
    input.focus();
    input.select();
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveTagEdit(tagId);
      } else if (e.key === 'Escape') {
        cancelTagEdit();
      }
    });
    
    const saveBtn = input.parentElement.querySelector('.save-edit-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveTagEdit(tagId));
    }
    
    const cancelBtn = input.parentElement.querySelector('.cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => cancelTagEdit());
    }
  }
}

async function saveTagEdit(tagId) {
  const input = document.getElementById('editTagInput');
  const name = input ? input.value.trim() : '';
  
  if (!name) {
    showToast('请输入标签名称', 'error');
    return;
  }
  
  try {
    await updateTag(tagId, { name });
    await loadData();
    state.editingTagId = null;
    renderAll();
    showToast('标签已更新', 'success');
  } catch (error) {
    console.error('Failed to update tag:', error);
    showToast('更新失败', 'error');
  }
}

function cancelTagEdit() {
  state.editingTagId = null;
  renderTags();
}

function renderTags() {
  const container = document.getElementById('tagsList');
  
  if (state.tags.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">暂无标签</p>';
    return;
  }
  
  let html = '';
  
  html += `
    <div class="flex items-center gap-2 mb-2">
      <span class="tag-name flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${!state.selectedTagId ? 'bg-gray-100 ring-2 ring-blue-500' : ''}" 
            style="border-left: 4px solid #9ca3af;"
            data-tag-id=""
            title="显示全部">全部</span>
    </div>
  `;
  
  html += state.tags.map(tag => {
    if (state.editingTagId === tag.id) {
      return renderEditingTag(tag);
    }
    return `
      <div class="flex items-center gap-2 mb-2" data-tag-id="${tag.id}">
        <span class="tag-name flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${state.selectedTagId === tag.id ? 'bg-gray-100 ring-2 ring-blue-500' : ''}" 
              style="border-left: 4px solid ${tag.color};"
              data-tag-id="${tag.id}"
              title="双击编辑">${tag.name}</span>
        <button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors delete-tag-btn" data-tag-id="${tag.id}" title="删除标签">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
  
  container.querySelectorAll('[data-tag-id]').forEach(el => {
    if (el.tagName === 'SPAN') {
      el.addEventListener('click', (e) => handleTagClick(el.dataset.tagId, e));
    }
  });
  
  container.querySelectorAll('.delete-tag-btn').forEach(el => {
    el.addEventListener('click', () => handleDeleteTag(el.dataset.tagId));
  });
}

function renderGroups() {
  const container = document.getElementById('groupsList');
  
  let html = '';
  
  let ungroupedPages = state.pages.filter(p => !p.groupId);
  
  if (state.searchKeyword) {
    ungroupedPages = filterPagesByKeyword(ungroupedPages, state.searchKeyword);
  }
  
  if (state.selectedTagId) {
    ungroupedPages = ungroupedPages.filter(p => p.tags.includes(state.selectedTagId));
  }
  
  if (ungroupedPages.length > 0) {
    html += `
      <div class="bg-white rounded-xl p-5 shadow-sm" data-group-id="">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <span class="text-lg font-semibold text-gray-900">未分组</span>
        </div>
        <div class="flex flex-col gap-2" data-group-id="">
          ${ungroupedPages.map(page => renderPageItem(page)).join('')}
        </div>
      </div>
    `;
  }
  
  if (state.groups.length > 0) {
    html += state.groups.map(group => {
      let pages = state.pages.filter(p => p.groupId === group.id);
      
      if (state.searchKeyword) {
        pages = filterPagesByKeyword(pages, state.searchKeyword);
      }
      
      if (state.selectedTagId) {
        pages = pages.filter(p => p.tags.includes(state.selectedTagId));
      }
      
      return `
        <div class="bg-white rounded-xl p-5 shadow-sm" data-group-id="${group.id}">
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <span class="text-lg font-semibold text-gray-900">${group.name}</span>
            <div class="flex gap-2">
              <button class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200 open-group-btn" data-group-id="${group.id}">打开全部</button>
              <button class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200 edit-group-btn" data-group-id="${group.id}">编辑</button>
              <button class="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium cursor-pointer hover:bg-red-600 transition-all duration-200 delete-group-btn" data-group-id="${group.id}">删除</button>
            </div>
          </div>
          <div class="flex flex-col gap-2" data-group-id="${group.id}">
            ${pages.length === 0 
              ? '<p class="text-gray-500 text-sm p-4">该分组暂无页面</p>'
              : pages.map(page => renderPageItem(page)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (html === '' && state.groups.length === 0) {
    html = '<p class="text-gray-500 text-sm p-10 text-center">暂无分组，点击上方按钮添加</p>';
  }
  
  container.innerHTML = html;
  
  container.querySelectorAll('[data-page-id]').forEach(el => {
    setupPageItemEvents(el);
  });
  
  container.querySelectorAll('.open-group-btn').forEach(el => {
    el.addEventListener('click', () => handleOpenGroup(el.dataset.groupId));
  });
  
  container.querySelectorAll('.edit-group-btn').forEach(el => {
    el.addEventListener('click', () => openEditGroupModal(el.dataset.groupId));
  });
  
  container.querySelectorAll('.delete-group-btn').forEach(el => {
    el.addEventListener('click', () => handleDeleteGroup(el.dataset.groupId));
  });
}

function renderPageItem(page, isFavorite = false) {
  const pageTags = state.tags.filter(t => page.tags.includes(t.id));
  const defaultFavicon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0UzRTRFNSIvPgo8cGF0aCBkPSJNMCA4QzAgNi4zNDMxNSAxLjM0MzE1IDUgMyA1SDI5QzMwLjY1NjkgNSAzMiA2LjM0MzE1IDMyIDhWMjRDMzIgMjUuNjU2OSAzMC42NTY5IDI3IDI5IDI3SDNIMUMxLjM0MzE1IDI3IDAgMjUuNjU2OSAwIDI0VjhaIiBmaWxsPSIjNUI3Rjk3Ii8+CjxwYXRoIGQ9Ik03IDExQzcgOS4zNDMxNSA4LjM0MzE1IDggMTAgOEgyMkMyMy42NTY5IDggMjUgOS4zNDMxNSAyNSAxMVYxOUMyNSAyMC42NTY5IDIzLjY1NjkgMjIgMjIgMjJIMTBDOC4zNDMxNSAyMiA3IDIwLjY1NjkgNyAxOVYxMVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+';
  
  return `
    <div class="page-item flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" 
         data-page-id="${page.id}" 
         draggable="true">
      <img src="${page.favicon || defaultFavicon}" alt="" class="w-6 h-6 rounded flex-shrink-0" data-default-favicon="${defaultFavicon}">
      <div class="flex-1 min-w-0">
        <a href="${page.url}" target="_blank" class="font-medium text-sm text-gray-900 mb-0.5 truncate block" style="text-decoration: none;">
          ${page.title}
        </a>
        <div class="text-xs text-gray-500 truncate">${page.url}</div>
        ${pageTags.length > 0 ? `
          <div class="flex gap-1.5 flex-wrap mt-1">
            ${pageTags.map(tag => `<span class="px-2 py-0.5 rounded-full text-xs text-white" style="background: ${tag.color};">${tag.name}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button class="p-1.5 border-none bg-transparent cursor-pointer rounded text-xl hover:bg-gray-100 transition-colors duration-200 leading-none favorite-btn ${page.isFavorite ? 'text-amber-500' : ''}" 
                data-page-id="${page.id}" title="常用">
          ⭐
        </button>
        <button class="p-1.5 border-none bg-transparent cursor-pointer rounded text-xl hover:bg-gray-100 transition-colors duration-200 leading-none edit-page-btn" 
                data-page-id="${page.id}" title="编辑">
          ✏️
        </button>
        <button class="p-1.5 border-none bg-transparent cursor-pointer rounded text-xl hover:bg-gray-100 transition-colors duration-200 leading-none delete-page-btn" 
                data-page-id="${page.id}" title="删除">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function setupPageItemEvents(el) {
  const pageId = el.dataset.pageId;
  const faviconImg = el.querySelector('img');
  
  if (faviconImg) {
    faviconImg.addEventListener('error', function() {
      const defaultFavicon = this.dataset.defaultFavicon;
      if (defaultFavicon && this.src !== defaultFavicon) {
        this.src = defaultFavicon;
      }
    });
  }
  
  const favoriteBtn = el.querySelector('.favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleToggleFavorite(pageId);
    });
  }
  
  const editPageBtn = el.querySelector('.edit-page-btn');
  if (editPageBtn) {
    editPageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openEditPageModal(pageId);
    });
  }
  
  const deletePageBtn = el.querySelector('.delete-page-btn');
  if (deletePageBtn) {
    deletePageBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleDeletePage(pageId);
    });
  }
  
  el.addEventListener('dragstart', (e) => {
    state.draggedPageId = pageId;
    el.classList.add('opacity-50');
  });
  
  el.addEventListener('dragend', () => {
    el.classList.remove('opacity-50');
    state.draggedPageId = null;
  });
  
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (state.draggedPageId && state.draggedPageId !== pageId) {
      el.classList.add('border-t-3', 'border-t-blue-500');
    }
  });
  
  el.addEventListener('dragleave', () => {
    el.classList.remove('border-t-3', 'border-t-blue-500');
  });
  
  el.addEventListener('drop', async (e) => {
    e.preventDefault();
    el.classList.remove('border-t-3', 'border-t-blue-500');
    if (state.draggedPageId && state.draggedPageId !== pageId) {
      await handleReorderPages(state.draggedPageId, pageId);
    }
  });
}

function filterPagesByKeyword(pages, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const tagIdToName = {};
  state.tags.forEach(tag => {
    tagIdToName[tag.id] = tag.name.toLowerCase();
  });
  
  return pages.filter(page => {
    const titleMatch = page.title.toLowerCase().includes(lowerKeyword);
    const urlMatch = page.url.toLowerCase().includes(lowerKeyword);
    const tagMatch = page.tags.some(tagId => 
      tagIdToName[tagId] && tagIdToName[tagId].includes(lowerKeyword)
    );
    return titleMatch || urlMatch || tagMatch;
  });
}

async function handleToggleFavorite(pageId) {
  try {
    const page = state.pages.find(p => p.id === pageId);
    await updatePage(pageId, { isFavorite: !page.isFavorite });
    await loadData();
    renderAll();
    showToast(page.isFavorite ? '已取消常用' : '已添加到常用', 'success');
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    showToast('操作失败', 'error');
  }
}

async function handleDeletePage(pageId) {
  const confirmed = await showConfirm('确定要删除这个页面吗？');
  if (!confirmed) return;
  
  try {
    await deletePage(pageId);
    await loadData();
    renderAll();
    showToast('页面已删除', 'success');
  } catch (error) {
    console.error('Failed to delete page:', error);
    showToast('删除失败', 'error');
  }
}

async function handleReorderPages(draggedId, targetId) {
  try {
    const draggedPage = state.pages.find(p => p.id === draggedId);
    const targetPage = state.pages.find(p => p.id === targetId);
    
    if (draggedPage.groupId !== targetPage.groupId) {
      showToast('只能在同一分组内排序', 'error');
      return;
    }
    
    const tempOrder = draggedPage.order;
    await updatePage(draggedId, { order: targetPage.order });
    await updatePage(targetId, { order: tempOrder });
    
    await loadData();
    renderAll();
  } catch (error) {
    console.error('Failed to reorder pages:', error);
    showToast('排序失败', 'error');
  }
}

async function handleOpenGroup(groupId) {
  try {
    const pages = state.pages.filter(p => p.groupId === groupId);
    for (const page of pages) {
      chrome.tabs.create({ url: page.url, active: false });
    }
    showToast(`已打开 ${pages.length} 个页面`, 'success');
  } catch (error) {
    console.error('Failed to open group:', error);
    showToast('打开失败', 'error');
  }
}

async function handleDeleteGroup(groupId) {
  const confirmed = await showConfirm('确定要删除这个分组吗？该分组下的页面将变为未分组。');
  if (!confirmed) return;
  
  try {
    await deleteGroup(groupId);
    await loadData();
    renderAll();
    showToast('分组已删除', 'success');
  } catch (error) {
    console.error('Failed to delete group:', error);
    showToast('删除失败', 'error');
  }
}

function openModal(title, contentHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalContent').innerHTML = contentHTML;
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  state.editingPageId = null;
  state.editingGroupId = null;
  state.editingTagId = null;
}

function openAddPageModal() {
  const groupOptions = `
    <option value="">未分组</option>
    ${state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
  `;
  
  const tagOptions = state.tags.map(t => `
    <label class="flex items-center gap-2 mb-2">
      <input type="checkbox" value="${t.id}" class="tag-checkbox">
      <span class="px-2 py-0.5 rounded-full text-xs text-white" style="background: ${t.color};">${t.name}</span>
    </label>
  `).join('');
  
  openModal('添加页面', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">URL</label>
      <input type="url" id="pageUrl" placeholder="https://example.com" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标题</label>
      <input type="text" id="pageTitle" placeholder="页面标题" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">分组</label>
      <select id="pageGroup" class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white cursor-pointer outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">${groupOptions}</select>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标签</label>
      <div>${tagOptions || '<p class="text-gray-500 text-sm">暂无标签</p>'}</div>
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="savePageBtn">保存</button>
    </div>
  `);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const savePageBtn = document.getElementById('savePageBtn');
  if (savePageBtn) savePageBtn.addEventListener('click', handleSaveNewPage);
}

async function handleSaveNewPage() {
  const url = document.getElementById('pageUrl').value.trim();
  const title = document.getElementById('pageTitle').value.trim();
  const groupId = document.getElementById('pageGroup').value || null;
  const tagIds = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
  
  if (!url || !title) {
    showToast('请填写 URL 和标题', 'error');
    return;
  }
  
  try {
    await addPage({
      url,
      title,
      favicon: getFaviconUrl(url),
      groupId,
      tags: tagIds,
      isFavorite: false,
      order: state.pages.length
    });
    
    await loadData();
    renderAll();
    closeModal();
    showToast('页面已添加', 'success');
  } catch (error) {
    console.error('Failed to add page:', error);
    if (error.message === 'Page already exists') {
      showToast('该页面已存在', 'error');
    } else {
      showToast('添加失败', 'error');
    }
  }
}

function openEditPageModal(pageId) {
  const page = state.pages.find(p => p.id === pageId);
  state.editingPageId = pageId;
  
  const groupOptions = `
    <option value="">未分组</option>
    ${state.groups.map(g => `<option value="${g.id}" ${g.id === page.groupId ? 'selected' : ''}>${g.name}</option>`).join('')}
  `;
  
  const tagOptions = state.tags.map(t => `
    <label class="flex items-center gap-2 mb-2">
      <input type="checkbox" value="${t.id}" class="tag-checkbox" ${page.tags.includes(t.id) ? 'checked' : ''}>
      <span class="px-2 py-0.5 rounded-full text-xs text-white" style="background: ${t.color};">${t.name}</span>
    </label>
  `).join('');
  
  openModal('编辑页面', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">URL</label>
      <input type="url" id="pageUrl" value="${page.url}" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标题</label>
      <input type="text" id="pageTitle" value="${page.title}" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">分组</label>
      <select id="pageGroup" class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white cursor-pointer outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">${groupOptions}</select>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标签</label>
      <div>${tagOptions || '<p class="text-gray-500 text-sm">暂无标签</p>'}</div>
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="savePageBtn">保存</button>
    </div>
  `);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const savePageBtn = document.getElementById('savePageBtn');
  if (savePageBtn) savePageBtn.addEventListener('click', handleSaveEditPage);
}

async function handleSaveEditPage() {
  const url = document.getElementById('pageUrl').value.trim();
  const title = document.getElementById('pageTitle').value.trim();
  const groupId = document.getElementById('pageGroup').value || null;
  const tagIds = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
  
  if (!url || !title) {
    showToast('请填写 URL 和标题', 'error');
    return;
  }
  
  try {
    await updatePage(state.editingPageId, {
      url,
      title,
      favicon: getFaviconUrl(url),
      groupId,
      tags: tagIds
    });
    
    await loadData();
    renderAll();
    closeModal();
    showToast('页面已更新', 'success');
  } catch (error) {
    console.error('Failed to update page:', error);
    showToast('更新失败', 'error');
  }
}

function openAddGroupModal() {
  openModal('添加分组', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">分组名称</label>
      <input type="text" id="groupName" placeholder="输入分组名称" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="saveGroupBtn">保存</button>
    </div>
  `);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const saveGroupBtn = document.getElementById('saveGroupBtn');
  if (saveGroupBtn) saveGroupBtn.addEventListener('click', handleSaveNewGroup);
}

async function handleSaveNewGroup() {
  const name = document.getElementById('groupName').value.trim();
  if (!name) {
    showToast('请输入分组名称', 'error');
    return;
  }
  
  try {
    await addGroup({
      name,
      order: state.groups.length
    });
    
    await loadData();
    renderAll();
    closeModal();
    showToast('分组已添加', 'success');
  } catch (error) {
    console.error('Failed to add group:', error);
    showToast('添加失败', 'error');
  }
}

function openEditGroupModal(groupId) {
  const group = state.groups.find(g => g.id === groupId);
  state.editingGroupId = groupId;
  
  openModal('编辑分组', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">分组名称</label>
      <input type="text" id="groupName" value="${group.name}" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="saveGroupBtn">保存</button>
    </div>
  `);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const saveGroupBtn = document.getElementById('saveGroupBtn');
  if (saveGroupBtn) saveGroupBtn.addEventListener('click', handleSaveEditGroup);
}

async function handleSaveEditGroup() {
  const name = document.getElementById('groupName').value.trim();
  if (!name) {
    showToast('请输入分组名称', 'error');
    return;
  }
  
  try {
    await updateGroup(state.editingGroupId, { name });
    await loadData();
    renderAll();
    closeModal();
    showToast('分组已更新', 'success');
  } catch (error) {
    console.error('Failed to update group:', error);
    showToast('更新失败', 'error');
  }
}

function openAddTagModal() {
  openModal('添加标签', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标签名称</label>
      <input type="text" id="tagName" placeholder="输入标签名称" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="saveTagBtn">保存</button>
    </div>
  `);
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const saveTagBtn = document.getElementById('saveTagBtn');
  if (saveTagBtn) saveTagBtn.addEventListener('click', handleSaveNewTag);
}

async function handleSaveNewTag() {
  const name = document.getElementById('tagName').value.trim();
  const color = generateColorFromTagName(name);
  
  if (!name) {
    showToast('请输入标签名称', 'error');
    return;
  }
  
  try {
    await addTag({ name, color });
    await loadData();
    renderAll();
    closeModal();
    showToast('标签已添加', 'success');
  } catch (error) {
    console.error('Failed to add tag:', error);
    showToast('添加失败', 'error');
  }
}

function openEditTagModal(tagId) {
  const tag = state.tags.find(t => t.id === tagId);
  state.editingTagId = tagId;
  
  openModal('编辑标签', `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标签名称</label>
      <input type="text" id="tagName" value="${tag.name}" required class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200">
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium mb-1.5 text-gray-700">标签颜色</label>
      <div class="flex gap-2 flex-wrap">
        ${DEFAULT_TAG_COLORS.map(color => `
          <label class="cursor-pointer">
            <input type="radio" name="tagColor" value="${color}" class="hidden" ${color === tag.color ? 'checked' : ''}>
            <span class="block w-8 h-8 rounded-full border-3 border-transparent" style="background: ${color};"></span>
          </label>
        `).join('')}
      </div>
    </div>
    <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
      <button class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200" id="cancelModalBtn">取消</button>
      <button class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200" id="saveTagBtn">保存</button>
    </div>
  `);
  
  const tagColorRadios = document.querySelectorAll('input[name="tagColor"]');
  tagColorRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="tagColor"]').forEach(r => {
        if (r.nextElementSibling) {
          r.nextElementSibling.style.borderColor = r.checked ? '#111827' : 'transparent';
        }
      });
    });
    if (radio.nextElementSibling) {
      radio.nextElementSibling.style.borderColor = radio.checked ? '#111827' : 'transparent';
    }
  });
  
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  
  const saveTagBtn = document.getElementById('saveTagBtn');
  if (saveTagBtn) saveTagBtn.addEventListener('click', handleSaveEditTag);
}

async function handleSaveEditTag() {
  const name = document.getElementById('tagName').value.trim();
  const color = document.querySelector('input[name="tagColor"]:checked')?.value || DEFAULT_TAG_COLORS[0];
  
  if (!name) {
    showToast('请输入标签名称', 'error');
    return;
  }
  
  try {
    await updateTag(state.editingTagId, { name, color });
    await loadData();
    renderAll();
    closeModal();
    showToast('标签已更新', 'success');
  } catch (error) {
    console.error('Failed to update tag:', error);
    showToast('更新失败', 'error');
  }
}

let isDeletingTag = false;

async function handleDeleteTag(tagId) {
  if (isDeletingTag) return;
  
  const tag = state.tags.find(t => t.id === tagId);
  if (!tag) {
    showToast('标签不存在', 'error');
    return;
  }
  
  const pageCount = state.pages.filter(p => p.tags.includes(tagId)).length;
  let confirmMessage = `确定要删除标签「${tag.name}」吗？`;
  if (pageCount > 0) {
    confirmMessage += `\n\n该标签关联了 ${pageCount} 个页面，删除后将从这些页面中移除。`;
  } else {
    confirmMessage += '\n\n该标签未关联任何页面。';
  }
  
  const confirmed = await showConfirm(confirmMessage);
  if (!confirmed) return;
  
  isDeletingTag = true;
  
  try {
    await deleteTag(tagId);
    await loadData();
    if (state.selectedTagId === tagId) {
      state.selectedTagId = null;
    }
    renderAll();
    
    const successMessage = pageCount > 0 
      ? `标签「${tag.name}」已删除，已从 ${pageCount} 个页面中移除` 
      : `标签「${tag.name}」已删除`;
    showToast(successMessage, 'success');
  } catch (error) {
    console.error('Failed to delete tag:', error);
    showToast('删除失败', 'error');
  } finally {
    isDeletingTag = false;
  }
}

async function handleExport() {
  try {
    const data = await exportData();
    const filename = `page-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJsonFile(data, filename);
    showToast('数据已导出', 'success');
  } catch (error) {
    console.error('Failed to export:', error);
    showToast('导出失败', 'error');
  }
}

function handleImportClick() {
  document.getElementById('importInput').click();
}

async function handleImport(file) {
  try {
    const jsonString = await readJsonFile(file);
    await importData(jsonString);
    await loadData();
    renderAll();
    showToast('数据已导入', 'success');
  } catch (error) {
    console.error('Failed to import:', error);
    showToast('导入失败，请检查文件格式', 'error');
  }
}

function bindEvents() {
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', (e) => {
    state.searchKeyword = e.target.value;
    renderAll();
  });
  
  const addPageBtn = document.getElementById('addPageBtn');
  if (addPageBtn) addPageBtn.addEventListener('click', openAddPageModal);
  
  const addGroupBtn = document.getElementById('addGroupBtn');
  if (addGroupBtn) addGroupBtn.addEventListener('click', openAddGroupModal);
  
  const addTagBtn = document.getElementById('addTagBtn');
  if (addTagBtn) addTagBtn.addEventListener('click', openAddTagModal);
  
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn) collapseBtn.addEventListener('click', toggleSidebarCollapse);
  
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.addEventListener('click', handleExport);
  
  const importBtn = document.getElementById('importBtn');
  if (importBtn) importBtn.addEventListener('click', handleImportClick);
  
  const importInput = document.getElementById('importInput');
  if (importInput) importInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      handleImport(e.target.files[0]);
      e.target.value = '';
    }
  });
}

export {
  initNewtab,
  loadData,
  renderAll,
  renderSidebar,
  toggleSidebarCollapse,
  renderFavorites,
  renderTags,
  renderGroups,
  renderPageItem,
  setupPageItemEvents,
  filterPagesByKeyword,
  handleToggleFavorite,
  handleDeletePage,
  handleReorderPages,
  handleOpenGroup,
  handleDeleteGroup,
  openModal,
  closeModal,
  openAddPageModal,
  handleSaveNewPage,
  openEditPageModal,
  handleSaveEditPage,
  openAddGroupModal,
  handleSaveNewGroup,
  openEditGroupModal,
  handleSaveEditGroup,
  openAddTagModal,
  handleSaveNewTag,
  openEditTagModal,
  handleSaveEditTag,
  handleDeleteTag,
  handleExport,
  handleImportClick,
  handleImport,
  bindEvents
};
