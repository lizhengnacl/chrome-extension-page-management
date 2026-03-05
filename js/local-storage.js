export const LocalStorage = {
  defaultData: {
    thumbnails: [],
    searchHistory: [],
    newTabSettings: {
      defaultView: 'grouped',
      groupExpanded: true,
      visibleColumns: ['thumbnail', 'title', 'url', 'folder', 'tags', 'visitCount', 'lastVisitedAt'],
      sortBy: 'lastVisitedAt',
      sortOrder: 'desc',
      showDashboard: true
    }
  },

  async getAllLocalData() {
    try {
      const result = await chrome.storage.local.get(null);
      return {
        ...this.defaultData,
        ...result
      };
    } catch (error) {
      console.error('获取本地数据失败:', error);
      throw new Error('获取本地数据失败');
    }
  },

  async saveAllLocalData(data) {
    try {
      await chrome.storage.local.set(data);
    } catch (error) {
      console.error('保存本地数据失败:', error);
      throw new Error('保存本地数据失败');
    }
  },

  async getThumbnails() {
    try {
      const data = await this.getAllLocalData();
      return data.thumbnails || [];
    } catch (error) {
      console.error('获取缩略图列表失败:', error);
      throw new Error('获取缩略图列表失败');
    }
  },

  async saveThumbnails(thumbnails) {
    try {
      const data = await this.getAllLocalData();
      data.thumbnails = thumbnails;
      await this.saveAllLocalData(data);
    } catch (error) {
      console.error('保存缩略图列表失败:', error);
      throw new Error('保存缩略图列表失败');
    }
  },

  async getThumbnail(pageId) {
    try {
      const thumbnails = await this.getThumbnails();
      return thumbnails.find(t => t.pageId === pageId);
    } catch (error) {
      console.error('获取缩略图失败:', error);
      throw new Error('获取缩略图失败');
    }
  },

  async saveThumbnail(thumbnail) {
    try {
      const thumbnails = await this.getThumbnails();
      const existingIndex = thumbnails.findIndex(t => t.pageId === thumbnail.pageId);
      if (existingIndex >= 0) {
        thumbnails[existingIndex] = thumbnail;
      } else {
        thumbnails.push(thumbnail);
      }
      await this.saveThumbnails(thumbnails);
    } catch (error) {
      console.error('保存缩略图失败:', error);
      throw new Error('保存缩略图失败');
    }
  },

  async deleteThumbnail(pageId) {
    try {
      const thumbnails = await this.getThumbnails();
      const filteredThumbnails = thumbnails.filter(t => t.pageId !== pageId);
      await this.saveThumbnails(filteredThumbnails);
    } catch (error) {
      console.error('删除缩略图失败:', error);
      throw new Error('删除缩略图失败');
    }
  },

  async getSearchHistory() {
    try {
      const data = await this.getAllLocalData();
      return data.searchHistory || [];
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      throw new Error('获取搜索历史失败');
    }
  },

  async saveSearchHistory(history) {
    try {
      const data = await this.getAllLocalData();
      data.searchHistory = history;
      await this.saveAllLocalData(data);
    } catch (error) {
      console.error('保存搜索历史失败:', error);
      throw new Error('保存搜索历史失败');
    }
  },

  async addSearchHistoryItem(query) {
    try {
      const history = await this.getSearchHistory();
      const filteredHistory = history.filter(h => h.query !== query);
      const newItem = {
        query: query,
        searchedAt: new Date().toISOString()
      };
      filteredHistory.unshift(newItem);
      const limitedHistory = filteredHistory.slice(0, 50);
      await this.saveSearchHistory(limitedHistory);
    } catch (error) {
      console.error('添加搜索历史失败:', error);
      throw new Error('添加搜索历史失败');
    }
  },

  async getNewTabSettings() {
    try {
      const data = await this.getAllLocalData();
      return {
        ...this.defaultData.newTabSettings,
        ...data.newTabSettings
      };
    } catch (error) {
      console.error('获取新标签页设置失败:', error);
      throw new Error('获取新标签页设置失败');
    }
  },

  async saveNewTabSettings(settings) {
    try {
      const data = await this.getAllLocalData();
      data.newTabSettings = {
        ...this.defaultData.newTabSettings,
        ...settings
      };
      await this.saveAllLocalData(data);
    } catch (error) {
      console.error('保存新标签页设置失败:', error);
      throw new Error('保存新标签页设置失败');
    }
  }
};
