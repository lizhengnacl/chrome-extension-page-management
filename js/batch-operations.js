import { parseTags } from './utils.js';

export const BatchOperations = {
  validatePageIds(pageIds) {
    if (!pageIds || !Array.isArray(pageIds)) {
      return false;
    }
    if (pageIds.length === 0) {
      return false;
    }
    return pageIds.every(id => id && typeof id === 'string' && id.trim() !== '');
  },

  filterPagesByIds(pages, pageIds) {
    if (!pages || !Array.isArray(pages)) {
      return [];
    }
    if (!this.validatePageIds(pageIds)) {
      return [];
    }
    return pages.filter(page => pageIds.includes(page.id));
  },

  mergeTags(existingTags, newTags) {
    if (!Array.isArray(existingTags)) {
      existingTags = [];
    }
    if (!Array.isArray(newTags)) {
      newTags = [];
    }
    
    const allTags = [...existingTags, ...newTags];
    return [...new Set(allTags)].filter(tag => tag && tag.trim() !== '');
  },

  validateTags(tags) {
    if (!tags || !Array.isArray(tags)) {
      return false;
    }
    if (tags.length === 0) {
      return false;
    }
    return tags.every(tag => tag && typeof tag === 'string' && tag.trim() !== '');
  },

  generateExportData(pages, folders, pageIds) {
    const filteredPages = this.filterPagesByIds(pages, pageIds);
    const relatedFolderIds = new Set(filteredPages.map(p => p.folderId).filter(id => id));
    const filteredFolders = folders.filter(f => relatedFolderIds.has(f.id));

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      pages: filteredPages,
      folders: filteredFolders
    };
  },

  parseTagsFromString(tagsString) {
    return parseTags(tagsString);
  },

  selectAllPages(pageIds) {
    return new Set(pageIds);
  },

  deselectAllPages() {
    return new Set();
  },

  toggleSelection(selectedIds, pageId) {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(pageId)) {
      newSelection.delete(pageId);
    } else {
      newSelection.add(pageId);
    }
    return newSelection;
  },

  getSelectionCount(selectedIds) {
    return selectedIds ? selectedIds.size : 0;
  },

  isPageSelected(selectedIds, pageId) {
    return selectedIds ? selectedIds.has(pageId) : false;
  }
};
