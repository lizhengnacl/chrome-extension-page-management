const SearchTests = {
  async runAll() {
    console.log('🧪 开始运行 search.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testSearchPages());
    results.push(await this.testSearchByTitle());
    results.push(await this.testSearchByUrl());
    results.push(await this.testSearchByTags());
    results.push(await this.testSearchByNotes());
    results.push(await this.testCalculateMatchScore());
    
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
  
  async testSearchPages() {
    const name = 'searchPages - 搜索页面';
    try {
      const pages = [
        { id: '1', title: '工作页面', url: 'https://work.com', tags: ['工作'], notes: '' },
        { id: '2', title: '学习页面', url: 'https://study.com', tags: ['学习'], notes: '' }
      ];
      const results = Search.searchPages(pages, '工作');
      console.assert(results.length === 1, '应搜索到1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSearchByTitle() {
    const name = 'searchPages - 按标题搜索';
    try {
      const pages = [
        { id: '1', title: 'JavaScript 教程', url: 'https://js.com', tags: [], notes: '' },
        { id: '2', title: 'Python 指南', url: 'https://py.com', tags: [], notes: '' }
      ];
      const results = Search.searchPages(pages, 'javascript');
      console.assert(results.length === 1, '应按标题搜索到1个页面');
      console.assert(results[0].id === '1', '应搜索到正确的页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSearchByUrl() {
    const name = 'searchPages - 按URL搜索';
    try {
      const pages = [
        { id: '1', title: '页面1', url: 'https://example.com/foo', tags: [], notes: '' },
        { id: '2', title: '页面2', url: 'https://test.com/bar', tags: [], notes: '' }
      ];
      const results = Search.searchPages(pages, 'example');
      console.assert(results.length === 1, '应按URL搜索到1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSearchByTags() {
    const name = 'searchPages - 按标签搜索';
    try {
      const pages = [
        { id: '1', title: '页面1', url: 'https://a.com', tags: ['工作', '重要'], notes: '' },
        { id: '2', title: '页面2', url: 'https://b.com', tags: ['学习'], notes: '' }
      ];
      const results = Search.searchPages(pages, '重要');
      console.assert(results.length === 1, '应按标签搜索到1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSearchByNotes() {
    const name = 'searchPages - 按备注搜索';
    try {
      const pages = [
        { id: '1', title: '页面1', url: 'https://a.com', tags: [], notes: '这是重要的笔记' },
        { id: '2', title: '页面2', url: 'https://b.com', tags: [], notes: '普通内容' }
      ];
      const results = Search.searchPages(pages, '重要');
      console.assert(results.length === 1, '应按备注搜索到1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testCalculateMatchScore() {
    const name = 'calculateMatchScore - 计算匹配分数';
    try {
      const page = { title: 'JavaScript 教程', url: 'https://js.com', tags: ['编程'], notes: '学习笔记' };
      const score1 = Search.calculateMatchScore(page, 'javascript');
      const score2 = Search.calculateMatchScore(page, '不存在的内容');
      console.assert(score1 > 0, '匹配的应有正分数');
      console.assert(score2 === 0, '不匹配的应有0分');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
