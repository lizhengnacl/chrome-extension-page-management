const FolderManagerTests = {
  async runAll() {
    console.log('🧪 开始运行 folder-manager.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testAddFolder());
    results.push(await this.testGetFolder());
    results.push(await this.testGetAllFolders());
    results.push(await this.testUpdateFolder());
    results.push(await this.testDeleteFolder());
    
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
  
  async testAddFolder() {
    const name = 'addFolder - 添加新分组';
    try {
      const folder = await FolderManager.addFolder('工作资料');
      console.assert(folder.id !== undefined, '分组应有 id');
      console.assert(folder.name === '工作资料', '分组名称应正确');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetFolder() {
    const name = 'getFolder - 获取单个分组';
    try {
      const addedFolder = await FolderManager.addFolder('测试分组');
      const folder = await FolderManager.getFolder(addedFolder.id);
      console.assert(folder.id === addedFolder.id, '应获取到正确的分组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testGetAllFolders() {
    const name = 'getAllFolders - 获取所有分组';
    try {
      await FolderManager.addFolder('分组1');
      await FolderManager.addFolder('分组2');
      const folders = await FolderManager.getAllFolders();
      console.assert(Array.isArray(folders), '应返回数组');
      console.assert(folders.length >= 2, '应至少有2个分组');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testUpdateFolder() {
    const name = 'updateFolder - 更新分组';
    try {
      const addedFolder = await FolderManager.addFolder('旧名称');
      const updatedFolder = await FolderManager.updateFolder(addedFolder.id, '新名称');
      console.assert(updatedFolder.name === '新名称', '分组名称应更新');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },
  
  async testDeleteFolder() {
    const name = 'deleteFolder - 删除分组';
    try {
      const addedFolder = await FolderManager.addFolder('要删除的分组');
      await FolderManager.deleteFolder(addedFolder.id);
      const folders = await FolderManager.getAllFolders();
      const deletedFolder = folders.find(f => f.id === addedFolder.id);
      console.assert(deletedFolder === undefined, '分组应被删除');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
