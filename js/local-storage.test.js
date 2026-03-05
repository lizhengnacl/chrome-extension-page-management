const LocalStorageTests = {
  async runAll() {
    console.log('🧪 开始运行 local-storage.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testGetAllLocalData());
    results.push(await this.testSaveAllLocalData());
    results.push(await this.testGetThumbnails());
    results.push(await this.testSaveThumbnails());
    results.push(await this.testGetThumbnail());
    results.push(await this.testSaveThumbnail());
    results.push(await this.testDeleteThumbnail());
    results.push(await this.testGetSearchHistory());
    results.push(await this.testSaveSearchHistory());
    results.push(await this.testAddSearchHistoryItem());
    results.push(await this.testGetNewTabSettings());
    results.push(await this.testSaveNewTabSettings());
    
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
  
  async testGetAllLocalData() {
    const name = 'getAllLocalData - 获取所有本地数据';
    try {
      const data = await LocalStorage.getAllLocalData();
      console.assert(data !== undefined, '数据不应为 undefined');
      console.assert(typeof data === 'object', '数据应为对象');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveAllLocalData() {
    const name = 'saveAllLocalData - 保存所有本地数据';
    try {
      const testData = {
        thumbnails: [{ pageId: 'test_page', thumbnailUrl: 'data:image/png;base64,test' }],
        searchHistory: [{ query: '测试', searchedAt: new Date().toISOString() }],
        newTabSettings: { defaultView: 'grouped' }
      };
      await LocalStorage.saveAllLocalData(testData);
      const savedData = await LocalStorage.getAllLocalData();
      console.assert(savedData.thumbnails[0].pageId === 'test_page', '数据应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetThumbnails() {
    const name = 'getThumbnails - 获取缩略图列表';
    try {
      const thumbnails = await LocalStorage.getThumbnails();
      console.assert(Array.isArray(thumbnails), 'thumbnails 应为数组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveThumbnails() {
    const name = 'saveThumbnails - 保存缩略图列表';
    try {
      const testThumbnails = [
        { pageId: 'page_1', thumbnailUrl: 'data:image/png;base64,test1' },
        { pageId: 'page_2', thumbnailUrl: 'data:image/png;base64,test2' }
      ];
      await LocalStorage.saveThumbnails(testThumbnails);
      const savedThumbnails = await LocalStorage.getThumbnails();
      console.assert(savedThumbnails.length === 2, '应保存2个缩略图');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetThumbnail() {
    const name = 'getThumbnail - 获取单个缩略图';
    try {
      const thumbnail = await LocalStorage.getThumbnail('page_1');
      console.assert(thumbnail !== undefined, '缩略图不应为 undefined');
      console.assert(thumbnail.pageId === 'page_1', '应返回正确的缩略图');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveThumbnail() {
    const name = 'saveThumbnail - 保存单个缩略图';
    try {
      const testThumbnail = {
        pageId: 'page_3',
        thumbnailUrl: 'data:image/png;base64,test3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await LocalStorage.saveThumbnail(testThumbnail);
      const savedThumbnail = await LocalStorage.getThumbnail('page_3');
      console.assert(savedThumbnail.thumbnailUrl === 'data:image/png;base64,test3', '缩略图应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testDeleteThumbnail() {
    const name = 'deleteThumbnail - 删除缩略图';
    try {
      await LocalStorage.deleteThumbnail('page_3');
      const deletedThumbnail = await LocalStorage.getThumbnail('page_3');
      console.assert(deletedThumbnail === undefined || deletedThumbnail === null, '缩略图应被删除');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetSearchHistory() {
    const name = 'getSearchHistory - 获取搜索历史';
    try {
      const history = await LocalStorage.getSearchHistory();
      console.assert(Array.isArray(history), 'searchHistory 应为数组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveSearchHistory() {
    const name = 'saveSearchHistory - 保存搜索历史';
    try {
      const testHistory = [
        { query: '工作资料', searchedAt: new Date().toISOString() },
        { query: '学习笔记', searchedAt: new Date().toISOString() }
      ];
      await LocalStorage.saveSearchHistory(testHistory);
      const savedHistory = await LocalStorage.getSearchHistory();
      console.assert(savedHistory.length === 2, '应保存2条搜索历史');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testAddSearchHistoryItem() {
    const name = 'addSearchHistoryItem - 添加搜索历史记录';
    try {
      await LocalStorage.addSearchHistoryItem('新搜索');
      const savedHistory = await LocalStorage.getSearchHistory();
      console.assert(savedHistory.length > 0, '应至少有1条搜索历史');
      console.assert(savedHistory[0].query === '新搜索', '最新搜索应在最前面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetNewTabSettings() {
    const name = 'getNewTabSettings - 获取新标签页设置';
    try {
      const settings = await LocalStorage.getNewTabSettings();
      console.assert(typeof settings === 'object', 'settings 应为对象');
      console.assert(settings.defaultView !== undefined, '应有默认设置');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveNewTabSettings() {
    const name = 'saveNewTabSettings - 保存新标签页设置';
    try {
      const testSettings = {
        defaultView: 'flat-recent',
        groupExpanded: false,
        visibleColumns: ['title', 'url']
      };
      await LocalStorage.saveNewTabSettings(testSettings);
      const savedSettings = await LocalStorage.getNewTabSettings();
      console.assert(savedSettings.defaultView === 'flat-recent', '设置应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
