import { debounce, isValidUrl, showNotification, parseTags } from '../js/utils.js';
import { PageManager } from '../js/page-manager.js';
import { Search } from '../js/search.js';
import { ImportExport } from '../js/import-export.js';

const app = {
  state: {
    pages: [],
    folders: [],
    searchQuery: '',
    selectedFolder: 'all',
    selectedTag: null,
    sortBy: 'lastVisitedAt',
    sortOrder: 'desc',
    undoTimeout: null
  },
  
  elements: {},
  
  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.render();
    if (window.feather) {
      feather.replace();
    }
  },
  
  cacheElements() {
    this.elements = {
      addCurrentPageBtn: document.getElementById('addCurrentPageBtn'),
      exportBtn: document.getElementById('exportBtn'),
      importBtn: document.getElementById('importBtn'),
      importFileInput: document.getElementById('importFileInput'),
      searchInput: document.getElementById('searchInput'),
      sortBy: document.getElementById('sortBy'),
      sortOrderBtn: document.getElementById('sortOrderBtn'),
      pageList: document.getElementById('pageList'),
      addPageModal: document.getElementById('addPageModal'),
      closeModalBtn: document.getElementById('closeModalBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      addPageForm: document.getElementById('addPageForm'),
      pageUrl: document.getElementById('pageUrl'),
      pageTitle: document.getElementById('pageTitle'),
      pageFolder: document.getElementById('pageFolder'),
      pageTags: document.getElementById('pageTags'),
      pageNotes: document.getElementById('pageNotes'),
      editingPageId: document.getElementById('editingPageId'),
      modalTitle: document.getElementById('modalTitle'),
      submitBtn: document.getElementById('submitBtn'),
      undoBar: document.getElementById('undoBar'),
      undoBtn: document.getElementById('undoBtn'),
      folderSelector: document.querySelector('.folder-selector'),
      tagCloud: document.getElementById('tagCloud')
    };
  },
  
  bindEvents() {
    this.elements.addCurrentPageBtn.addEventListener('click', () => this.addCurrentPage());
    this.elements.exportBtn.addEventListener('click', () => this.exportData());
    this.elements.importBtn.addEventListener('click', () => this.elements.importFileInput.click());
    this.elements.importFileInput.addEventListener('change', (e) => this.importData(e));
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
    this.elements.addPageForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.elements.searchInput.addEventListener('input', debounce((e) => this.handleSearch(e), 300));
    this.elements.sortBy.addEventListener('change', () => this.handleSortChange());
    this.elements.sortOrderBtn.addEventListener('click', () => this.toggleSortOrder());
    this.elements.undoBtn.addEventListener('click', () => this.undoDelete());
    
    this.elements.folderSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) {
        this.state.selectedFolder = btn.dataset.folder;
        this.render();
      }
    });
    
    this.elements.tagCloud.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-btn');
      if (btn) {
        const tag = btn.dataset.tag;
        this.state.selectedTag = this.state.selectedTag === tag ? null : tag;
        this.render();
      }
    });
    
    this.elements.pageList.addEventListener('click', (e) => {
      const pageItem = e.target.closest('.page-item');
      if (!pageItem) return;
      
      const titleEl = e.target.closest('.page-item-title');
      const editBtn = e.target.closest('[id^="edit-btn-"]');
      const deleteBtn = e.target.closest('[id^="delete-btn-"]');
      
      if (titleEl) {
        const pageId = titleEl.id.replace('page-title-', '');
        this.openPage(pageId);
      } else if (editBtn) {
        const pageId = editBtn.id.replace('edit-btn-', '');
        this.openEditPageModal(pageId);
      } else if (deleteBtn) {
        const pageId = deleteBtn.id.replace('delete-btn-', '');
        this.deletePage(pageId);
      }
    });
    
    this.elements.addPageModal.addEventListener('click', (e) => {
      if (e.target === this.elements.addPageModal) {
        this.closeModal();
      }
    });
  },
  
  async loadData() {
    try {
      this.state.pages = await PageManager.getAllPages();
      this.state.folders = await FolderManager.getAllFolders();
    } catch (error) {
      console.error('加载数据失败:', error);
      showNotification('加载数据失败', 'error');
    }
  },
  
  render() {
    const filteredPages = this.getFilteredPages();
    this.renderFolderSelector();
    this.renderTagCloud();
    this.renderPageList(filteredPages);
    this.updateSortOrderBtn();
    if (window.feather) {
      feather.replace();
    }
  },
  
  getFilteredPages() {
    let pages = [...this.state.pages];
    
    if (this.state.selectedFolder !== 'all') {
      pages = pages.filter(page => page.folderId === this.state.selectedFolder);
    }
    
    if (this.state.selectedTag) {
      pages = pages.filter(page => page.tags.includes(this.state.selectedTag));
    }
    
    if (this.state.searchQuery) {
      pages = Search.searchPages(pages, this.state.searchQuery);
    }
    
    pages = PageManager.sortPages(pages, { 
      sortBy: this.state.sortBy, 
      sortOrder: this.state.sortOrder 
    });
    
    return pages;
  },
  
  renderFolderSelector() {
    let html = '<button class="filter-btn' + (this.state.selectedFolder === 'all' ? ' active' : '') + '" data-folder="all">全部</button>';
    
    this.state.folders.forEach(folder => {
      html += '<button class="filter-btn' + (this.state.selectedFolder === folder.id ? ' active' : '') + '" data-folder="' + folder.id + '">' + this.escapeHtml(folder.name) + '</button>';
    });
    
    this.elements.folderSelector.innerHTML = html;
  },
  
  renderTagCloud() {
    const allTags = new Set();
    this.state.pages.forEach(page => {
      page.tags.forEach(tag => allTags.add(tag));
    });
    
    let html = '';
    allTags.forEach(tag => {
      html += '<button class="tag-btn' + (this.state.selectedTag === tag ? ' active' : '') + '" data-tag="' + tag + '">' + this.escapeHtml(tag) + '</button>';
    });
    
    this.elements.tagCloud.innerHTML = html;
  },
  
  renderPageList(pages) {
    if (pages.length === 0) {
      this.elements.pageList.innerHTML = `
        <div class="empty-state">
          <p>还没有保存的页面</p>
          <p>点击上方按钮添加第一个页面</p>
        </div>
      `;
      return;
    }
    
    this.elements.pageList.innerHTML = pages.map(page => this.renderPageItem(page)).join('');
  },
  
  renderPageItem(page) {
    const tagsHtml = page.tags.map(tag => `<span class="page-tag">${this.escapeHtml(tag)}</span>`).join('');
    const folder = page.folderId ? this.state.folders.find(f => f.id === page.folderId) : null;
    
    return `
      <div class="page-item">
        <div class="page-item-header">
          <div id="page-title-${page.id}" class="page-item-title">${this.escapeHtml(page.title)}</div>
          <div class="page-item-actions">
            <button id="edit-btn-${page.id}" class="icon-btn" title="编辑"><i data-feather="edit-2"></i></button>
            <button id="delete-btn-${page.id}" class="icon-btn" title="删除"><i data-feather="trash-2"></i></button>
          </div>
        </div>
        <div class="page-item-url">${this.escapeHtml(page.url)}</div>
        <div class="page-item-footer">
          <div class="page-item-meta">
            ${folder ? `<span class="page-folder"><i data-feather="folder" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${this.escapeHtml(folder.name)}</span>` : ''}
            <div class="page-item-tags">${tagsHtml}</div>
          </div>
          <div class="page-stats">
            <span class="page-visit-count"><i data-feather="eye" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${page.visitCount}</span>
          </div>
        </div>
      </div>
    `;
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  updateSortOrderBtn() {
    const icon = this.state.sortOrder === 'desc' ? 'chevron-down' : 'chevron-up';
    this.elements.sortOrderBtn.innerHTML = `<i data-feather="${icon}"></i>`;
    if (window.feather) {
      feather.replace();
    }
  },
  
  updateFolderSelect() {
    let html = '<option value="">无分组</option>';
    this.state.folders.forEach(folder => {
      html += `<option value="${folder.id}">${this.escapeHtml(folder.name)}</option>`;
    });
    this.elements.pageFolder.innerHTML = html;
  },
  
  async addCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
        showNotification('无法添加此页面', 'error');
        return;
      }
      
      await PageManager.addPage({
        url: tab.url,
        title: tab.title || '',
        tags: [],
        notes: ''
      });
      
      showNotification('页面添加成功', 'success');
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('添加当前页面失败:', error);
      showNotification('添加当前页面失败', 'error');
    }
  },
  
  async exportData() {
    try {
      const data = await ImportExport.exportData();
      ImportExport.downloadData(data);
      showNotification('数据导出成功', 'success');
    } catch (error) {
      console.error('导出数据失败:', error);
      showNotification('导出数据失败', 'error');
    }
  },
  
  async importData(event) {
    try {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      await ImportExport.importData(data);
      
      showNotification('数据导入成功', 'success');
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('导入数据失败:', error);
      showNotification('导入数据失败，请检查文件格式', 'error');
    } finally {
      event.target.value = '';
    }
  },
  
  async openEditPageModal(pageId) {
    try {
      const page = await PageManager.getPage(pageId);
      if (!page) {
        showNotification('页面不存在', 'error');
        return;
      }
      
      this.elements.modalTitle.textContent = '编辑页面';
      this.elements.submitBtn.textContent = '更新';
      this.elements.editingPageId.value = pageId;
      this.updateFolderSelect();
      this.elements.pageUrl.value = page.url;
      this.elements.pageTitle.value = page.title;
      this.elements.pageFolder.value = page.folderId || '';
      this.elements.pageTags.value = page.tags.join(', ');
      this.elements.pageNotes.value = page.notes;
      
      this.elements.addPageModal.classList.remove('hidden');
      this.elements.pageUrl.focus();
    } catch (error) {
      console.error('加载页面失败:', error);
      showNotification('加载页面失败', 'error');
    }
  },
  
  closeModal() {
    this.elements.addPageModal.classList.add('hidden');
    this.elements.addPageForm.reset();
    this.elements.editingPageId.value = '';
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const url = this.elements.pageUrl.value.trim();
    const title = this.elements.pageTitle.value.trim();
    const folderId = this.elements.pageFolder.value || null;
    const tagsInput = this.elements.pageTags.value.trim();
    const notes = this.elements.pageNotes.value.trim();
    const editingPageId = this.elements.editingPageId.value;
    
    if (!isValidUrl(url)) {
      showNotification('请输入有效的URL', 'error');
      return;
    }
    
    const tags = parseTags(tagsInput);
    
    try {
      if (editingPageId) {
        await PageManager.updatePage(editingPageId, { url, title, folderId, tags, notes });
        showNotification('页面更新成功', 'success');
      }
      this.closeModal();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('操作失败:', error);
      showNotification('操作失败', 'error');
    }
  },
  
  handleSearch(e) {
    this.state.searchQuery = e.target.value;
    this.render();
  },
  
  handleSortChange() {
    this.state.sortBy = this.elements.sortBy.value;
    this.render();
  },
  
  toggleSortOrder() {
    this.state.sortOrder = this.state.sortOrder === 'desc' ? 'asc' : 'desc';
    this.render();
  },
  
  async openPage(pageId) {
    try {
      const page = await PageManager.getPage(pageId);
      if (page) {
        await chrome.tabs.create({ url: page.url });
        await PageManager.recordVisit(pageId);
        await this.loadData();
        this.render();
      }
    } catch (error) {
      console.error('打开页面失败:', error);
      showNotification('打开页面失败', 'error');
    }
  },
  
  async deletePage(pageId) {
    try {
      await PageManager.deletePage(pageId);
      showNotification('页面已删除', 'success');
      await this.loadData();
      this.render();
      this.showUndoBar();
    } catch (error) {
      console.error('删除页面失败:', error);
      showNotification('删除页面失败', 'error');
    }
  },
  
  showUndoBar() {
    this.elements.undoBar.classList.remove('hidden');
    
    if (this.state.undoTimeout) {
      clearTimeout(this.state.undoTimeout);
    }
    
    this.state.undoTimeout = setTimeout(() => {
      this.hideUndoBar();
    }, 5000);
  },
  
  hideUndoBar() {
    this.elements.undoBar.classList.add('hidden');
    if (this.state.undoTimeout) {
      clearTimeout(this.state.undoTimeout);
      this.state.undoTimeout = null;
    }
  },
  
  async undoDelete() {
    try {
      await PageManager.undoDeletePage();
      showNotification('页面已恢复', 'success');
      await this.loadData();
      this.render();
      this.hideUndoBar();
    } catch (error) {
      console.error('撤销删除失败:', error);
      showNotification('撤销删除失败', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
