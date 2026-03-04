import { ImportExport } from './import-export.js';
import { Storage } from './storage.js';

const ImportExportTests = {
  async runAll() {
    console.log('🧪 开始运行 import-export.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testExportData());
    results.push(await this.testImportData());
    results.push(await this.testValidateData());
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`\n📊 测试结果: ${passed}/${total} 通过`);
    
    if (passed === total) {
      console.log('✅ 所有测试通过！');
    } else {
      console.log('❌ 部分测试失败');
    }
    
    return passed === total;
  },
  
  async testExportData() {
    const name = 'exportData - 导出数据';
    try {
      await Storage.saveAllData({
        pages: [
          { id: 'page_1', url: 'https://example.com', title: '测试页面', tags: ['测试'], notes: '', folderId: null, visitCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastVisitedAt: new Date().toISOString() }
        ],
        folders: [
          { id: 'folder_1', name: '工作', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        settings: { defaultFolder: null, showVisitCount: true, sortBy: 'lastVisitedAt', sortOrder: 'desc', theme: 'light' },
        deletedPages: []
      });
      
      const data = await ImportExport.exportData();
      console.assert(typeof data === 'object', '应返回对象');
      console.assert(Array.isArray(data.pages), '应有pages数组');
      console.assert(Array.isArray(data.folders), '应有folders数组');
      console.assert(typeof data.settings === 'object', '应有settings对象');
      console.assert(data.exportedAt !== undefined, '应有导出时间');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testImportData() {
    const name = 'importData - 导入数据';
    try {
      const testData = {
        pages: [
          { id: 'page_import_1', url: 'https://import.com', title: '导入页面', tags: ['导入'], notes: '', folderId: null, visitCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastVisitedAt: new Date().toISOString() }
        ],
        folders: [
          { id: 'folder_import_1', name: '导入分组', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ],
        settings: { defaultFolder: null, showVisitCount: true, sortBy: 'lastVisitedAt', sortOrder: 'desc', theme: 'light' },
        exportedAt: new Date().toISOString()
      };
      
      await ImportExport.importData(testData);
      
      const savedData = await Storage.getAllData();
      const importedPage = savedData.pages.find(p => p.id === 'page_import_1');
      const importedFolder = savedData.folders.find(f => f.id === 'folder_import_1');
      
      console.assert(importedPage !== undefined, '应导入页面');
      console.assert(importedFolder !== undefined, '应导入分组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testValidateData() {
    const name = 'validateData - 验证数据';
    try {
      const validData = {
        pages: [
          { id: 'page_1', url: 'https://example.com', title: '测试', tags: [], notes: '', folderId: null, visitCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastVisitedAt: new Date().toISOString() }
        ],
        folders: [],
        settings: {},
        exportedAt: new Date().toISOString()
      };
      
      const isValid = ImportExport.validateData(validData);
      console.assert(isValid === true, '有效数据应通过验证');
      
      const invalidData = { pages: 'not an array' };
      const isInvalid = ImportExport.validateData(invalidData);
      console.assert(isInvalid === false, '无效数据应未通过验证');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};

export { ImportExportTests };
