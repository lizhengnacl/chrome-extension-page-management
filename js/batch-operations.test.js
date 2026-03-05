const BatchOperationsTests = {
  async runAll() {
    console.log('🧪 开始运行 batch-operations.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testValidatePageIds());
    results.push(await this.testFilterPagesByIds());
    results.push(await this.testMergeTags());
    results.push(await this.testValidateTags());
    results.push(await this.testGenerateExportData());
    
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

  async testValidatePageIds() {
    const name = 'validatePageIds - 验证页面 ID 列表';
    try {
      const validIds = ['page_1', 'page_2', 'page_3'];
      const invalidIds1 = [];
      const invalidIds2 = null;
      const invalidIds3 = ['page_1', '', 'page_3'];
      
      console.assert(BatchOperations.validatePageIds(validIds) === true, '有效 ID 列表应返回 true');
      console.assert(BatchOperations.validatePageIds(invalidIds1) === false, '空数组应返回 false');
      console.assert(BatchOperations.validatePageIds(invalidIds2) === false, 'null 应返回 false');
      console.assert(BatchOperations.validatePageIds(invalidIds3) === false, '含空字符串应返回 false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testFilterPagesByIds() {
    const name = 'filterPagesByIds - 按 ID 筛选页面';
    try {
      const pages = [
        { id: 'page_1', title: '页面1' },
        { id: 'page_2', title: '页面2' },
        { id: 'page_3', title: '页面3' }
      ];
      const ids = ['page_1', 'page_3'];
      
      const filtered = BatchOperations.filterPagesByIds(pages, ids);
      
      console.assert(Array.isArray(filtered), '应返回数组');
      console.assert(filtered.length === 2, '应返回2个页面');
      console.assert(filtered[0].id === 'page_1', '第一个页面 ID 应匹配');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testMergeTags() {
    const name = 'mergeTags - 合并标签';
    try {
      const existingTags = ['工作', '学习'];
      const newTags = ['学习', '参考'];
      
      const merged = BatchOperations.mergeTags(existingTags, newTags);
      
      console.assert(Array.isArray(merged), '应返回数组');
      console.assert(merged.length === 3, '应去重后有3个标签');
      console.assert(merged.includes('工作'), '应包含工作标签');
      console.assert(merged.includes('学习'), '应包含学习标签');
      console.assert(merged.includes('参考'), '应包含参考标签');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testValidateTags() {
    const name = 'validateTags - 验证标签';
    try {
      const validTags = ['工作', '学习'];
      const invalidTags1 = [];
      const invalidTags2 = ['', '学习'];
      const invalidTags3 = null;
      
      console.assert(BatchOperations.validateTags(validTags) === true, '有效标签应返回 true');
      console.assert(BatchOperations.validateTags(invalidTags1) === false, '空数组应返回 false');
      console.assert(BatchOperations.validateTags(invalidTags2) === false, '含空字符串应返回 false');
      console.assert(BatchOperations.validateTags(invalidTags3) === false, 'null 应返回 false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGenerateExportData() {
    const name = 'generateExportData - 生成导出数据';
    try {
      const pages = [
        { id: 'page_1', title: '页面1', url: 'https://example1.com' },
        { id: 'page_2', title: '页面2', url: 'https://example2.com' }
      ];
      const folders = [
        { id: 'folder_1', name: '工作' }
      ];
      const pageIds = ['page_1', 'page_2'];
      
      const exportData = BatchOperations.generateExportData(pages, folders, pageIds);
      
      console.assert(typeof exportData === 'object', '应返回对象');
      console.assert(exportData.pages !== undefined, '应包含 pages');
      console.assert(exportData.folders !== undefined, '应包含 folders');
      console.assert(exportData.exportedAt !== undefined, '应包含导出时间');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
