import { debounce, isValidUrl, showNotification, parseTags } from '../js/utils.js';
import { PageManager } from '../js/page-manager.js';
import { FolderManager } from '../js/folder-manager.js';
import { Search } from '../js/search.js';
import { ImportExport } from '../js/import-export.js';
import { LocalStorage } from '../js/local-storage.js';
import { ThumbnailManager } from '../js/thumbnail-manager.js';
import { DragDrop } from '../js/drag-drop.js';
import { Dashboard } from '../js/dashboard.js';
import { SearchHistory } from '../js/search-history.js';
import { UIComponents } from '../js/ui-components.js';

const app = {
  state: {
    pages: [],
    folders: [],
    searchQuery: '',
    searchHistory: [],
    selectedFolder: 'all',
    selectedTag: null,
    sortBy: 'lastVisitedAt',
    sortOrder: 'desc',
    undoTimeout: null,
    selectedPageIds: new Set(),
    newTabSettings: null,
    groupExpandedStates: {},
    thumbnails: {},
    draggedPageId: null,
    draggedFromFolderId: null
  },

  elements: {},

  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.render();
    UIComponents.enhanceSearchInput(this.elements.searchInput);
    if (window.feather) {
      feather.replace();
    }
  },

  cacheElements() {
    this.elements = {
      settingsBtn: document.getElementById('settingsBtn'),
      addPageBtn: document.getElementById('addPageBtn'),
      addFolderBtn: document.getElementById('addFolderBtn'),
      addCurrentPageBtn: document.getElementById('addCurrentPageBtn'),
      exportBtn: document.getElementById('exportBtn'),
      importBtn: document.getElementById('importBtn'),
      importFileInput: document.getElementById('importFileInput'),
      searchInput: document.getElementById('searchInput'),
      searchSuggestions: document.getElementById('searchSuggestions'),
      sortBy: document.getElementById('sortBy'),
      sortOrderBtn: document.getElementById('sortOrderBtn'),
      columnToggleBtn: document.getElementById('columnToggleBtn'),
      pageList: document.getElementById('pageList'),
      createFolderDropZone: document.getElementById('createFolderDropZone'),
      addPageModal: document.getElementById('addPageModal'),
      addFolderModal: document.getElementById('addFolderModal'),
      batchMoveModal: document.getElementById('batchMoveModal'),
      batchAddTagsModal: document.getElementById('batchAddTagsModal'),
      settingsPanel: document.getElementById('settingsPanel'),
      closeModalBtn: document.getElementById('closeModalBtn'),
      closeFolderModalBtn: document.getElementById('closeFolderModalBtn'),
      closeBatchMoveModalBtn: document.getElementById('closeBatchMoveModalBtn'),
      closeBatchAddTagsModalBtn: document.getElementById('closeBatchAddTagsModalBtn'),
      closeSettingsBtn: document.getElementById('closeSettingsBtn'),
      cancelBtn: document.getElementById('cancelBtn'),
      cancelFolderBtn: document.getElementById('cancelFolderBtn'),
      cancelBatchMoveBtn: document.getElementById('cancelBatchMoveBtn'),
      cancelBatchAddTagsBtn: document.getElementById('cancelBatchAddTagsBtn'),
      addPageForm: document.getElementById('addPageForm'),
      addFolderForm: document.getElementById('addFolderForm'),
      batchMoveForm: document.getElementById('batchMoveForm'),
      batchAddTagsForm: document.getElementById('batchAddTagsForm'),
      pageUrl: document.getElementById('pageUrl'),
      pageTitle: document.getElementById('pageTitle'),
      pageFolder: document.getElementById('pageFolder'),
      pageTags: document.getElementById('pageTags'),
      pageNotes: document.getElementById('pageNotes'),
      folderName: document.getElementById('folderName'),
      batchMoveFolder: document.getElementById('batchMoveFolder'),
      batchAddTagsInput: document.getElementById('batchAddTagsInput'),
      editingPageId: document.getElementById('editingPageId'),
      modalTitle: document.getElementById('modalTitle'),
      submitBtn: document.getElementById('submitBtn'),
      undoBar: document.getElementById('undoBar'),
      undoBtn: document.getElementById('undoBtn'),
      folderSelector: document.querySelector('.folder-selector'),
      tagCloud: document.getElementById('tagCloud'),
      dashboard: document.getElementById('dashboard'),
      totalPages: document.getElementById('totalPages'),
      totalFolders: document.getElementById('totalFolders'),
      totalVisits: document.getElementById('totalVisits'),
      pagesAddedToday: document.getElementById('pagesAddedToday'),
      topPages: document.getElementById('topPages'),
      recentPages: document.getElementById('recentPages'),
      batchToolbar: document.getElementById('batchToolbar'),
      selectedCount: document.getElementById('selectedCount'),
      batchDeleteBtn: document.getElementById('batchDeleteBtn'),
      batchMoveBtn: document.getElementById('batchMoveBtn'),
      batchAddTagsBtn: document.getElementById('batchAddTagsBtn'),
      batchExportBtn: document.getElementById('batchExportBtn'),
      clearSelectionBtn: document.getElementById('clearSelectionBtn'),
      showDashboardSetting: document.getElementById('showDashboardSetting'),
      defaultViewSetting: document.getElementById('defaultViewSetting'),
      columnSettings: document.getElementById('columnSettings')
    };
  },

  bindEvents() {
    this.elements.settingsBtn.addEventListener('click', () => this.openSettingsPanel());
    this.elements.addPageBtn.addEventListener('click', () => this.openAddPageModal());
    this.elements.addFolderBtn.addEventListener('click', () => this.openAddFolderModal());
    this.elements.addCurrentPageBtn.addEventListener('click', () => this.addCurrentPage());
    this.elements.exportBtn.addEventListener('click', () => this.exportData());
    this.elements.importBtn.addEventListener('click', () => this.elements.importFileInput.click());
    this.elements.importFileInput.addEventListener('change', (e) => this.importData(e));
    this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.elements.closeFolderModalBtn.addEventListener('click', () => this.closeFolderModal());
    this.elements.closeBatchMoveModalBtn.addEventListener('click', () => this.closeBatchMoveModal());
    this.elements.closeBatchAddTagsModalBtn.addEventListener('click', () => this.closeBatchAddTagsModal());
    this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettingsPanel());
    this.elements.cancelBtn.addEventListener('click', () => this.closeModal());
    this.elements.cancelFolderBtn.addEventListener('click', () => this.closeFolderModal());
    this.elements.cancelBatchMoveBtn.addEventListener('click', () => this.closeBatchMoveModal());
    this.elements.cancelBatchAddTagsBtn.addEventListener('click', () => this.closeBatchAddTagsModal());
    this.elements.addPageForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.elements.addFolderForm.addEventListener('submit', (e) => this.handleAddFolder(e));
    this.elements.batchMoveForm.addEventListener('submit', (e) => this.handleBatchMove(e));
    this.elements.batchAddTagsForm.addEventListener('submit', (e) => this.handleBatchAddTags(e));
    this.elements.searchInput.addEventListener('input', debounce((e) => this.handleSearch(e), 300));
    this.elements.searchInput.addEventListener('focus', () => this.showSearchSuggestions());
    this.elements.searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchSuggestions(), 200));
    this.elements.sortBy.addEventListener('change', () => this.handleSortChange());
    this.elements.sortOrderBtn.addEventListener('click', () => this.toggleSortOrder());
    this.elements.columnToggleBtn.addEventListener('click', () => this.openSettingsPanel());
    this.elements.undoBtn.addEventListener('click', () => this.undoDelete());
    this.elements.batchDeleteBtn.addEventListener('click', () => this.batchDelete());
    this.elements.batchMoveBtn.addEventListener('click', () => this.openBatchMoveModal());
    this.elements.batchAddTagsBtn.addEventListener('click', () => this.openBatchAddTagsModal());
    this.elements.batchExportBtn.addEventListener('click', () => this.batchExport());
    this.elements.clearSelectionBtn.addEventListener('click', () => this.clearSelection());
    this.elements.showDashboardSetting.addEventListener('change', () => this.handleSettingChange());
    this.elements.defaultViewSetting.addEventListener('change', () => this.handleSettingChange());

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

      const pageId = pageItem.dataset.pageId;
      const titleEl = e.target.closest('.page-item-title');
      const editBtn = e.target.closest('[id^="edit-btn-"]');
      const deleteBtn = e.target.closest('[id^="delete-btn-"]');
      const checkbox = e.target.closest('[id^="checkbox-"]');
      const refreshThumbnailBtn = e.target.closest('[id^="refresh-thumbnail-"]');
      const groupHeader = e.target.closest('.group-header');

      if (groupHeader) {
        const folderId = groupHeader.dataset.folderId;
        this.toggleGroupExpanded(folderId);
      } else if (checkbox) {
        this.togglePageSelection(pageId);
      } else if (titleEl) {
        this.openPage(pageId);
      } else if (editBtn) {
        this.openEditPageModal(pageId);
      } else if (deleteBtn) {
        this.deletePage(pageId);
      } else if (refreshThumbnailBtn) {
        this.refreshThumbnail(pageId);
      }
    });

    this.elements.dashboard.addEventListener('click', (e) => {
      const listItem = e.target.closest('.dashboard-list-item');
      if (listItem) {
        const pageId = listItem.dataset.pageId;
        this.openPage(pageId);
      }
    });

    this.elements.searchSuggestions.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.search-suggestion');
      if (suggestion) {
        const type = suggestion.dataset.type;
        const query = suggestion.dataset.query;
        const pageId = suggestion.dataset.pageId;
        
        if (type === 'page' && pageId) {
          this.openPage(pageId);
        } else {
          this.elements.searchInput.value = query;
          this.handleSearch({ target: this.elements.searchInput });
        }
        this.hideSearchSuggestions();
      }
    });

    this.elements.addPageModal.addEventListener('click', (e) => {
      if (e.target === this.elements.addPageModal) {
        this.closeModal();
      }
    });

    this.elements.addFolderModal.addEventListener('click', (e) => {
      if (e.target === this.elements.addFolderModal) {
        this.closeFolderModal();
      }
    });

    this.elements.batchMoveModal.addEventListener('click', (e) => {
      if (e.target === this.elements.batchMoveModal) {
        this.closeBatchMoveModal();
      }
    });

    this.elements.batchAddTagsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.batchAddTagsModal) {
        this.closeBatchAddTagsModal();
      }
    });

    this.elements.settingsPanel.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsPanel) {
        this.closeSettingsPanel();
      }
    });

    this.elements.columnSettings.addEventListener('change', (e) => {
      const checkbox = e.target.closest('[id^="column-"]');
      if (checkbox) {
        this.handleColumnSettingChange(checkbox);
      }
    });

    this.elements.pageList.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.elements.pageList.addEventListener('dragend', (e) => this.handleDragEnd(e));
    this.elements.pageList.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.elements.pageList.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.elements.pageList.addEventListener('drop', (e) => this.handleDrop(e));

    if (this.elements.createFolderDropZone) {
      this.elements.createFolderDropZone.addEventListener('dragover', (e) => this.handleCreateFolderDragOver(e));
      this.elements.createFolderDropZone.addEventListener('dragleave', (e) => this.handleCreateFolderDragLeave(e));
      this.elements.createFolderDropZone.addEventListener('drop', (e) => this.handleCreateFolderDrop(e));
    }
  },

  async loadData() {
    try {
      const [pages, folders, searchHistory, newTabSettings] = await Promise.all([
        PageManager.getAllPages(),
        FolderManager.getAllFolders(),
        LocalStorage.getSearchHistory(),
        LocalStorage.getNewTabSettings()
      ]);
      
      this.state.pages = pages;
      this.state.folders = folders;
      this.state.searchHistory = searchHistory;
      this.state.newTabSettings = newTabSettings;
      this.applySettings();
    } catch (error) {
      console.error('加载数据失败:', error);
      showNotification('加载数据失败', 'error');
    }
  },

  applySettings() {
    if (this.state.newTabSettings) {
      this.state.sortBy = this.state.newTabSettings.sortBy;
      this.state.sortOrder = this.state.newTabSettings.sortOrder;
      this.elements.sortBy.value = this.state.sortBy;
      this.updateSortOrderBtn();
    }
  },

  render() {
    const filteredPages = this.getFilteredPages();
    this.renderDashboard();
    this.renderFolderSelector();
    this.renderTagCloud();
    this.renderPageList(filteredPages);
    this.renderBatchToolbar();
    this.updateSortOrderBtn();
    this.loadThumbnailsForPages(filteredPages);
    if (window.feather) {
      feather.replace();
    }
  },

  async loadThumbnailsForPages(pages) {
    const visiblePages = pages.slice(0, 20);
    const batchSize = 5;
    
    for (let i = 0; i < visiblePages.length; i += batchSize) {
      const batch = visiblePages.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (page) => {
          if (!this.state.thumbnails[page.id]) {
            try {
              const thumbnail = await ThumbnailManager.getThumbnailForPage(page);
              if (thumbnail) {
                this.state.thumbnails[page.id] = thumbnail;
                this.updatePageThumbnail(page.id);
              }
            } catch (error) {
              console.error('加载缩略图失败:', error);
            }
          }
        })
      );
    }
  },

  updatePageThumbnail(pageId) {
    const thumbnail = this.state.thumbnails[pageId];
    if (!thumbnail) return;

    const pageItem = document.querySelector(`[data-page-id="${pageId}"]`);
    if (!pageItem) return;

    const thumbnailContainer = pageItem.querySelector('.page-item-thumbnail');
    if (!thumbnailContainer) return;

    const faviconUrl = thumbnail.faviconUrl || ThumbnailManager.getFaviconUrl(this.state.pages.find(p => p.id === pageId)?.url || '');
    
    let thumbnailContent = '';
    if (thumbnail.thumbnailUrl) {
      thumbnailContent = `<img src="${thumbnail.thumbnailUrl}" alt="缩略图" loading="lazy">`;
    } else if (faviconUrl) {
      thumbnailContent = `<img src="${faviconUrl}" alt="Favicon" loading="lazy" style="width: 48px; height: 48px;">`;
    } else {
      thumbnailContent = `<i data-feather="file-text" style="width:48px;height:48px;opacity:0.5;"></i>`;
    }
    
    thumbnailContainer.innerHTML = thumbnailContent;
  },

  getFilteredPages() {
    let pages = [...this.state.pages];

    if (this.state.searchQuery) {
      pages = Search.searchPages(pages, this.state.searchQuery);
    }

    if (this.state.selectedFolder !== 'all') {
      pages = pages.filter(p => p.folderId === this.state.selectedFolder);
    }

    if (this.state.selectedTag) {
      pages = pages.filter(p => p.tags && p.tags.includes(this.state.selectedTag));
    }

    pages = PageManager.sortPages(pages, {
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder
    });

    return pages;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  renderDashboard() {
    const settings = this.state.newTabSettings || { showDashboard: true };
    
    if (!settings.showDashboard) {
      this.elements.dashboard.classList.add('hidden');
      return;
    }
    
    this.elements.dashboard.classList.remove('hidden');
    
    const stats = Dashboard.calculateStatistics(this.state.pages, this.state.folders);
    this.elements.totalPages.textContent = stats.totalPages;
    this.elements.totalFolders.textContent = stats.totalFolders;
    this.elements.totalVisits.textContent = stats.totalVisits;
    this.elements.pagesAddedToday.textContent = stats.pagesAddedToday;
    
    this.renderTopPages();
    this.renderRecentPages();
  },

  renderTopPages() {
    const topPages = Dashboard.getTopPages(this.state.pages, 10);
    
    if (topPages.length === 0) {
      this.elements.topPages.innerHTML = '<div class="dashboard-empty">暂无数据</div>';
      return;
    }
    
    this.elements.topPages.innerHTML = topPages.map((page, index) => this.renderDashboardListItem(page, 'top', index + 1)).join('');
  },

  renderRecentPages() {
    const recentPages = Dashboard.getRecentPages(this.state.pages, 10);
    
    if (recentPages.length === 0) {
      this.elements.recentPages.innerHTML = '<div class="dashboard-empty">暂无数据</div>';
      return;
    }
    
    this.elements.recentPages.innerHTML = recentPages.map(page => this.renderDashboardListItem(page, 'recent')).join('');
  },

  renderDashboardListItem(page, type, rank = null) {
    const faviconUrl = ThumbnailManager.getFaviconUrl(page.url);
    const dateDisplay = type === 'recent' ? Dashboard.formatDate(page.createdAt) : `${page.visitCount} 次`;
    const rankDisplay = rank ? `<span style="font-size:12px;opacity:0.8;margin-right:4px;">${rank}.</span>` : '';
    
    return `
      <div class="dashboard-list-item" data-page-id="${page.id}">
        <div class="dashboard-item-icon">
          ${faviconUrl ? `<img src="${faviconUrl}" alt="" style="width:20px;height:20px;">` : '<i data-feather="file-text" style="width:20px;height:20px;"></i>'}
        </div>
        <div class="dashboard-item-main">
          <div class="dashboard-item-title">${rankDisplay}${this.escapeHtml(page.title)}</div>
          <div class="dashboard-item-url">${this.escapeHtml(page.url)}</div>
        </div>
        <div class="dashboard-item-meta">
          <div class="${type === 'top' ? 'dashboard-item-count' : 'dashboard-item-date'}">${dateDisplay}</div>
        </div>
      </div>
    `;
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

    const defaultView = this.state.newTabSettings?.defaultView || 'grouped';

    if (this.state.selectedFolder !== 'all' || defaultView === 'flat-recent') {
      this.elements.pageList.innerHTML = pages.map(page => this.renderPageItem(page)).join('');
    } else {
      const groupedPages = {};
      const ungroupedPages = [];

      pages.forEach(page => {
        if (page.folderId) {
          if (!groupedPages[page.folderId]) {
            groupedPages[page.folderId] = [];
          }
          groupedPages[page.folderId].push(page);
        } else {
          ungroupedPages.push(page);
        }
      });

      let html = '';

      for (const folderId in groupedPages) {
        const folder = this.state.folders.find(f => f.id === folderId);
        if (folder) {
          html += this.renderGroup(folder, groupedPages[folderId]);
        }
      }

      if (ungroupedPages.length > 0) {
        html += this.renderGroup(null, ungroupedPages);
      }

      this.elements.pageList.innerHTML = html;
    }
  },

  renderGroup(folder, pages) {
    const folderId = folder ? folder.id : 'ungrouped';
    const folderName = folder ? folder.name : '未分组';
    const isExpanded = this.state.groupExpandedStates[folderId] !== false;

    return `
      <div class="group-container" data-folder-id="${folderId}">
        <div class="group-header" data-folder-id="${folderId}">
          <div class="group-header-left">
            <span class="group-toggle-icon ${isExpanded ? '' : 'collapsed'}"><i data-feather="chevron-down" style="width:16px;height:16px;display:inline-block;vertical-align:middle;"></i></span>
            <span class="group-title">${this.escapeHtml(folderName)}</span>
            <span class="group-count">${pages.length}</span>
          </div>
        </div>
        <div class="group-content ${isExpanded ? '' : 'collapsed'}">
          <div class="group-pages">
            ${pages.map(page => this.renderPageItem(page)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  renderPageItem(page) {
    const tagsHtml = page.tags.map(tag => `<span class="page-tag">${this.escapeHtml(tag)}</span>`).join('');
    const folder = page.folderId ? this.state.folders.find(f => f.id === page.folderId) : null;
    const settings = this.state.newTabSettings || { showColumns: { thumbnail: true, tags: true, stats: true } };
    const showThumbnail = settings.showColumns?.thumbnail !== false;
    const showTags = settings.showColumns?.tags !== false;
    const showStats = settings.showColumns?.stats !== false;

    const lastVisitedDate = page.lastVisitedAt ? new Date(page.lastVisitedAt).toLocaleDateString('zh-CN') : '';
    const thumbnail = this.state.thumbnails[page.id];
    const faviconUrl = thumbnail?.faviconUrl || ThumbnailManager.getFaviconUrl(page.url);

    let thumbnailContent = '';
    if (thumbnail?.thumbnailUrl) {
      thumbnailContent = `<img src="${thumbnail.thumbnailUrl}" alt="缩略图" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (faviconUrl) {
      thumbnailContent = `<img src="${faviconUrl}" alt="Favicon" loading="lazy">`;
    } else {
      thumbnailContent = `<i data-feather="file-text" style="width:48px;height:48px;opacity:0.5;"></i>`;
    }

    return `
      <div class="page-item" data-page-id="${page.id}">
        <input type="checkbox" id="checkbox-${page.id}" class="page-item-checkbox" ${this.state.selectedPageIds.has(page.id) ? 'checked' : ''}>
        <div class="page-item-thumbnail ${showThumbnail ? '' : 'hidden'}">
          ${thumbnailContent}
        </div>
        <div class="page-item-main">
          <div id="page-title-${page.id}" class="page-item-title">${this.escapeHtml(page.title)}</div>
          <div class="page-item-url">${this.escapeHtml(page.url)}</div>
          <div class="page-item-meta ${showTags ? '' : 'hidden'}">
            ${folder ? `<span class="page-folder"><i data-feather="folder" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${this.escapeHtml(folder.name)}</span>` : ''}
            <div class="page-item-tags">${tagsHtml}</div>
          </div>
        </div>
        <div class="page-item-stats ${showStats ? '' : 'hidden'}">
          <span class="page-visit-count"><i data-feather="eye" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> ${page.visitCount}</span>
          <span class="page-visit-date">${lastVisitedDate}</span>
        </div>
        <div class="page-item-actions">
          <button id="refresh-thumbnail-${page.id}" class="icon-btn" title="刷新缩略图"><i data-feather="refresh-cw"></i></button>
          <button id="edit-btn-${page.id}" class="icon-btn" title="编辑"><i data-feather="edit-2"></i></button>
          <button id="delete-btn-${page.id}" class="icon-btn" title="删除"><i data-feather="trash-2"></i></button>
        </div>
      </div>
    `;
  },

  renderBatchToolbar() {
    if (this.state.selectedPageIds.size > 0) {
      this.elements.batchToolbar.classList.remove('hidden');
      this.elements.selectedCount.textContent = `已选择 ${this.state.selectedPageIds.size} 个页面`;
    } else {
      this.elements.batchToolbar.classList.add('hidden');
    }
  },

  updateSortOrderBtn() {
    const icon = this.state.sortOrder === 'desc' ? 'chevron-down' : 'chevron-up';
    this.elements.sortOrderBtn.innerHTML = `<i data-feather="${icon}"></i>`;
    if (window.feather) {
      feather.replace();
    }
  },

  toggleGroupExpanded(folderId) {
    this.state.groupExpandedStates[folderId] = !this.state.groupExpandedStates[folderId];
    this.render();
  },

  togglePageSelection(pageId) {
    if (this.state.selectedPageIds.has(pageId)) {
      this.state.selectedPageIds.delete(pageId);
    } else {
      this.state.selectedPageIds.add(pageId);
    }
    this.renderBatchToolbar();
  },

  clearSelection() {
    this.state.selectedPageIds.clear();
    this.render();
  },

  async refreshThumbnail(pageId) {
    try {
      delete this.state.thumbnails[pageId];
      const page = this.state.pages.find(p => p.id === pageId);
      if (page) {
        const thumbnail = await ThumbnailManager.refreshThumbnail(pageId);
        if (thumbnail) {
          this.state.thumbnails[pageId] = thumbnail;
        }
        const newThumbnail = await ThumbnailManager.getThumbnailForPage(page);
        if (newThumbnail) {
          this.state.thumbnails[pageId] = newThumbnail;
          this.updatePageThumbnail(pageId);
        }
      }
      showNotification('缩略图已刷新', 'success');
    } catch (error) {
      console.error('刷新缩略图失败:', error);
      showNotification('刷新缩略图失败', 'error');
    }
  },

  updateFolderSelect() {
    let html = '<option value="">无分组</option>';
    this.state.folders.forEach(folder => {
      html += `<option value="${folder.id}">${this.escapeHtml(folder.name)}</option>`;
    });
    this.elements.pageFolder.innerHTML = html;
    this.elements.batchMoveFolder.innerHTML = html;
  },

  openAddPageModal() {
    this.elements.modalTitle.textContent = '添加页面';
    this.elements.submitBtn.textContent = '保存';
    this.elements.editingPageId.value = '';
    this.elements.addPageForm.reset();
    this.updateFolderSelect();

    try {
      const [tab] = chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && !tab.url.startsWith('chrome://')) {
        this.elements.pageUrl.value = tab.url;
        this.elements.pageTitle.value = tab.title || '';
      }
    } catch (error) {
      console.error('获取当前标签页失败:', error);
    }

    this.elements.addPageModal.classList.remove('hidden');
    this.elements.pageUrl.focus();
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

  openAddFolderModal() {
    this.elements.addFolderForm.reset();
    this.elements.addFolderModal.classList.remove('hidden');
    this.elements.folderName.focus();
  },

  closeFolderModal() {
    this.elements.addFolderModal.classList.add('hidden');
    this.elements.addFolderForm.reset();
  },

  openBatchMoveModal() {
    this.updateFolderSelect();
    this.elements.batchMoveModal.classList.remove('hidden');
  },

  closeBatchMoveModal() {
    this.elements.batchMoveModal.classList.add('hidden');
  },

  openBatchAddTagsModal() {
    this.elements.batchAddTagsModal.classList.remove('hidden');
  },

  closeBatchAddTagsModal() {
    this.elements.batchAddTagsModal.classList.add('hidden');
    this.elements.batchAddTagsInput.value = '';
  },

  openSettingsPanel() {
    this.renderColumnSettings();
    if (this.state.newTabSettings) {
      this.elements.showDashboardSetting.checked = this.state.newTabSettings.showDashboard !== false;
      this.elements.defaultViewSetting.value = this.state.newTabSettings.defaultView || 'grouped';
    }
    this.elements.settingsPanel.classList.remove('hidden');
  },

  closeSettingsPanel() {
    this.elements.settingsPanel.classList.add('hidden');
  },

  renderColumnSettings() {
    const settings = this.state.newTabSettings || { showColumns: { thumbnail: true, tags: true, stats: true } };
    const columns = [
      { id: 'thumbnail', label: '缩略图' },
      { id: 'tags', label: '标签和分组' },
      { id: 'stats', label: '访问统计' }
    ];

    let html = '';
    columns.forEach(col => {
      const isChecked = settings.showColumns?.[col.id] !== false;
      html += `
        <div class="column-settings-item">
          <input type="checkbox" id="column-${col.id}" ${isChecked ? 'checked' : ''}>
          <label for="column-${col.id}">${col.label}</label>
        </div>
      `;
    });
    this.elements.columnSettings.innerHTML = html;
  },

  async handleSearch(e) {
    const query = e.target.value;
    this.state.searchQuery = query;
    
    if (SearchHistory.validateQuery(query)) {
      await LocalStorage.addSearchHistoryItem(query);
      this.state.searchHistory = await LocalStorage.getSearchHistory();
    }
    
    this.render();
  },

  showSearchSuggestions() {
    const query = this.elements.searchInput.value;
    const suggestions = SearchHistory.getSuggestions(
      this.state.searchHistory,
      this.state.pages,
      query,
      10
    );
    
    if (suggestions.length === 0) {
      this.hideSearchSuggestions();
      return;
    }
    
    this.renderSearchSuggestions(suggestions);
    this.elements.searchSuggestions.classList.remove('hidden');
  },

  hideSearchSuggestions() {
    this.elements.searchSuggestions.classList.add('hidden');
  },

  renderSearchSuggestions(suggestions) {
    let html = '';
    
    suggestions.forEach(suggestion => {
      const icon = suggestion.type === 'history' ? 'clock' : 'file-text';
      html += `
        <div class="search-suggestion" data-type="${suggestion.type}" data-query="${this.escapeHtml(suggestion.query)}" data-page-id="${suggestion.pageId || ''}">
          <span class="suggestion-icon"><i data-feather="${icon}" style="width:16px;height:16px;"></i></span>
          <span class="suggestion-text">${this.escapeHtml(suggestion.displayText)}</span>
          ${suggestion.url ? `<span class="suggestion-url">${this.escapeHtml(suggestion.url)}</span>` : ''}
        </div>
      `;
    });
    
    this.elements.searchSuggestions.innerHTML = html;
  },

  handleSortChange() {
    this.state.sortBy = this.elements.sortBy.value;
    this.saveSettings();
    this.render();
  },

  toggleSortOrder() {
    this.state.sortOrder = this.state.sortOrder === 'desc' ? 'asc' : 'desc';
    this.saveSettings();
    this.render();
  },

  async saveSettings() {
    this.state.newTabSettings = {
      ...this.state.newTabSettings,
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder
    };
    await LocalStorage.saveNewTabSettings(this.state.newTabSettings);
  },

  handleSettingChange() {
    this.state.newTabSettings = {
      ...this.state.newTabSettings,
      showDashboard: this.elements.showDashboardSetting.checked,
      defaultView: this.elements.defaultViewSetting.value
    };
    LocalStorage.saveNewTabSettings(this.state.newTabSettings);
    this.render();
  },

  handleColumnSettingChange(checkbox) {
    const columnId = checkbox.id.replace('column-', '');
    if (!this.state.newTabSettings) {
      this.state.newTabSettings = { showColumns: {} };
    }
    if (!this.state.newTabSettings.showColumns) {
      this.state.newTabSettings.showColumns = {};
    }
    this.state.newTabSettings.showColumns[columnId] = checkbox.checked;
    LocalStorage.saveNewTabSettings(this.state.newTabSettings);
    this.render();
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
      } else {
        await PageManager.addPage({ url, title, folderId, tags, notes });
        showNotification('页面添加成功', 'success');
      }
      this.closeModal();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('操作失败:', error);
      showNotification('操作失败', 'error');
    }
  },

  async handleAddFolder(e) {
    e.preventDefault();

    const name = this.elements.folderName.value.trim();

    if (!name) {
      showNotification('请输入分组名称', 'error');
      return;
    }

    try {
      await FolderManager.addFolder(name);
      showNotification('分组创建成功', 'success');
      this.closeFolderModal();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('创建分组失败:', error);
      showNotification('创建分组失败', 'error');
    }
  },

  async handleBatchMove(e) {
    e.preventDefault();
    const folderId = this.elements.batchMoveFolder.value || null;
    try {
      for (const pageId of this.state.selectedPageIds) {
        await PageManager.updatePage(pageId, { folderId });
      }
      showNotification('批量移动成功', 'success');
      this.closeBatchMoveModal();
      this.clearSelection();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('批量移动失败:', error);
      showNotification('批量移动失败', 'error');
    }
  },

  async handleBatchAddTags(e) {
    e.preventDefault();
    const tagsInput = this.elements.batchAddTagsInput.value.trim();
    const newTags = parseTags(tagsInput);

    if (newTags.length === 0) {
      showNotification('请输入标签', 'error');
      return;
    }

    try {
      for (const pageId of this.state.selectedPageIds) {
        const page = await PageManager.getPage(pageId);
        if (page) {
          const allTags = [...new Set([...page.tags, ...newTags])];
          await PageManager.updatePage(pageId, { tags: allTags });
        }
      }
      showNotification('批量添加标签成功', 'success');
      this.closeBatchAddTagsModal();
      this.clearSelection();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('批量添加标签失败:', error);
      showNotification('批量添加标签失败', 'error');
    }
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

  async batchDelete() {
    if (!confirm(`确定要删除选中的 ${this.state.selectedPageIds.size} 个页面吗？`)) {
      return;
    }
    try {
      for (const pageId of this.state.selectedPageIds) {
        await PageManager.deletePage(pageId);
      }
      showNotification('批量删除成功', 'success');
      this.clearSelection();
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('批量删除失败:', error);
      showNotification('批量删除失败', 'error');
    }
  },

  batchExport() {
    showNotification('批量导出功能开发中', 'info');
  },

  handleDragStart(e) {
    const pageItem = e.target.closest('.page-item');
    if (!pageItem) return;

    const pageId = pageItem.dataset.pageId;
    const page = this.state.pages.find(p => p.id === pageId);
    
    if (page) {
      this.state.draggedPageId = pageId;
      this.state.draggedFromFolderId = page.folderId || null;
      
      DragDrop.setDragData(e, {
        pageId: pageId,
        fromFolderId: page.folderId || null
      });

      pageItem.classList.add('dragging');
      if (this.elements.createFolderDropZone) {
        this.elements.createFolderDropZone.classList.add('active');
      }
    }
  },

  handleDragEnd(e) {
    const pageItem = e.target.closest('.page-item');
    if (pageItem) {
      pageItem.classList.remove('dragging');
    }

    document.querySelectorAll('.drag-over, .drag-over-bottom').forEach(el => {
      el.classList.remove('drag-over', 'drag-over-bottom');
    });

    if (this.elements.createFolderDropZone) {
      this.elements.createFolderDropZone.classList.remove('active', 'drag-over');
    }
    this.state.draggedPageId = null;
    this.state.draggedFromFolderId = null;
  },

  handleDragOver(e) {
    e.preventDefault();
    
    if (!this.state.draggedPageId) return;

    const pageItem = e.target.closest('.page-item');
    const groupHeader = e.target.closest('.group-header');
    const groupContainer = e.target.closest('.group-container');

    document.querySelectorAll('.drag-over, .drag-over-bottom').forEach(el => {
      el.classList.remove('drag-over', 'drag-over-bottom');
    });
    document.querySelectorAll('.group-container, .group-header').forEach(el => {
      el.classList.remove('drag-over');
    });

    if (pageItem) {
      const rect = pageItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (e.clientY < midY) {
        pageItem.classList.add('drag-over');
      } else {
        pageItem.classList.add('drag-over-bottom');
      }
    } else if (groupHeader) {
      groupHeader.classList.add('drag-over');
    } else if (groupContainer) {
      groupContainer.classList.add('drag-over');
    }

    e.dataTransfer.dropEffect = 'move';
  },

  handleDragLeave(e) {
    const pageItem = e.target.closest('.page-item');
    if (pageItem) {
      pageItem.classList.remove('drag-over', 'drag-over-bottom');
    }
  },

  async handleDrop(e) {
    e.preventDefault();
    
    if (!this.state.draggedPageId) return;

    const pageItem = e.target.closest('.page-item');
    const targetFolderId = DragDrop.isDragOverFolder(e);
    const filteredPages = this.getFilteredPages();

    if (pageItem) {
      const targetPageId = pageItem.dataset.pageId;
      const targetIndex = filteredPages.findIndex(p => p.id === targetPageId);
      
      if (targetIndex !== -1 && targetPageId !== this.state.draggedPageId) {
        const rect = pageItem.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midY;
        
        await this.reorderPage(this.state.draggedPageId, targetIndex, insertBefore ? 0 : 1, targetFolderId);
      }
    } else if (targetFolderId && targetFolderId !== this.state.draggedFromFolderId) {
      await this.movePageToFolder(this.state.draggedPageId, targetFolderId);
    }
  },

  async reorderPage(draggedPageId, targetIndex, offset, targetFolderId) {
    try {
      const page = this.state.pages.find(p => p.id === draggedPageId);
      if (!page) return;

      let filteredPages = this.getFilteredPages();
      
      if (targetFolderId && targetFolderId !== page.folderId) {
        page.folderId = targetFolderId;
      }

      const actualTargetIndex = Math.max(0, Math.min(targetIndex + offset, filteredPages.length - 1));
      const normalizedPages = DragDrop.normalizePageOrder(this.state.pages);
      
      for (const p of normalizedPages) {
        await PageManager.updatePage(p.id, { order: p.order, folderId: p.folderId });
      }

      showNotification('页面已移动', 'success');
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('重新排序失败:', error);
      showNotification('操作失败', 'error');
    }
  },

  async movePageToFolder(pageId, targetFolderId) {
    try {
      await PageManager.updatePage(pageId, { folderId: targetFolderId });
      showNotification('页面已移动到分组', 'success');
      await this.loadData();
      this.render();
    } catch (error) {
      console.error('移动页面失败:', error);
      showNotification('操作失败', 'error');
    }
  },

  handleCreateFolderDragOver(e) {
    e.preventDefault();
    if (this.state.draggedPageId && this.elements.createFolderDropZone) {
      this.elements.createFolderDropZone.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    }
  },

  handleCreateFolderDragLeave(e) {
    if (this.elements.createFolderDropZone) {
      this.elements.createFolderDropZone.classList.remove('drag-over');
    }
  },

  async handleCreateFolderDrop(e) {
    e.preventDefault();
    
    if (!this.state.draggedPageId) return;

    const folderName = prompt('请输入新分组名称:');
    if (!folderName || !folderName.trim()) {
      return;
    }

    try {
      const newFolder = await FolderManager.addFolder(folderName.trim());
      await this.movePageToFolder(this.state.draggedPageId, newFolder.id);
    } catch (error) {
      console.error('创建分组失败:', error);
      showNotification('创建分组失败', 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
