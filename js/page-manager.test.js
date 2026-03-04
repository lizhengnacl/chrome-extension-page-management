const PageManagerTests = {
  async runAll() {
    console.log('🧪 开始运行 page-manager.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testAddPage());
    results.push(await this.testGetPage());
    results.push(await this.testGetAllPages());
    results.push(await this.testUpdatePage());
    results.push(await this.testDeletePage());
    results.push(await this.testUndoDeletePage());
    results.push(await this.testFilterPages());
    results.push(await this.testSortPages());
    
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
  
  async testAddPage() {
    const name = 'addPage - 添加新页面';
    try {
      const pageData = {
        url: 'https://example.com',
        title: '测试页面',
        tags: ['测试'],
        notes: '这是一个测试'
      };
      const page = await PageManager.addPage(pageData);
      console.assert(page.id !== undefined, '页面应有 id');
      console.assert(page.url === 'https://example.com', 'URL 应正确');
      console.assert(page.title === '测试页面', '标题应正确');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetPage() {
    const name = 'getPage - 获取单个页面';
    try {
      const pageData = { url: 'https://test-get.com', title: '测试获取' };
      const addedPage = await PageManager.addPage(pageData);
      const page = await PageManager.getPage(addedPage.id);
      console.assert(page.id === addedPage.id, '应获取到正确的页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetAllPages() {
    const name = 'getAllPages - 获取所有页面';
    try {
      const pages = await PageManager.getAllPages();
      console.assert(Array.isArray(pages), '应返回数组');
      console.assert(pages.length > 0, '应至少有一个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testUpdatePage() {
    const name = 'updatePage - 更新页面';
    try {
      const pageData = { url: 'https://test-update.com', title: '旧标题' };
      const addedPage = await PageManager.addPage(pageData);
      const updatedPage = await PageManager.updatePage(addedPage.id, { title: '新标题' });
      console.assert(updatedPage.title === '新标题', '标题应更新');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testDeletePage() {
    const name = 'deletePage - 删除页面';
    try {
      const pageData = { url: 'https://test-delete.com', title: '测试删除' };
      const addedPage = await PageManager.addPage(pageData);
      await PageManager.deletePage(addedPage.id);
      const pages = await PageManager.getAllPages();
      const deletedPage = pages.find(p => p.id === addedPage.id);
      console.assert(deletedPage === undefined, '页面应被删除');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testUndoDeletePage() {
    const name = 'undoDeletePage - 撤销删除';
    try {
      const pageData = { url: 'https://test-undo.com', title: '测试撤销' };
      const addedPage = await PageManager.addPage(pageData);
      await PageManager.deletePage(addedPage.id);
      await PageManager.undoDeletePage();
      const pages = await PageManager.getAllPages();
      const restoredPage = pages.find(p => p.id === addedPage.id);
      console.assert(restoredPage !== undefined, '页面应被恢复');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testFilterPages() {
    const name = 'filterPages - 筛选页面';
    try {
      const pages = [
        { id: '1', title: '工作页面', tags: ['工作'], url: 'https://work.com' },
        { id: '2', title: '学习页面', tags: ['学习'], url: 'https://study.com' }
      ];
      const filtered = PageManager.filterPages(pages, { searchQuery: '工作' });
      console.assert(filtered.length === 1, '应筛选出1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSortPages() {
    const name = 'sortPages - 排序页面';
    try {
      const now = new Date().toISOString();
      const pages = [
        { id: '1', title: 'B', createdAt: now },
        { id: '2', title: 'A', createdAt: now }
      ];
      const sorted = PageManager.sortPages(pages, { sortBy: 'title', sortOrder: 'asc' });
      console.assert(sorted[0].title === 'A', '应按标题升序排序');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
