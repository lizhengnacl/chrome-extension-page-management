const ThumbnailManagerTests = {
  async runAll() {
    console.log('🧪 开始运行 thumbnail-manager.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testGenerateThumbnailUrl());
    results.push(await this.testGetFaviconUrl());
    results.push(await this.testIsValidThumbnailUrl());
    results.push(await this.testShouldUpdateThumbnail());
    results.push(await this.testGetThumbnailForPage());
    
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

  async testGenerateThumbnailUrl() {
    const name = 'generateThumbnailUrl - 生成缩略图 URL';
    try {
      const testUrl = 'https://example.com';
      const thumbnailUrl = ThumbnailManager.generateThumbnailUrl(testUrl);
      console.assert(typeof thumbnailUrl === 'string', '缩略图 URL 应为字符串');
      console.assert(thumbnailUrl.length > 0, '缩略图 URL 不应为空');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGetFaviconUrl() {
    const name = 'getFaviconUrl - 获取 favicon URL';
    try {
      const testUrl = 'https://example.com';
      const faviconUrl = ThumbnailManager.getFaviconUrl(testUrl);
      console.assert(typeof faviconUrl === 'string', 'favicon URL 应为字符串');
      console.assert(faviconUrl.includes('favicon'), 'favicon URL 应包含 favicon 相关内容');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testIsValidThumbnailUrl() {
    const name = 'isValidThumbnailUrl - 验证缩略图 URL';
    try {
      const validUrl = 'data:image/png;base64,test';
      const invalidUrl = '';
      const nullUrl = null;
      
      console.assert(ThumbnailManager.isValidThumbnailUrl(validUrl) === true, '有效的缩略图 URL 应返回 true');
      console.assert(ThumbnailManager.isValidThumbnailUrl(invalidUrl) === false, '无效的缩略图 URL 应返回 false');
      console.assert(ThumbnailManager.isValidThumbnailUrl(nullUrl) === false, 'null 应返回 false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testShouldUpdateThumbnail() {
    const name = 'shouldUpdateThumbnail - 判断是否需要更新缩略图';
    try {
      const recentThumbnail = {
        pageId: 'test_page',
        updatedAt: new Date().toISOString()
      };
      
      const oldThumbnail = {
        pageId: 'test_page',
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      console.assert(ThumbnailManager.shouldUpdateThumbnail(null) === true, '无缩略图时应更新');
      console.assert(ThumbnailManager.shouldUpdateThumbnail(recentThumbnail) === false, '近期缩略图不应更新');
      console.assert(ThumbnailManager.shouldUpdateThumbnail(oldThumbnail) === true, '旧缩略图应更新');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGetThumbnailForPage() {
    const name = 'getThumbnailForPage - 获取页面缩略图';
    try {
      const testPage = {
        id: 'test_page_1',
        url: 'https://example.com'
      };
      
      const thumbnail = await ThumbnailManager.getThumbnailForPage(testPage);
      console.assert(thumbnail !== null && thumbnail !== undefined, '应返回缩略图');
      console.assert(typeof thumbnail === 'object', '缩略图应为对象');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
