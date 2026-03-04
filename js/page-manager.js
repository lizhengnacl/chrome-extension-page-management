import { generateId } from './utils.js';
import { Storage } from './storage.js';

export const PageManager = {
  async getAllPages() {
    try {
      return await Storage.getPages();
    } catch (error) {
      console.error('获取所有页面失败:', error);
      throw error;
    }
  },
  
  async getPage(pageId) {
    try {
      const pages = await Storage.getPages();
      return pages.find(page => page.id === pageId) || null;
    } catch (error) {
      console.error('获取页面失败:', error);
      throw error;
    }
  },
  
  async addPage(pageData) {
    try {
      const pages = await Storage.getPages();
      const now = new Date().toISOString();
      const newPage = {
        id: generateId('page'),
        url: pageData.url,
        title: pageData.title,
        tags: pageData.tags || [],
        notes: pageData.notes || '',
        folderId: pageData.folderId || null,
        visitCount: 0,
        createdAt: now,
        updatedAt: now,
        lastVisitedAt: now
      };
      pages.push(newPage);
      await Storage.savePages(pages);
      return newPage;
    } catch (error) {
      console.error('添加页面失败:', error);
      throw error;
    }
  },
  
  async updatePage(pageId, updates) {
    try {
      const pages = await Storage.getPages();
      const index = pages.findIndex(page => page.id === pageId);
      if (index === -1) {
        throw new Error('页面不存在');
      }
      pages[index] = {
        ...pages[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await Storage.savePages(pages);
      return pages[index];
    } catch (error) {
      console.error('更新页面失败:', error);
      throw error;
    }
  },
  
  async deletePage(pageId) {
    try {
      const pages = await Storage.getPages();
      const pageToDelete = pages.find(page => page.id === pageId);
      if (!pageToDelete) {
        throw new Error('页面不存在');
      }
      
      const filteredPages = pages.filter(page => page.id !== pageId);
      const data = await Storage.getAllData();
      data.pages = filteredPages;
      data.deletedPages = [pageToDelete];
      await Storage.saveAllData(data);
      
      return pageToDelete;
    } catch (error) {
      console.error('删除页面失败:', error);
      throw error;
    }
  },
  
  async undoDeletePage() {
    try {
      const data = await Storage.getAllData();
      if (!data.deletedPages || data.deletedPages.length === 0) {
        throw new Error('没有可撤销的删除操作');
      }
      
      const pageToRestore = data.deletedPages[0];
      data.pages.push(pageToRestore);
      data.deletedPages = [];
      await Storage.saveAllData(data);
      
      return pageToRestore;
    } catch (error) {
      console.error('撤销删除失败:', error);
      throw error;
    }
  },
  
  async recordVisit(pageId) {
    try {
      const page = await this.getPage(pageId);
      if (page) {
        await this.updatePage(pageId, {
          visitCount: page.visitCount + 1,
          lastVisitedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('记录访问失败:', error);
      throw error;
    }
  },
  
  filterPages(pages, { folderId, tag, searchQuery } = {}) {
    let filtered = [...pages];
    
    if (folderId !== undefined) {
      filtered = filtered.filter(page => page.folderId === folderId);
    }
    
    if (tag) {
      filtered = filtered.filter(page => page.tags.includes(tag));
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(lowerQuery) ||
        page.url.toLowerCase().includes(lowerQuery) ||
        page.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        (page.notes && page.notes.toLowerCase().includes(lowerQuery))
      );
    }
    
    return filtered;
  },
  
  sortPages(pages, { sortBy, sortOrder } = {}) {
    const sorted = [...pages];
    sorted.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'visitCount':
          valueA = a.visitCount;
          valueB = b.visitCount;
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'lastVisitedAt':
        default:
          valueA = new Date(a.lastVisitedAt).getTime();
          valueB = new Date(b.lastVisitedAt).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    return sorted;
  }
};
