/**
 * 存储管理模块
 * 负责与chrome.storage.sync交互，管理数据的CRUD操作
 * 包含存储用量监控和容量警告功能
 * 采用分键存储策略避免 chrome.storage.sync 的单项配额限制
 * 优化写入操作，避免频繁调用 chrome.storage.sync.set
 */

import type { Page, Group, TagNode, StorageData, StorageUsage } from './types';
import { isSamePage } from './utils';

const STORAGE_PREFIX = 'pageManager_';
const PAGES_PER_CHUNK = 10; 
const SYNC_STORAGE_LIMIT = 100 * 1024; 
const ITEM_SIZE_LIMIT = 6 * 1024; 

const KEYS = {
  groups: STORAGE_PREFIX + 'groups',
  tags: STORAGE_PREFIX + 'tags',
  settings: STORAGE_PREFIX + 'settings',
  pageCount: STORAGE_PREFIX + 'pageCount',
  pageChunk: (index: number) => STORAGE_PREFIX + 'pages_' + index,
} as const;

function getDefaultGroups(): Group[] {
  return [
    { id: 'frequent', name: '常用地址', order: 0, pinned: false, createdAt: Date.now() },
    { id: 'default', name: '未分类', order: 1, pinned: false, createdAt: Date.now() }
  ];
}

function getDefaultSettings() {
  return {
    lastSyncAt: Date.now(),
    storageWarningShown: false,
  };
}

function getObjectSize(obj: any): number {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
}

function buildPageStorageUpdates(pages: Page[]): Record<string, any> {
  const updates: Record<string, any> = {
    [KEYS.pageCount]: pages.length,
  };
  
  if (pages.length === 0) {
    return updates;
  }
  
  let currentChunk: Page[] = [];
  let chunkIndex = 0;
  
  for (const page of pages) {
    currentChunk.push(page);
    const chunkSize = getObjectSize(currentChunk);
    
    if (chunkSize > ITEM_SIZE_LIMIT) {
      currentChunk.pop();
      if (currentChunk.length > 0) {
        updates[KEYS.pageChunk(chunkIndex)] = [...currentChunk];
        chunkIndex++;
      }
      currentChunk = [page];
    }
  }
  
  if (currentChunk.length > 0) {
    updates[KEYS.pageChunk(chunkIndex)] = currentChunk;
  }
  
  return updates;
}

function buildStorageUpdates(data: StorageData): Record<string, any> {
  const updates: Record<string, any> = {
    [KEYS.groups]: data.groups,
    [KEYS.tags]: data.tags,
    [KEYS.settings]: data.settings,
    ...buildPageStorageUpdates(data.pages),
  };
  
  return updates;
}

async function hasLegacyData(): Promise<boolean> {
  try {
    const result = await chrome.storage.sync.get('pageManager_data');
    return !!result['pageManager_data'];
  } catch {
    return false;
  }
}

async function migrateLegacyData(): Promise<void> {
  try {
    const result = await chrome.storage.sync.get('pageManager_data');
    const legacyData = result['pageManager_data'];
    
    if (!legacyData) return;
    
    console.log('正在迁移旧格式数据...');
    
    const updates = buildStorageUpdates({
      pages: legacyData.pages || [],
      groups: legacyData.groups || getDefaultGroups(),
      tags: legacyData.tags || [],
      settings: legacyData.settings || getDefaultSettings(),
    });
    
    await chrome.storage.sync.set(updates);
    await chrome.storage.sync.remove('pageManager_data');
    
    console.log('数据迁移完成');
  } catch (error) {
    console.error('数据迁移失败:', error);
  }
}

async function getPages(): Promise<Page[]> {
  try {
    const result = await chrome.storage.sync.get(KEYS.pageCount);
    const pageCount = result[KEYS.pageCount] || 0;
    if (pageCount === 0) return [];

    const allStorage = await chrome.storage.sync.get();
    const pages: Page[] = [];
    const pageChunkKeys: string[] = [];
    
    for (const key of Object.keys(allStorage)) {
      if (key.indexOf(STORAGE_PREFIX + 'pages_') === 0) {
        pageChunkKeys.push(key);
      }
    }
    
    pageChunkKeys.sort((a, b) => {
      const indexA = parseInt(a.split('_')[2]);
      const indexB = parseInt(b.split('_')[2]);
      return indexA - indexB;
    });
    
    for (const key of pageChunkKeys) {
      const chunk = allStorage[key] || [];
      pages.push(...chunk);
    }
    
    return pages;
  } catch (error) {
    console.error('获取页面数据失败:', error);
    return [];
  }
}

