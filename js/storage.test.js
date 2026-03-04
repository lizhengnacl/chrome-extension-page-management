const StorageTests = {
  async runAll() {
    console.log('🧪 开始运行 storage.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testGetAllData());
    results.push(await this.testSaveAllData());
    results.push(await this.testGetPages());
    results.push(await this.testSavePages());
    results.push(await this.testGetFolders());
    results.push(await this.testSaveFolders());
    results.push(await this.testGetSettings());
    results.push(await this.testSaveSettings());
    
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
  
  async testGetAllData() {
    const name = 'getAllData - 获取所有数据';
    try {
      const data = await Storage.getAllData();
      console.assert(data !== undefined, '数据不应为 undefined');
      console.assert(typeof data === 'object', '数据应为对象');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveAllData() {
    const name = 'saveAllData - 保存所有数据';
    try {
      const testData = {
        pages: [{ id: 'test_page', title: '测试页面' }],
        folders: [],
        settings: { sortBy: 'createdAt' },
        deletedPages: []
      };
      await Storage.saveAllData(testData);
      const savedData = await Storage.getAllData();
      console.assert(savedData.pages[0].id === 'test_page', '数据应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetPages() {
    const name = 'getPages - 获取页面列表';
    try {
      const pages = await Storage.getPages();
      console.assert(Array.isArray(pages), 'pages 应为数组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSavePages() {
    const name = 'savePages - 保存页面列表';
    try {
      const testPages = [
        { id: 'page_1', title: '页面1' },
        { id: 'page_2', title: '页面2' }
      ];
      await Storage.savePages(testPages);
      const savedPages = await Storage.getPages();
      console.assert(savedPages.length === 2, '应保存2个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetFolders() {
    const name = 'getFolders - 获取分组列表';
    try {
      const folders = await Storage.getFolders();
      console.assert(Array.isArray(folders), 'folders 应为数组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveFolders() {
    const name = 'saveFolders - 保存分组列表';
    try {
      const testFolders = [{ id: 'folder_1', name: '测试分组' }];
      await Storage.saveFolders(testFolders);
      const savedFolders = await Storage.getFolders();
      console.assert(savedFolders.length === 1, '应保存1个分组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetSettings() {
    const name = 'getSettings - 获取设置';
    try {
      const settings = await Storage.getSettings();
      console.assert(typeof settings === 'object', 'settings 应为对象');
      console.assert(settings.sortBy !== undefined, '应有默认设置');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveSettings() {
    const name = 'saveSettings - 保存设置';
    try {
      const testSettings = { sortBy: 'lastVisitedAt', showVisitCount: false };
      await Storage.saveSettings(testSettings);
      const savedSettings = await Storage.getSettings();
      console.assert(savedSettings.sortBy === 'lastVisitedAt', '设置应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
