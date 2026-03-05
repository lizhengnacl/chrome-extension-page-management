import { UIComponents } from './ui-components.js';

const UIComponentsTests = {
  async runAll() {
    console.log('🧪 开始运行 ui-components.js 测试...\n');
    
    const results = [];
    
    results.push(this.testShowSuccessNotification());
    results.push(this.testShowErrorNotification());
    results.push(this.testShowInfoNotification());
    results.push(this.testEnhanceSearchInput());
    
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
  
  testShowSuccessNotification() {
    const name = 'showSuccessNotification - 显示成功通知';
    try {
      UIComponents.showSuccessNotification('测试成功消息');
      const notification = document.querySelector('.notification.success');
      console.assert(notification !== null, '应有成功通知元素');
      console.assert(notification.textContent === '测试成功消息', '通知内容应正确');
      notification.remove();
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testShowErrorNotification() {
    const name = 'showErrorNotification - 显示错误通知';
    try {
      UIComponents.showErrorNotification('测试错误消息');
      const notification = document.querySelector('.notification.error');
      console.assert(notification !== null, '应有错误通知元素');
      console.assert(notification.textContent === '测试错误消息', '通知内容应正确');
      notification.remove();
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testShowInfoNotification() {
    const name = 'showInfoNotification - 显示信息通知';
    try {
      UIComponents.showInfoNotification('测试信息消息');
      const notification = document.querySelector('.notification.info');
      console.assert(notification !== null, '应有信息通知元素');
      console.assert(notification.textContent === '测试信息消息', '通知内容应正确');
      notification.remove();
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  testEnhanceSearchInput() {
    const name = 'enhanceSearchInput - 增强搜索框';
    try {
      const testInput = document.createElement('input');
      testInput.type = 'text';
      testInput.value = '测试文本';
      document.body.appendChild(testInput);
      
      UIComponents.enhanceSearchInput(testInput);
      
      testInput.focus();
      
      console.assert(testInput.selectionStart === 0, '应选中开始位置');
      console.assert(testInput.selectionEnd === testInput.value.length, '应选中全部文本');
      
      testInput.remove();
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};

export { UIComponentsTests };
