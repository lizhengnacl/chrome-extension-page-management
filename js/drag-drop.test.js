const DragDropTests = {
  async runAll() {
    console.log('🧪 开始运行 drag-drop.js 测试...\n');
    
    const results = [];
    
    results.push(await this.testValidateDragData());
    results.push(await this.testCalculateNewPosition());
    results.push(await this.testReorderPages());
    results.push(await this.testMovePageToFolder());
    results.push(await this.testValidateFolderName());
    results.push(await this.testIsDragOverFolder());
    
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

  async testValidateDragData() {
    const name = 'validateDragData - 验证拖拽数据';
    try {
      const validData = { pageId: 'page_1', fromFolderId: 'folder_1' };
      const invalidData1 = { pageId: null };
      const invalidData2 = { fromFolderId: 'folder_1' };
      
      console.assert(DragDrop.validateDragData(validData) === true, '有效数据应返回 true');
      console.assert(DragDrop.validateDragData(invalidData1) === false, '无效数据应返回 false');
      console.assert(DragDrop.validateDragData(invalidData2) === false, '缺少 pageId 应返回 false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testCalculateNewPosition() {
    const name = 'calculateNewPosition - 计算新位置';
    try {
      const pages = [
        { id: 'page_1', order: 1 },
        { id: 'page_2', order: 2 },
        { id: 'page_3', order: 3 }
      ];
      
      const newPosition1 = DragDrop.calculateNewPosition(pages, 0);
      const newPosition2 = DragDrop.calculateNewPosition(pages, 2);
      const newPosition3 = DragDrop.calculateNewPosition(pages, 1, 'page_2');
      
      console.assert(newPosition1 < 1, '插入开头应小于1');
      console.assert(newPosition2 > 3, '插入末尾应大于3');
      console.assert(typeof newPosition3 === 'number', '应返回数字');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testReorderPages() {
    const name = 'reorderPages - 重新排序页面';
    try {
      const pages = [
        { id: 'page_1', order: 1 },
        { id: 'page_2', order: 2 },
        { id: 'page_3', order: 3 }
      ];
      
      const reordered = DragDrop.reorderPages(pages, 'page_2', 0);
      
      console.assert(Array.isArray(reordered), '应返回数组');
      console.assert(reordered.length === 3, '数组长度应不变');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testMovePageToFolder() {
    const name = 'movePageToFolder - 移动页面到分组';
    try {
      const page = { id: 'page_1', folderId: 'old_folder' };
      const targetFolderId = 'new_folder';
      
      const movedPage = DragDrop.movePageToFolder(page, targetFolderId);
      
      console.assert(movedPage.folderId === targetFolderId, '页面应移动到新分组');
      console.assert(movedPage.id === page.id, '页面 ID 应不变');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testValidateFolderName() {
    const name = 'validateFolderName - 验证分组名称';
    try {
      console.assert(DragDrop.validateFolderName('工作') === true, '有效名称应返回 true');
      console.assert(DragDrop.validateFolderName('') === false, '空名称应返回 false');
      console.assert(DragDrop.validateFolderName(null) === false, 'null 应返回 false');
      console.assert(DragDrop.validateFolderName('   ') === false, '只含空格应返回 false');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  },

  async testIsDragOverFolder() {
    const name = 'isDragOverFolder - 判断是否拖拽到分组';
    try {
      const mockEvent = {
        target: {
          closest: (selector) => {
            if (selector === '.group-header' || selector === '.group-container') {
              return { dataset: { folderId: 'test_folder' } };
            }
            return null;
          }
        }
      };
      
      const folderId = DragDrop.isDragOverFolder(mockEvent);
      
      console.assert(folderId === 'test_folder' || folderId === null, '应返回分组 ID 或 null');
      console.log(`✅ ${name}`);
      return { name, passed: true };
    } catch (error) {
      console.error(`❌ ${name}:`, error.message);
      return { name, passed: false, error: error.message };
    }
  }
};
