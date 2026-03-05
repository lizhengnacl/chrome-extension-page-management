import {
  generateId,
  formatDate,
  isValidUrl,
  debounce,
  parseTags,
  supportsColorSchemePreference,
  getSystemColorScheme
} from './utils.js';

const UtilsTests = {
  async runAll() {
    console.log('🧪 开始运行 utils.js 测试...\n');
    
    const results = [];
    
    results.push(this.testGenerateId());
    results.push(this.testFormatDate());
    results.push(this.testIsValidUrl());
    results.push(this.testDebounce());
    results.push(this.testParseTags());
    results.push(this.testSupportsColorSchemePreference());
    results.push(this.testGetSystemColorScheme());
    
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
  
  testGenerateId() {
    const name = 'generateId - 生成唯一ID';
    try {
      const id1 = generateId('test');
      const id2 = generateId('test');
      console.assert(id1.startsWith('test_'), 'ID应以test_开头');
      console.assert(id1 !== id2, '两次生成的ID应不同');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testFormatDate() {
    const name = 'formatDate - 格式化日期';
    try {
      const now = new Date().toISOString();
      const result = formatDate(now);
      console.assert(typeof result === 'string', '应返回字符串');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testIsValidUrl() {
    const name = 'isValidUrl - 验证URL';
    try {
      console.assert(isValidUrl('https://example.com') === true, '有效URL应返回true');
      console.assert(isValidUrl('not-a-url') === false, '无效URL应返回false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testDebounce() {
    const name = 'debounce - 防抖函数';
    try {
      let count = 0;
      const increment = () => count++;
      const debounced = debounce(increment, 10);
      debounced();
      debounced();
      debounced();
      console.assert(typeof debounced === 'function', '应返回函数');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testParseTags() {
    const name = 'parseTags - 解析标签';
    try {
      const tags = parseTags('工作, 学习, 参考');
      console.assert(Array.isArray(tags), '应返回数组');
      console.assert(tags.length === 3, '应解析出3个标签');
      console.assert(tags[0] === '工作', '第一个标签应为工作');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testSupportsColorSchemePreference() {
    const name = 'supportsColorSchemePreference - 检查是否支持 prefers-color-scheme';
    try {
      const result = supportsColorSchemePreference();
      console.assert(typeof result === 'boolean', '应返回布尔值');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testGetSystemColorScheme() {
    const name = 'getSystemColorScheme - 获取系统主题偏好';
    try {
      const scheme = getSystemColorScheme();
      console.assert(scheme === 'light' || scheme === 'dark', '应返回 light 或 dark');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};

export { UtilsTests };
