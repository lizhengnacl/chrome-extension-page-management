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
import { DEFAULT_TAG_COLORS } from '../lib/constants.js';

let state = {
  pages: [],
  groups: [],
  tags: [],
  searchKeyword: '',
  selectedTagId: null,
  editingPageId: null,
  editingGroupId: null,
  editingTagId: null,
  draggedPageId: null
};

document.addEventListener('DOMContentLoaded', async () => {
  await initNewtab();
});

async function initNewtab() {
  try {
    await initStorage();
    await loadData();
    renderAll();
    bindEvents();
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
  renderFavorites();
  renderTags();
  renderGroups();
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

function renderTags() {
  const container = document.getElementById('tagsList');
  
  if (state.tags.length === 0) {
    container.innerHTML = '<p style="color: #6b7280; font-size: 14px;">暂无标签</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="tag-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <span class="filter-tag ${!state.selectedTagId ? 'active' : ''}" 
            style="background: #e5e7eb; color: #374151;"
            data-tag-id="">全部</span>
    </div>
    ${state.tags.map(tag => `
      <div class="tag-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span class="filter-tag ${state.selectedTagId === tag.id ? 'active' : ''}" 
              style="background: ${tag.color}; color: white;"
              data-tag-id="${tag.id}">${tag.name}</span>
        <button class="btn btn-sm btn-secondary edit-tag-btn" data-tag-id="${tag.id}" style="padding: 2px 8px; font-size: 12px;">编辑</button>
        <button class="btn btn-sm btn-danger delete-tag-btn" data-tag-id="${tag.id}" style="padding: 2px 8px; font-size: 12px;">删除</button>
      </div>
    `).join('')}
  `;
  
  container.querySelectorAll('.filter-tag').forEach(el => {
    el.addEventListener('click', () => {
      state.selectedTagId = el.dataset.tagId || null;
      renderAll();
    });
  });
  
  container.querySelectorAll('.edit-tag-btn').forEach(el => {
    el.addEventListener('click', () => openEditTagModal(el.dataset.tagId));
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
      <div class="group-item" data-group-id="">
        <div class="group-header">
          <span class="group-title">未分组</span>
        </div>
        <div class="pages-list" data-group-id="">
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
        <div class="group-item" data-group-id="${group.id}">
          <div class="group-header">
            <span class="group-title">${group.name}</span>
            <div class="group-actions">
              <button class="btn btn-sm btn-secondary open-group-btn" data-group-id="${group.id}">打开全部</button>
              <button class="btn btn-sm btn-secondary edit-group-btn" data-group-id="${group.id}">编辑</button>
              <button class="btn btn-sm btn-danger delete-group-btn" data-group-id="${group.id}">删除</button>
            </div>
          </div>
          <div class="pages-list" data-group-id="${group.id}">
            ${pages.length === 0 
              ? '<p style="color: #6b7280; font-size: 14px; padding: 16px;">该分组暂无页面</p>'
              : pages.map(page => renderPageItem(page)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (html === '' && state.groups.length === 0) {
    html = '<p style="color: #6b7280; font-size: 14px; padding: 40px; text-align: center;">暂无分组，点击上方按钮添加</p>';
  }
  
  container.innerHTML = html;
  
  container.querySelectorAll('.page-item').forEach(el => {
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
    <div class="page-item" 
         data-page-id="${page.id}" 
         draggable="true">
      <img src="${page.favicon || defaultFavicon}" alt="" class="favicon" data-default-favicon="${defaultFavicon}">
      <div class="page-info">
        <a href="${page.url}" target="_blank" class="page-title" style="text-decoration: none; color: inherit;">
          ${page.title}
        </a>
        <div class="page-url">${page.url}</div>
        ${pageTags.length > 0 ? `
          <div class="page-tags">
            ${pageTags.map(tag => `<span class="page-tag" style="background: ${tag.color};">${tag.name}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="page-actions">
        <button class="page-action-btn favorite-btn ${page.isFavorite ? 'active' : ''}" 
                data-page-id="${page.id}" title="常用">
          ⭐
        </button>
        <button class="page-action-btn edit-page-btn" 
                data-page-id="${page.id}" title="编辑">
          ✏️
        </button>
        <button class="page-action-btn delete-page-btn" 
                data-page-id="${page.id}" title="删除">
          🗑️
        </button>
      </div>
    </div>
  `;
}

function setupPageItemEvents(el) {
  const pageId = el.dataset.pageId;
  const faviconImg = el.querySelector('.favicon');
  
  if (faviconImg) {
    faviconImg.addEventListener('error', function() {
      const defaultFavicon = this.dataset.defaultFavicon;
      if (defaultFavicon && this.src !== defaultFavicon) {
        this.src = defaultFavicon;
      }
    });
  }
  
  el.querySelector('.favorite-btn').addEventListener('click', (e) => {
    e.preventDefault();
    handleToggleFavorite(pageId);
  });
  
  el.querySelector('.edit-page-btn').addEventListener('click', (e) => {
    e.preventDefault();
    openEditPageModal(pageId);
  });
  
  el.querySelector('.delete-page-btn').addEventListener('click', (e) => {
    e.preventDefault();
    handleDeletePage(pageId);
  });
  
  el.addEventListener('dragstart', (e) => {
    state.draggedPageId = pageId;
    el.classList.add('dragging');
  });
  
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    state.draggedPageId = null;
  });
  
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (state.draggedPageId && state.draggedPageId !== pageId) {
      el.classList.add('drag-over');
    }
  });
  
  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });
  
  el.addEventListener('drop', async (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
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
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('modal').classList.remove('active');
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
    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <input type="checkbox" value="${t.id}" class="tag-checkbox">
      <span style="background: ${t.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${t.name}</span>
    </label>
  `).join('');
  
  openModal('添加页面', `
    <div class="form-group">
      <label>URL</label>
      <input type="url" id="pageUrl" placeholder="https://example.com" required>
    </div>
    <div class="form-group">
      <label>标题</label>
      <input type="text" id="pageTitle" placeholder="页面标题" required>
    </div>
    <div class="form-group">
      <label>分组</label>
      <select id="pageGroup">${groupOptions}</select>
    </div>
    <div class="form-group">
      <label>标签</label>
      <div>${tagOptions || '<p style="color: #6b7280; font-size: 14px;">暂无标签</p>'}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="savePageBtn">保存</button>
    </div>
  `);
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('savePageBtn').addEventListener('click', handleSaveNewPage);
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
    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <input type="checkbox" value="${t.id}" class="tag-checkbox" ${page.tags.includes(t.id) ? 'checked' : ''}>
      <span style="background: ${t.color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${t.name}</span>
    </label>
  `).join('');
  
  openModal('编辑页面', `
    <div class="form-group">
      <label>URL</label>
      <input type="url" id="pageUrl" value="${page.url}" required>
    </div>
    <div class="form-group">
      <label>标题</label>
      <input type="text" id="pageTitle" value="${page.title}" required>
    </div>
    <div class="form-group">
      <label>分组</label>
      <select id="pageGroup">${groupOptions}</select>
    </div>
    <div class="form-group">
      <label>标签</label>
      <div>${tagOptions || '<p style="color: #6b7280; font-size: 14px;">暂无标签</p>'}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="savePageBtn">保存</button>
    </div>
  `);
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('savePageBtn').addEventListener('click', handleSaveEditPage);
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
    <div class="form-group">
      <label>分组名称</label>
      <input type="text" id="groupName" placeholder="输入分组名称" required>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="saveGroupBtn">保存</button>
    </div>
  `);
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveGroupBtn').addEventListener('click', handleSaveNewGroup);
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
    <div class="form-group">
      <label>分组名称</label>
      <input type="text" id="groupName" value="${group.name}" required>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="saveGroupBtn">保存</button>
    </div>
  `);
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveGroupBtn').addEventListener('click', handleSaveEditGroup);
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
    <div class="form-group">
      <label>标签名称</label>
      <input type="text" id="tagName" placeholder="输入标签名称" required>
    </div>
    <div class="form-group">
      <label>标签颜色</label>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${DEFAULT_TAG_COLORS.map(color => `
          <label style="cursor: pointer;">
            <input type="radio" name="tagColor" value="${color}" style="display: none;" ${color === DEFAULT_TAG_COLORS[0] ? 'checked' : ''}>
            <span style="display: block; width: 32px; height: 32px; background: ${color}; border-radius: 50%; border: 3px solid transparent;"></span>
          </label>
        `).join('')}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="saveTagBtn">保存</button>
    </div>
  `);
  
  document.querySelectorAll('input[name="tagColor"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="tagColor"]').forEach(r => {
        r.nextElementSibling.style.borderColor = r.checked ? '#111827' : 'transparent';
      });
    });
    radio.nextElementSibling.style.borderColor = radio.checked ? '#111827' : 'transparent';
  });
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveTagBtn').addEventListener('click', handleSaveNewTag);
}

async function handleSaveNewTag() {
  const name = document.getElementById('tagName').value.trim();
  const color = document.querySelector('input[name="tagColor"]:checked')?.value || DEFAULT_TAG_COLORS[0];
  
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
    <div class="form-group">
      <label>标签名称</label>
      <input type="text" id="tagName" value="${tag.name}" required>
    </div>
    <div class="form-group">
      <label>标签颜色</label>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${DEFAULT_TAG_COLORS.map(color => `
          <label style="cursor: pointer;">
            <input type="radio" name="tagColor" value="${color}" style="display: none;" ${color === tag.color ? 'checked' : ''}>
            <span style="display: block; width: 32px; height: 32px; background: ${color}; border-radius: 50%; border: 3px solid transparent;"></span>
          </label>
        `).join('')}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelModalBtn">取消</button>
      <button class="btn btn-primary" id="saveTagBtn">保存</button>
    </div>
  `);
  
  document.querySelectorAll('input[name="tagColor"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('input[name="tagColor"]').forEach(r => {
        r.nextElementSibling.style.borderColor = r.checked ? '#111827' : 'transparent';
      });
    });
    radio.nextElementSibling.style.borderColor = radio.checked ? '#111827' : 'transparent';
  });
  
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('saveTagBtn').addEventListener('click', handleSaveEditTag);
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

async function handleDeleteTag(tagId) {
  const confirmed = await showConfirm('确定要删除这个标签吗？该标签将从所有页面中移除。');
  if (!confirmed) return;
  
  try {
    await deleteTag(tagId);
    await loadData();
    if (state.selectedTagId === tagId) {
      state.selectedTagId = null;
    }
    renderAll();
    showToast('标签已删除', 'success');
  } catch (error) {
    console.error('Failed to delete tag:', error);
    showToast('删除失败', 'error');
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
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });
  
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.searchKeyword = e.target.value;
    renderAll();
  });
  
  document.getElementById('addPageBtn').addEventListener('click', openAddPageModal);
  document.getElementById('addGroupBtn').addEventListener('click', openAddGroupModal);
  document.getElementById('addTagBtn').addEventListener('click', openAddTagModal);
  document.getElementById('exportBtn').addEventListener('click', handleExport);
  document.getElementById('importBtn').addEventListener('click', handleImportClick);
  document.getElementById('importInput').addEventListener('change', (e) => {
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
