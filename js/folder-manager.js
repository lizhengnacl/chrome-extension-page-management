import { generateId } from './utils.js';
import { Storage } from './storage.js';

export const FolderManager = {
  async getAllFolders() {
    try {
      return await Storage.getFolders();
    } catch (error) {
      console.error('获取所有分组失败:', error);
      throw error;
    }
  },
  
  async getFolder(folderId) {
    try {
      const folders = await Storage.getFolders();
      return folders.find(folder => folder.id === folderId) || null;
    } catch (error) {
      console.error('获取分组失败:', error);
      throw error;
    }
  },
  
  async addFolder(name) {
    try {
      const folders = await Storage.getFolders();
      const now = new Date().toISOString();
      const newFolder = {
        id: generateId('folder'),
        name: name,
        createdAt: now,
        updatedAt: now
      };
      folders.push(newFolder);
      await Storage.saveFolders(folders);
      return newFolder;
    } catch (error) {
      console.error('添加分组失败:', error);
      throw error;
    }
  },
  
  async updateFolder(folderId, name) {
    try {
      const folders = await Storage.getFolders();
      const index = folders.findIndex(folder => folder.id === folderId);
      if (index === -1) {
        throw new Error('分组不存在');
      }
      folders[index] = {
        ...folders[index],
        name: name,
        updatedAt: new Date().toISOString()
      };
      await Storage.saveFolders(folders);
      return folders[index];
    } catch (error) {
      console.error('更新分组失败:', error);
      throw error;
    }
  },
  
  async deleteFolder(folderId) {
    try {
      const folders = await Storage.getFolders();
      const filteredFolders = folders.filter(folder => folder.id !== folderId);
      await Storage.saveFolders(filteredFolders);
      
      const pages = await Storage.getPages();
      const updatedPages = pages.map(page => {
        if (page.folderId === folderId) {
          return { ...page, folderId: null };
        }
        return page;
      });
      await Storage.savePages(updatedPages);
    } catch (error) {
      console.error('删除分组失败:', error);
      throw error;
    }
  }
};
