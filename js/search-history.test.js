const SearchHistoryTests = {
  async runAll() {
    console.log('🧪 开始运行 search-history.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testValidateQuery());
    results.push(await this.testDeduplicateHistory());
    results.push(await this.testLimitHistoryLength());
    results.push(await this.testFormatHistoryItem());
    results.push(await this.testFilterHistory());
    results.push(await this.testClearHistory());
    
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

  async testValidateQuery() {
    const name = 'validateQuery - 验证搜索查询';
    try {
      const result1 = SearchHistory.validateQuery('');
      console.assert(result1 === false, '空字符串应返回false');
      
      const result2 = SearchHistory.validateQuery('   ');
      console.assert(result2 === false, '纯空格应返回false');
      
      const result3 = SearchHistory.validateQuery('test');
      console.assert(result3 === true, '有效查询应返回true');
      
      const result4 = SearchHistory.validateQuery('  test  ');
      console.assert(result4 === true, '前后有空格的有效查询应返回true');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testDeduplicateHistory() {
    const name = 'deduplicateHistory - 去重搜索历史';
    try {
      const history = [
        { query: 'test', searchedAt: '2026-03-01T00:00:00Z' },
        { query: 'demo', searchedAt: '2026-03-02T00:00:00Z' },
        { query: 'test', searchedAt: '2026-03-03T00:00:00Z' }
      ];
      
      const deduplicated = SearchHistory.deduplicateHistory(history);
      
      console.assert(Array.isArray(deduplicated), '应返回数组');
      console.assert(deduplicated.length === 2, '去重后应有2个项目');
      
      const testQuery = deduplicated.find(h => h.query === 'test');
      console.assert(testQuery !== undefined, '应保留test查询');
      console.assert(testQuery.searchedAt === '2026-03-03T00:00:00Z', '应保留最新的test查询');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testLimitHistoryLength() {
    const name = 'limitHistoryLength - 限制历史记录长度';
    try {
      const history = [];
      for (let i = 0; i < 100; i++) {
        history.push({ query: `query${i}`, searchedAt: `2026-03-${String(i + 1).padStart(2, '0')}T00:00:00Z` });
      }
      
      const limited = SearchHistory.limitHistoryLength(history, 50);
      
      console.assert(Array.isArray(limited), '应返回数组');
      console.assert(limited.length === 50, '应限制为50个项目');
      console.assert(limited[0].query === 'query0', '应保留最新的项目');
      
      const limitedDefault = SearchHistory.limitHistoryLength(history);
      console.assert(limitedDefault.length === 50, '默认应限制为50个项目');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testFormatHistoryItem() {
    const name = 'formatHistoryItem - 格式化历史记录项';
    try {
      const item = {
        query: 'test query',
        searchedAt: new Date().toISOString()
      };
      
      const formatted = SearchHistory.formatHistoryItem(item);
      
      console.assert(typeof formatted === 'object', '应返回对象');
      console.assert(formatted.query === 'test query', 'query应正确');
      console.assert(formatted.displayQuery === 'test query', 'displayQuery应正确');
      console.assert(typeof formatted.formattedDate === 'string', 'formattedDate应为字符串');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testFilterHistory() {
    const name = 'filterHistory - 过滤搜索历史';
    try {
      const history = [
        { query: 'javascript', searchedAt: '2026-03-01T00:00:00Z' },
        { query: 'java', searchedAt: '2026-03-02T00:00:00Z' },
        { query: 'python', searchedAt: '2026-03-03T00:00:00Z' },
        { query: 'JAVASCRIPT', searchedAt: '2026-03-04T00:00:00Z' }
      ];
      
      const filtered1 = SearchHistory.filterHistory(history, 'java');
      console.assert(filtered1.length === 2, '应匹配2个项目');
      
      const filtered2 = SearchHistory.filterHistory(history, 'JAVA');
      console.assert(filtered2.length === 2, '应不区分大小写');
      
      const filtered3 = SearchHistory.filterHistory(history, '');
      console.assert(filtered3.length === 4, '空查询应返回所有项目');
      
      const filtered4 = SearchHistory.filterHistory(history, 'nonexistent');
      console.assert(filtered4.length === 0, '无匹配应返回空数组');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testClearHistory() {
    const name = 'clearHistory - 清空搜索历史';
    try {
      const result = SearchHistory.clearHistory();
      console.assert(Array.isArray(result), '应返回数组');
      console.assert(result.length === 0, '应返回空数组');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