async function getGroups(): Promise<Group[]> {
  try {
    const result = await chrome.storage.sync.get(KEYS.groups);
    let groups = result[KEYS.groups] || getDefaultGroups();
    
    // 确保"常用地址"分组存在
    const hasFrequent = groups.some(g => g.id === 'frequent');
    if (!hasFrequent) {
      const maxOrder = Math.max(...groups.map(g => g.order), 0);
      groups.unshift({ 
        id: 'frequent', 
        name: '常用地址', 
        order: -1, 
        pinned: false, 
        createdAt: Date.now() 
      });
      // 保存更新后的分组
      await setStorageData({
        pages: await getPages(),
        groups,
        tags: await getTags(),
        settings: await getSettings()
      });
    }
    
    return groups;
  } catch (error) {
    console.error('获取分组数据失败:', error);
    return getDefaultGroups();
  }
}

async function getTags(): Promise<TagNode[]> {
  try {
    const result = await chrome.storage.sync.get(KEYS.tags);
    return result[KEYS.tags] || [];
  } catch (error) {
    console.error('获取标签数据失败:', error);
    return [];
  }
}

async function getSettings() {
  try {
    const result = await chrome.storage.sync.get(KEYS.settings);
    return result[KEYS.settings] || getDefaultSettings();
  } catch (error) {
    console.error('获取设置数据失败:', error);
    return getDefaultSettings();
  }
}

export async function getStorageData(): Promise<StorageData> {
  try {
    if (await hasLegacyData()) {
      await migrateLegacyData();
    }
    
    const [pages, groups, tags, settings] = await Promise.all([
      getPages(),
      getGroups(),
      getTags(),
      getSettings(),
    ]);
    
    return { pages, groups, tags, settings };
  } catch (error) {
    console.error('获取存储数据失败:', error);
    return {
      pages: [],
      groups: getDefaultGroups(),
      tags: [],
      settings: getDefaultSettings(),
    };
  }
}

async function getOldPageChunkKeys(newChunkKeys: Set<string>): Promise<string[]> {
  const allKeys = await chrome.storage.sync.get();
  const oldKeys: string[] = [];
  
  for (const key of Object.keys(allKeys)) {
    if (key.indexOf(STORAGE_PREFIX + 'pages_') === 0 && !newChunkKeys.has(key)) {
      oldKeys.push(key);
    }
  }
  
  return oldKeys;
}

export async function setStorageData(data: StorageData): Promise<boolean> {
  try {
    const updates = buildStorageUpdates(data);
    const newChunkKeys = new Set<string>();
    
    for (const key of Object.keys(updates)) {
      if (key.indexOf(STORAGE_PREFIX + 'pages_') === 0) {
        newChunkKeys.add(key);
      }
    }
    
    const oldKeys = await getOldPageChunkKeys(newChunkKeys);
    await chrome.storage.sync.set(updates);
    
    if (oldKeys.length > 0) {
      await chrome.storage.sync.remove(oldKeys);
    }
    
    return true;
  } catch (error) {
    console.error('保存存储数据失败:', error);
    return false;
  }
}

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

export async function shouldShowStorageWarning(): Promise<boolean> {
  const usage = await getStorageUsage();
  return usage.percentage >= 80;
}

