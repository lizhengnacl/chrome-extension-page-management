/**
 * 存储管理模块
 * 负责与chrome.storage.sync交互，管理数据的CRUD操作
 * 包含存储用量监控和容量警告功能
 */

import type { Page, Group, TagNode, StorageData, StorageUsage } from './types';
import { isSamePage } from './utils';

const STORAGE_KEY = 'pageManager_data';
const SYNC_STORAGE_LIMIT = 100 * 1024; // 100KB

/** 获取默认存储数据 */
function getDefaultData(): StorageData {
  return {
    pages: [],
    groups: [
      { id: 'default', name: '未分类', order: 0, createdAt: Date.now() }
    ],
    tags: [],
    settings: {
      lastSyncAt: Date.now(),
      storageWarningShown: false,
    },
  };
}

/** 获取存储数据 */
export async function getStorageData(): Promise<StorageData> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return result[STORAGE_KEY] || getDefaultData();
  } catch (error) {
    console.error('获取存储数据失败:', error);
    return getDefaultData();
  }
}

/** 保存存储数据 */
export async function setStorageData(data: StorageData): Promise<boolean> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: data });
    return true;
  } catch (error) {
    console.error('保存存储数据失败:', error);
    return false;
  }
}

/** 获取存储用量 */
export async function getStorageUsage(): Promise<StorageUsage> {
  try {
    const data = await getStorageData();
    const jsonString = JSON.stringify(data);
    const used = new Blob([jsonString]).size;
    return {
      used,
      total: SYNC_STORAGE_LIMIT,
      percentage: (used / SYNC_STORAGE_LIMIT) * 100,
    };
  } catch (error) {
    console.error('获取存储用量失败:', error);
    return { used: 0, total: SYNC_STORAGE_LIMIT, percentage: 0 };
  }
}

/** 检查是否需要显示存储警告（超过80%） */
export async function shouldShowStorageWarning(): Promise<boolean> {
  const usage = await getStorageUsage();
  return usage.percentage >= 80;
}

/** 生成唯一ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** 页面相关操作 */
export const pageStorage = {
  /** 获取所有页面 */
  async getAll(): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages;
  },

  /** 根据ID获取页面 */
  async getById(id: string): Promise<Page | undefined> {
    const data = await getStorageData();
    return data.pages.find(p => p.id === id);
  },

  /**
   * 检查是否存在重复页面
   * 重复判断标准：同一页面（考虑path、query、hash差异）在同一分组内已存在
   */
  async checkDuplicate(url: string, groups: string[]): Promise<boolean> {
    const data = await getStorageData();
    return data.pages.some(page => 
      isSamePage(page.url, url) && 
      page.groups.some(groupId => groups.includes(groupId))
    );
  },

  /** 添加页面 */
  async add(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page | null> {
    const data = await getStorageData();
    
    // 检查是否存在重复
    const isDuplicate = await this.checkDuplicate(page.url, page.groups);
    
    if (isDuplicate) {
      return null; // 已存在，返回null表示失败
    }

    const newPage: Page = {
      ...page,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    data.pages.push(newPage);
    const success = await setStorageData(data);
    return success ? newPage : null;
  },

  /** 更新页面 */
  async update(id: string, updates: Partial<Page>): Promise<boolean> {
    const data = await getStorageData();
    const index = data.pages.findIndex(p => p.id === id);
    if (index === -1) return false;

    data.pages[index] = {
      ...data.pages[index],
      ...updates,
      updatedAt: Date.now(),
    };
    return setStorageData(data);
  },

  /** 删除页面 */
  async delete(id: string): Promise<boolean> {
    const data = await getStorageData();
    data.pages = data.pages.filter(p => p.id !== id);
    return setStorageData(data);
  },

  /** 从分组中移除页面（不从总库删除） */
  async removeFromGroup(pageId: string, groupId: string): Promise<boolean> {
    const data = await getStorageData();
    const page = data.pages.find(p => p.id === pageId);
    if (!page) return false;

    page.groups = page.groups.filter(g => g !== groupId);
    page.updatedAt = Date.now();
    return setStorageData(data);
  },

  /** 搜索页面 */
  async search(keyword: string, tagFilter?: string, groupFilter?: string): Promise<Page[]> {
    const data = await getStorageData();
    const lowerKeyword = keyword.toLowerCase();

    return data.pages.filter(page => {
      const matchKeyword = 
        page.title.toLowerCase().includes(lowerKeyword) ||
        page.url.toLowerCase().includes(lowerKeyword);
      
      const matchTag = !tagFilter || page.tags.some(t => t.includes(tagFilter));
      const matchGroup = !groupFilter || page.groups.includes(groupFilter);

      return matchKeyword && matchTag && matchGroup;
    });
  },

  /** 获取分组下的所有页面 */
  async getByGroup(groupId: string): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages.filter(p => p.groups.includes(groupId));
  },

  /** 获取标签下的所有页面 */
  async getByTag(tagPath: string): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages.filter(p => p.tags.some(t => t === tagPath || t.startsWith(`${tagPath}/`)));
  },

  /** 批量更新页面favicon和标题 */
  async batchUpdateInfo(updates: { id: string; title?: string; favicon?: string }[]): Promise<boolean> {
    const data = await getStorageData();
    
    updates.forEach(update => {
      const page = data.pages.find(p => p.id === update.id);
      if (page) {
        if (update.title) page.title = update.title;
        if (update.favicon) page.favicon = update.favicon;
        page.updatedAt = Date.now();
      }
    });

    return setStorageData(data);
  },
};

