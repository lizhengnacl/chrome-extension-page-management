import { ThemeManager } from './theme-manager.js';

const ThemeManagerTests = {
  async runAll() {
    console.log('🧪 开始运行 theme-manager.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testGetThemeConfig());
    results.push(await this.testSaveThemeConfig());
    results.push(await this.testSetThemeMode());
    results.push(await this.testGetEffectiveTheme());
    results.push(await this.testSupportsColorSchemePreference());
    results.push(await this.testGetSystemColorScheme());
    
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
  
  async testGetThemeConfig() {
    const name = 'getThemeConfig - 获取主题配置';
    try {
      const config = await ThemeManager.getThemeConfig();
      console.assert(config !== undefined, '配置不应为 undefined');
      console.assert(typeof config === 'object', '配置应为对象');
      console.assert(config.mode !== undefined, '应有 mode 属性');
      console.assert(config.currentTheme !== undefined, '应有 currentTheme 属性');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSaveThemeConfig() {
    const name = 'saveThemeConfig - 保存主题配置';
    try {
      const testConfig = {
        mode: 'dark',
        currentTheme: 'dark',
        lastUpdatedAt: new Date().toISOString()
      };
      await ThemeManager.saveThemeConfig(testConfig);
      const savedConfig = await ThemeManager.getThemeConfig();
      console.assert(savedConfig.mode === 'dark', 'mode 应正确保存');
      console.assert(savedConfig.currentTheme === 'dark', 'currentTheme 应正确保存');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSetThemeMode() {
    const name = 'setThemeMode - 设置主题模式';
    try {
      await ThemeManager.setThemeMode('light');
      const config1 = await ThemeManager.getThemeConfig();
      console.assert(config1.mode === 'light', 'mode 应设置为 light');
      
      await ThemeManager.setThemeMode('dark');
      const config2 = await ThemeManager.getThemeConfig();
      console.assert(config2.mode === 'dark', 'mode 应设置为 dark');
      
      await ThemeManager.setThemeMode('system');
      const config3 = await ThemeManager.getThemeConfig();
      console.assert(config3.mode === 'system', 'mode 应设置为 system');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetEffectiveTheme() {
    const name = 'getEffectiveTheme - 获取当前有效主题';
    try {
      await ThemeManager.setThemeMode('light');
      const config1 = await ThemeManager.getThemeConfig();
      const theme1 = ThemeManager.getEffectiveTheme(config1);
      console.assert(theme1 === 'light', 'light 模式应返回 light');
      
      await ThemeManager.setThemeMode('dark');
      const config2 = await ThemeManager.getThemeConfig();
      const theme2 = ThemeManager.getEffectiveTheme(config2);
      console.assert(theme2 === 'dark', 'dark 模式应返回 dark');
      
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testSupportsColorSchemePreference() {
    const name = 'supportsColorSchemePreference - 检查是否支持 prefers-color-scheme';
    try {
      const result = ThemeManager.supportsColorSchemePreference();
      console.assert(typeof result === 'boolean', '应返回布尔值');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetSystemColorScheme() {
    const name = 'getSystemColorScheme - 获取系统主题偏好';
    try {
      const scheme = ThemeManager.getSystemColorScheme();
      console.assert(scheme === 'light' || scheme === 'dark', '应返回 light 或 dark');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};

export { ThemeManagerTests };
