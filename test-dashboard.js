import { Dashboard } from './js/dashboard.js';

const DashboardTests = {
  async runAll() {
    console.log('🧪 开始运行 dashboard.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testCalculateStatistics());
    results.push(await this.testGetTopPages());
    results.push(await this.testGetRecentPages());
    results.push(await this.testGetFolderStats());
    results.push(await this.testFormatDate());
    
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

  async testCalculateStatistics() {
    const name = 'calculateStatistics - 计算统计数据';
    try {
      const pages = [
        { id: 'page_1', visitCount: 10, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'page_2', visitCount: 20, createdAt: '2026-01-02T00:00:00Z' },
        { id: 'page_3', visitCount: 5, createdAt: '2026-01-03T00:00:00Z' }
      ];
      const folders = [
        { id: 'folder_1', name: '工作' },
        { id: 'folder_2', name: '学习' }
      ];
      
      const stats = Dashboard.calculateStatistics(pages, folders);
      
      console.assert(typeof stats === 'object', '应返回对象');
      console.assert(stats.totalPages === 3, '总页面数应为3');
      console.assert(stats.totalFolders === 2, '总分组数应为2');
      console.assert(stats.totalVisits === 35, '总访问次数应为35');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGetTopPages() {
    const name = 'getTopPages - 获取热门页面 TOP 10';
    try {
      const pages = [
        { id: 'page_1', title: '页面1', visitCount: 10 },
        { id: 'page_2', title: '页面2', visitCount: 50 },
        { id: 'page_3', title: '页面3', visitCount: 30 },
        { id: 'page_4', title: '页面4', visitCount: 20 },
        { id: 'page_5', title: '页面5', visitCount: 40 }
      ];
      
      const topPages = Dashboard.getTopPages(pages, 3);
      
      console.assert(Array.isArray(topPages), '应返回数组');
      console.assert(topPages.length === 3, '应返回3个页面');
      console.assert(topPages[0].visitCount === 50, '第一个页面访问次数应最高');
      console.assert(topPages[1].visitCount === 40, '第二个页面访问次数应第二高');
      console.assert(topPages[2].visitCount === 30, '第三个页面访问次数应第三高');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGetRecentPages() {
    const name = 'getRecentPages - 获取最近保存页面';
    try {
      const pages = [
        { id: 'page_1', title: '页面1', createdAt: '2026-01-01T00:00:00Z' },
        { id: 'page_2', title: '页面2', createdAt: '2026-01-05T00:00:00Z' },
        { id: 'page_3', title: '页面3', createdAt: '2026-01-03T00:00:00Z' },
        { id: 'page_4', title: '页面4', createdAt: '2026-01-02T00:00:00Z' },
        { id: 'page_5', title: '页面5', createdAt: '2026-01-04T00:00:00Z' }
      ];
      
      const recentPages = Dashboard.getRecentPages(pages, 3);
      
      console.assert(Array.isArray(recentPages), '应返回数组');
      console.assert(recentPages.length === 3, '应返回3个页面');
      console.assert(recentPages[0].createdAt === '2026-01-05T00:00:00Z', '第一个页面应最新');
      console.assert(recentPages[1].createdAt === '2026-01-04T00:00:00Z', '第二个页面应第二新');
      console.assert(recentPages[2].createdAt === '2026-01-03T00:00:00Z', '第三个页面应第三新');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testGetFolderStats() {
    const name = 'getFolderStats - 获取分组统计';
    try {
      const pages = [
        { id: 'page_1', folderId: 'folder_1' },
        { id: 'page_2', folderId: 'folder_1' },
        { id: 'page_3', folderId: 'folder_2' },
        { id: 'page_4', folderId: null },
        { id: 'page_5', folderId: 'folder_1' }
      ];
      const folders = [
        { id: 'folder_1', name: '工作' },
        { id: 'folder_2', name: '学习' }
      ];
      
      const folderStats = Dashboard.getFolderStats(pages, folders);
      
      console.assert(Array.isArray(folderStats), '应返回数组');
      console.assert(folderStats.length === 3, '应返回3个分组（包括未分组）');
      
      const folder1 = folderStats.find(f => f.id === 'folder_1');
      const folder2 = folderStats.find(f => f.id === 'folder_2');
      const ungrouped = folderStats.find(f => f.id === null);
      
      console.assert(folder1.count === 3, '工作分组应有3个页面');
      console.assert(folder2.count === 1, '学习分组应有1个页面');
      console.assert(ungrouped.count === 1, '未分组应有1个页面');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testFormatDate() {
    const