export function generateId(): string {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export const pageStorage = {
  async getAll(): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages;
  },

  async getById(id: string): Promise<Page | undefined> {
    const data = await getStorageData();
    return data.pages.find(p => p.id === id);
  },

  async getByUrl(url: string): Promise<Page | undefined> {
    const data = await getStorageData();
    return data.pages.find(p => isSamePage(p.url, url));
  },

  async checkDuplicate(url: string, excludePageId?: string): Promise<boolean> {
    const data = await getStorageData();
    return data.pages.some(page => 
      isSamePage(page.url, url) && page.id !== excludePageId
    );
  },

  async add(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page | null> {
    const data = await getStorageData();
    
    const isDuplicate = await this.checkDuplicate(page.url);
    
    if (isDuplicate) {
      return null;
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

  async update(id: string, updates: Partial<Page>): Promise<{ success: boolean; isDuplicate?: boolean }> {
    const data = await getStorageData();
    const index = data.pages.findIndex(p => p.id === id);
    if (index === -1) return { success: false };

    if (updates.url) {
      const isDuplicate = await this.checkDuplicate(updates.url, id);
      if (isDuplicate) {
        return { success: false, isDuplicate: true };
      }
    }

    data.pages[index] = {
      ...data.pages[index],
      ...updates,
      updatedAt: Date.now(),
    };
    const success = await setStorageData(data);
    return { success };
  },

  async delete(id: string): Promise<boolean> {
    const data = await getStorageData();
    data.pages = data.pages.filter(p => p.id !== id);
    return setStorageData(data);
  },

  async deleteAll(): Promise<boolean> {
    const data = await getStorageData();
    data.pages = [];
    // 只保留默认分组
    data.groups = data.groups.filter(g => g.id === 'default');
    return setStorageData(data);
  },

  async removeFromGroup(pageId: string, groupId: string): Promise<boolean> {
    const data = await getStorageData();
    const page = data.pages.find(p => p.id === pageId);
    if (!page) return false;

    page.groups = page.groups.filter(g => g !== groupId);
    page.updatedAt = Date.now();
    return setStorageData(data);
  },

  async search(keyword: string, tagFilter?: string, groupFilter?: string): Promise<Page[]> {
    const data = await getStorageData();
    const lowerKeyword = keyword.toLowerCase();

    return data.pages.filter(page => {
      const matchKeyword = 
        page.title.toLowerCase().indexOf(lowerKeyword) !== -1 ||
        page.url.toLowerCase().indexOf(lowerKeyword) !== -1;
      
      const matchTag = !tagFilter || page.tags.some(t => t.indexOf(tagFilter) !== -1);
      const matchGroup = !groupFilter || page.groups.indexOf(groupFilter) !== -1;

      return matchKeyword && matchTag && matchGroup;
    });
  },

  async getByGroup(groupId: string): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages.filter(p => p.groups.indexOf(groupId) !== -1);
  },

  async getByTag(tagPath: string): Promise<Page[]> {
    const data = await getStorageData();
    return data.pages.filter(p => p.tags.some(t => t === tagPath || t.indexOf(tagPath + '/') === 0));
  },

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

export const groupStorage = {
  async getAll(): Promise<Group[]> {
    const data = await getStorageData();
    return data.groups.sort((a, b) => {
      // 未分类分组始终排在尾部
      if (a.id === 'default' && b.id !== 'default') {
        return 1;
      }
      if (a.id !== 'default' && b.id === 'default') {
        return -1;
      }
      // 置顶的分组排在前面
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      // 同一置顶状态下按 order 排序
      return a.order - b.order;
    });
  },

  async reorder(groupIds: string[]): Promise<boolean> {
    const data = await getStorageData();
    
    // 为每个分组更新 order 值
    groupIds.forEach((groupId, index) => {
      const group = data.groups.find(g => g.id === groupId);
      if (group) {
        group.order = index;
      }
    });
    
    return setStorageData(data);
  },

  async getById(id: string): Promise<Group | undefined> {
    const data = await getStorageData();
    return data.groups.find(g => g.id === id);
  },

  async add(name: string, description?: string): Promise<Group | null> {
    const reservedNames = ['常用地址', '未分类'];
    if (reservedNames.includes(name.trim())) {
      return null;
    }
    
    const data = await getStorageData();
    const maxOrder = Math.max(...data.groups.map(g => g.order), 0);
    
    const newGroup: Group = {
      id: generateId(),
      name,
      description,
      order: maxOrder + 1,
      pinned: false,
      createdAt: Date.now(),
    };

    data.groups.push(newGroup);
    await setStorageData(data);
    return newGroup;
  },

  async togglePin(id: string): Promise<boolean> {
    const data = await getStorageData();
    const group = data.groups.find(g => g.id === id);
    if (!group) return false;

    group.pinned = !group.pinned;
    return setStorageData(data);
  },

  async update(id: string, updates: Partial<Group>): Promise<boolean> {
    const data = await getStorageData();
    const index = data.groups.findIndex(g => g.id === id);
    if (index === -1) return false;

    if (updates.name) {
      const reservedNames = ['常用地址', '未分类'];
      if (reservedNames.includes(updates.name.trim())) {
        return false;
      }
    }

    data.groups[index] = { ...data.groups[index], ...updates };
    return setStorageData(data);
  },

  async delete(id: string): Promise<boolean> {
    const data = await getStorageData();
    data.pages.forEach(page => {
      page.groups = page.groups.filter(gid => gid !== id);
    });
    data.groups = data.groups.filter(g => g.id !== id);
    return setStorageData(data);
  },

  async openAll(groupId: string): Promise<void> {
    const pages = await pageStorage.getByGroup(groupId);
    if (pages.length === 0) return;

    try {
      const window = await chrome.windows.create({ 
        focused: true,
        state: 'normal'
      });
      
      if (window && window.id) {
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
      for (const page of pages) {
        await chrome.tabs.create({
          url: page.url,
          active: false,
        });
      }
    }
  },
};

export const tagStorage = {
  async getAll(): Promise<TagNode[]> {
    const data = await getStorageData();
    
    const ensureOrderAndSort = (nodes: TagNode[]): TagNode[] => {
      return nodes.map((node, index) => ({
        ...node,
        order: node.order !== undefined ? node.order : index,
        children: ensureOrderAndSort(node.children),
      })).sort((a, b) => a.order - b.order);
    };
    
    return ensureOrderAndSort(data.tags);
  },

  async addTag(path: string): Promise<void> {
    const data = await getStorageData();
    const parts = path.split('/').filter(Boolean);
    
    let currentLevel = data.tags;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? currentPath + '/' + part : part;
      
      let existingNode = currentLevel.find(node => node.name === part);
      if (!existingNode) {
        const maxOrder = currentLevel.length > 0 ? Math.max(...currentLevel.map(n => n.order), -1) : -1;
        existingNode = {
          id: generateId(),
          name: part,
          path: currentPath,
          order: maxOrder + 1,
          children: [],
        };
        currentLevel.push(existingNode);
      }
      
      currentLevel = existingNode.children;
    }

    await setStorageData(data);
  },

  async reorder(parentPath: string | null, tagIds: string[]): Promise<boolean> {
    const data = await getStorageData();
    
    const updateOrder = (nodes: TagNode[], ids: string[]): TagNode[] => {
      ids.forEach((id, index) => {
        const node = nodes.find(n => n.id === id);
        if (node) {
          node.order = index;
        }
      });
      return nodes.sort((a, b) => a.order - b.order);
    };

    if (parentPath === null) {
      data.tags = updateOrder(data.tags, tagIds);
    } else {
      const findAndUpdate = (nodes: TagNode[]): boolean => {
        for (const node of nodes) {
          if (node.path === parentPath) {
            node.children = updateOrder(node.children, tagIds);
            return true;
          }
          if (findAndUpdate(node.children)) {
            return true;
          }
        }
        return false;
      };
      findAndUpdate(data.tags);
    }
    
    return setStorageData(data);
  },

  async getAllPaths(): Promise<string[]> {
    const data = await getStorageData();
    const paths: string[] = [];

    const traverse = (nodes: TagNode[], parentPath = '') => {
      for (const node of nodes) {
        const fullPath = parentPath ? parentPath + '/' + node.name : node.name;
        paths.push(fullPath);
        traverse(node.children, fullPath);
      }
    };

    traverse(data.tags);
    return paths;
  },

  async searchTags(prefix: string): Promise<string[]> {
    const allPaths = await this.getAllPaths();
    const lowerPrefix = prefix.toLowerCase();
    return allPaths.filter(path => 
      path.toLowerCase().indexOf(lowerPrefix) !== -1
    );
  },

  async deleteTag(tagPath: string): Promise<boolean> {
    const data = await getStorageData();
    
    const deleteNode = (nodes: TagNode[]): TagNode[] => {
      return nodes.filter(node => {
        if (node.path === tagPath || node.path.indexOf(tagPath + '/') === 0) {
          return false;
        }
        node.children = deleteNode(node.children);
        return true;
      });
    };
    
    data.tags = deleteNode(data.tags);
    
    data.pages.forEach(page => {
      page.tags = page.tags.filter(tag => 
        tag !== tagPath && tag.indexOf(tagPath + '/') !== 0
      );
    });
    
    return setStorageData(data);
  },
};