/** 分组相关操作 */
export const groupStorage = {
  /** 获取所有分组 */
  async getAll(): Promise<Group[]> {
    const data = await getStorageData();
    return data.groups.sort((a, b) => a.order - b.order);
  },

  /** 根据ID获取分组 */
  async getById(id: string): Promise<Group | undefined> {
    const data = await getStorageData();
    return data.groups.find(g => g.id === id);
  },

  /** 添加分组 */
  async add(name: string, description?: string): Promise<Group> {
    const data = await getStorageData();
    const maxOrder = Math.max(...data.groups.map(g => g.order), 0);
    
    const newGroup: Group = {
      id: generateId(),
      name,
      description,
      order: maxOrder + 1,
      createdAt: Date.now(),
    };

    data.groups.push(newGroup);
    await setStorageData(data);
    return newGroup;
  },

  /** 更新分组 */
  async update(id: string, updates: Partial<Group>): Promise<boolean> {
    const data = await getStorageData();
    const index = data.groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    data.groups[index] = { ...data.groups[index], ...updates };
    return setStorageData(data);
  },

  /** 删除分组（同时从所有页面中移除该分组） */
  async delete(id: string): Promise<boolean> {
    const data = await getStorageData();
    // 从所有页面中移除该分组
    data.pages.forEach(page => {
      page.groups = page.groups.filter(gid => gid !== id);
    });
    data.groups = data.groups.filter(g => g.id !== id);
    return setStorageData(data);
  },

  /** 批量打开分组中的所有页面 */
  async openAll(groupId: string): Promise<void> {
    const pages = await pageStorage.getByGroup(groupId);
    if (pages.length === 0) return;

    try {
      // 创建新窗口并打开所有页面
      const window = await chrome.windows.create({ 
        focused: true,
        state: 'normal'
      });
      
      if (window && window.id) {
        // 第一个页面作为活动页面
        for (let i = 0; i < pages.length; i++) {
          await chrome.tabs.create({
            windowId: window.id,
            url: pages[i].url,
            active: i === 0,
          });
        }
      }
    } catch (error) {
      console.error('打开分组失败:', error);
      // 回退方案：在当前窗口打开
      for (const page of pages) {
        await chrome.tabs.create({
          url: page.url,
          active: false,
        });
      }
    }
  },
};

/** 标签相关操作 */
export const tagStorage = {
  /** 获取所有标签树 */
  async getAll(): Promise<TagNode[]> {
    const data = await getStorageData();
    return data.tags;
  },

  /** 添加标签（支持多级路径） */
  async addTag(path: string): Promise<void> {
    const data = await getStorageData();
    const parts = path.split('/').filter(Boolean);
    
    let currentLevel = data.tags;
    let currentPath = '';

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      let existingNode = currentLevel.find(node => node.name === part);
      if (!existingNode) {
        existingNode = {
          id: generateId(),
          name: part,
          path: currentPath,
          children: [],
        };
        currentLevel.push(existingNode);
      }
      
      currentLevel = existingNode.children;
    }

    await setStorageData(data);
  },

  /** 获取所有标签路径（扁平化） */
  async getAllPaths(): Promise<string[]> {
    const data = await getStorageData();
    const paths: string[] = [];

    const traverse = (nodes: TagNode[], parentPath = '') => {
      for (const node of nodes) {
        const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
        paths.push(fullPath);
        traverse(node.children, fullPath);
      }
    };

    traverse(data.tags);
    return paths;
  },

  /** 搜索标签 */
  async searchTags(prefix: string): Promise<string[]> {
    const allPaths = await this.getAllPaths();
    const lowerPrefix = prefix.toLowerCase();
    return allPaths.filter(path => 
      path.toLowerCase().includes(lowerPrefix)
    );
  },

  /** 删除标签（同时从所有页面中移除该标签及其子标签） */
  async deleteTag(tagPath: string): Promise<boolean> {
    const data = await getStorageData();
    
    // 递归删除标签树中的节点
    const deleteNode = (nodes: TagNode[]): TagNode[] => {
      return nodes.filter(node => {
        if (node.path === tagPath || node.path.startsWith(`${tagPath}/`)) {
          return false;
        }
        node.children = deleteNode(node.children);
        return true;
      });
    };
    
    data.tags = deleteNode(data.tags);
    
    // 从所有页面中移除该标签及其子标签
    data.pages.forEach(page => {
      page.tags = page.tags.filter(tag => 
        tag !== tagPath && !tag.startsWith(`${tagPath}/`)
      );
    });
    
    return setStorageData(data);
  },
};