import { Storage } from './storage.js';

export const ImportExport = {
  async exportData() {
    try {
      const data = await Storage.getAllData();
      return {
        pages: data.pages || [],
        folders: data.folders || [],
        settings: data.settings || Storage.defaultData.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('导出数据失败:', error);
      throw new Error('导出数据失败');
    }
  },
  
  async importData(data) {
    try {
      if (!this.validateData(data)) {
        throw new Error('数据格式无效');
      }
      
      await Storage.saveAllData({
        pages: data.pages || [],
        folders: data.folders || [],
        settings: data.settings || Storage.defaultData.settings,
        deletedPages: []
      });
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  },
  
  validateData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    if (!Array.isArray(data.pages)) {
      return false;
    }
    
    if (!Array.isArray(data.folders)) {
      return false;
    }
    
    if (data.settings && typeof data.settings !== 'object') {
      return false;
    }
    
    return true;
  },
  
  downloadData(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-management-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
