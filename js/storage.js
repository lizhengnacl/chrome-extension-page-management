export const Storage = {
  defaultData: {
    pages: [],
    folders: [],
    settings: {
      defaultFolder: null,
      showVisitCount: true,
      sortBy: 'lastVisitedAt',
      sortOrder: 'desc',
      theme: 'light'
    },
    deletedPages: []
  },
  
  async getAllData() {
    try {
      const result = await chrome.storage.sync.get(null);
      return {
        ...this.defaultData,
        ...result
      };
    } catch (error) {
      console.error('获取数据失败:', error);
      throw new Error('获取数据失败');
    }
  },
  
  async saveAllData(data) {
    try {
      await chrome.storage.sync.set(data);
    } catch (error) {
      console.error('保存数据失败:', error);
      throw new Error('保存数据失败');
    }
  },
  
  async getPages() {
    try {
      const data = await this.getAllData();
      return data.pages || [];
    } catch (error) {
      console.error('获取页面列表失败:', error);
      throw new Error('获取页面列表失败');
    }
  },
  
  async savePages(pages) {
    try {
      const data = await this.getAllData();
      data.pages = pages;
      await this.saveAllData(data);
    } catch (error) {
      console.error('保存页面列表失败:', error);
      throw new Error('保存页面列表失败');
    }
  },
  
  async getFolders() {
    try {
      const data = await this.getAllData();
      return data.folders || [];
    } catch (error) {
      console.error('获取分组列表失败:', error);
      throw new Error('获取分组列表失败');
    }
  },
  
  async saveFolders(folders) {
    try {
      const data = await this.getAllData();
      data.folders = folders;
      await this.saveAllData(data);
    } catch (error) {
      console.error('保存分组列表失败:', error);
      throw new Error('保存分组列表失败');
    }
  },
  
  async getSettings() {
    try {
      const data = await this.getAllData();
      return {
        ...this.defaultData.settings,
        ...data.settings
      };
    } catch (error) {
      console.error('获取设置失败:', error);
      throw new Error('获取设置失败');
    }
  },
  
  async saveSettings(settings) {
    try {
      const data = await this.getAllData();
      data.settings = {
        ...this.defaultData.settings,
        ...settings
      };
      await this.saveAllData(data);
    } catch (error) {
      console.error('保存设置失败:', error);
      throw new Error('保存设置失败');
    }
  }
};
