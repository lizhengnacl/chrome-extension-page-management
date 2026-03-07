import { DEFAULT_DATA, STORAGE_KEY } from './constants';
import { generateId, getTimestamp } from './utils';
import { generateColorFromTagName } from './colors';
import type { Page, Group, Tag, StorageData, ExportData } from '../types';

const TAG_COLORS_MIGRATION_VERSION = 1;

export async function getStorageData(): Promise<StorageData | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || null);
    });
  });
}

export async function setStorageData(data: StorageData): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: data }, () => {
      resolve();
    });
  });
}

async function migrateTagColorsIfNeeded(): Promise<void> {
  try {
    const data = await getStorageData();
    if (!data) return;
    
    const currentMigrationVersion = data.tagColorsMigrationVersion || 0;
    
    if (currentMigrationVersion >= TAG_COLORS_MIGRATION_VERSION) {
      return;
    }
    
    console.log('Migrating tag colors to new system...');
    
    if (data.tags && data.tags.length > 0) {
      data.tags = data.tags.map(tag => ({
        ...tag,
        color: generateColorFromTagName(tag.name)
      }));
    }
    
    data.tagColorsMigrationVersion = TAG_COLORS_MIGRATION_VERSION;
    await setStorageData(data);
    
    console.log('Tag colors migration completed successfully');
  } catch (error) {
    console.error('Failed to migrate tag colors:', error);
  }
}

export async function initStorage(): Promise<void> {
  try {
    const existingData = await getStorageData();
    if (!existingData) {
      await setStorageData(DEFAULT_DATA as StorageData);
    } else {
      await migrateTagColorsIfNeeded();
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

export async function getPages(): Promise<Page[]> {
  try {
    const data = await getStorageData();
    return data ? data.pages : [];
  } catch (error) {
    console.error('Failed to get pages:', error);
    throw error;
  }
}

export async function getPageById(pageId: string): Promise<Page | null> {
  try {
    const pages = await getPages();
    return pages.find(page => page.id === pageId) || null;
  } catch (error) {
    console.error('Failed to get page by ID:', error);
    throw error;
  }
}

export async function getGroups(): Promise<Group[]> {
  try {
    const data = await getStorageData();
    return data ? data.groups : [];
  } catch (error) {
    console.error('Failed to get groups:', error);
    throw error;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const data = await getStorageData();
    return data ? data.tags : [];
  } catch (error) {
    console.error('Failed to get tags:', error);
    throw error;
  }
}

export async function addPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const existingPage = data.pages.find(p => p.url === page.url);
    if (existingPage) {
      throw new Error('Page already exists');
    }
    
    const newPage: Page = {
      ...page,
      id: generateId('page'),
      createdAt: getTimestamp(),
      updatedAt: getTimestamp()
    };
    data.pages.push(newPage);
    await setStorageData(data);
    return newPage;
  } catch (error) {
    console.error('Failed to add page:', error);
    throw error;
  }
}

export async function updatePage(pageId: string, updates: Partial<Page>): Promise<Page> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const pageIndex = data.pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) {
      throw new Error('Page not found');
    }
    data.pages[pageIndex] = {
      ...data.pages[pageIndex],
      ...updates,
      updatedAt: getTimestamp()
    };
    await setStorageData(data);
    return data.pages[pageIndex];
  } catch (error) {
    console.error('Failed to update page:', error);
    throw error;
  }
}

export async function deletePage(pageId: string): Promise<void> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    data.pages = data.pages.filter(page => page.id !== pageId);
    await setStorageData(data);
  } catch (error) {
    console.error('Failed to delete page:', error);
    throw error;
  }
}

export async function getFavoritePages(): Promise<Page[]> {
  try {
    const pages = await getPages();
    return pages.filter(page => page.isFavorite);
  } catch (error) {
    console.error('Failed to get favorite pages:', error);
    throw error;
  }
}

export async function searchPages(keyword: string): Promise<Page[]> {
  try {
    const pages = await getPages();
    const lowerKeyword = keyword.toLowerCase();
    const tags = await getTags();
    const tagIdToName: Record<string, string> = {};
    tags.forEach(tag => {
      tagIdToName[tag.id] = tag.name.toLowerCase();
    });
    return pages.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(lowerKeyword);
      const urlMatch = page.url.toLowerCase().includes(lowerKeyword);
      const tagMatch = page.tags.some(tagId => 
        tagIdToName[tagId] && tagIdToName[tagId].includes(lowerKeyword)
      );
      return titleMatch || urlMatch || tagMatch;
    });
  } catch (error) {
    console.error('Failed to search pages:', error);
    throw error;
  }
}

export async function getPagesByGroupId(groupId: string | null): Promise<Page[]> {
  try {
    const pages = await getPages();
    return pages.filter(page => page.groupId === groupId);
  } catch (error) {
    console.error('Failed to get pages by group ID:', error);
    throw error;
  }
}

export async function getPagesByTagId(tagId: string): Promise<Page[]> {
  try {
    const pages = await getPages();
    return pages.filter(page => page.tags.includes(tagId));
  } catch (error) {
    console.error('Failed to get pages by tag ID:', error);
    throw error;
  }
}

export async function addGroup(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const newGroup: Group = {
      ...group,
      id: generateId('group'),
      createdAt: getTimestamp()
    };
    data.groups.push(newGroup);
    await setStorageData(data);
    return newGroup;
  } catch (error) {
    console.error('Failed to add group:', error);
    throw error;
  }
}

export async function updateGroup(groupId: string, updates: Partial<Group>): Promise<Group> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const groupIndex = data.groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      throw new Error('Group not found');
    }
    data.groups[groupIndex] = {
      ...data.groups[groupIndex],
      ...updates
    };
    await setStorageData(data);
    return data.groups[groupIndex];
  } catch (error) {
    console.error('Failed to update group:', error);
    throw error;
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    data.groups = data.groups.filter(group => group.id !== groupId);
    data.pages = data.pages.map(page => {
      if (page.groupId === groupId) {
        return { ...page, groupId: null };
      }
      return page;
    });
    await setStorageData(data);
  } catch (error) {
    console.error('Failed to delete group:', error);
    throw error;
  }
}

export async function addTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const newTag: Tag = {
      ...tag,
      id: generateId('tag')
    };
    data.tags.push(newTag);
    await setStorageData(data);
    return newTag;
  } catch (error) {
    console.error('Failed to add tag:', error);
    throw error;
  }
}

export async function updateTag(tagId: string, updates: Partial<Tag>): Promise<Tag> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    const tagIndex = data.tags.findIndex(tag => tag.id === tagId);
    if (tagIndex === -1) {
      throw new Error('Tag not found');
    }
    data.tags[tagIndex] = {
      ...data.tags[tagIndex],
      ...updates
    };
    await setStorageData(data);
    return data.tags[tagIndex];
  } catch (error) {
    console.error('Failed to update tag:', error);
    throw error;
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  try {
    const data = await getStorageData();
    if (!data) throw new Error('Storage not initialized');
    
    data.tags = data.tags.filter(tag => tag.id !== tagId);
    data.pages = data.pages.map(page => ({
      ...page,
      tags: page.tags.filter(id => id !== tagId)
    }));
    await setStorageData(data);
  } catch (error) {
    console.error('Failed to delete tag:', error);
    throw error;
  }
}

export async function exportData(): Promise<string> {
  try {
    const data = await getStorageData();
    if (!data) {
      throw new Error('No storage data found');
    }
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...data
    } as ExportData, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

export async function importData(jsonString: string): Promise<void> {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Invalid JSON string');
    }
    const imported = JSON.parse(jsonString);
    const data: StorageData = {
      version: imported.version || '1.0',
      pages: Array.isArray(imported.pages) ? imported.pages : [],
      groups: Array.isArray(imported.groups) ? imported.groups : [],
      tags: Array.isArray(imported.tags) ? imported.tags : []
    };
    await setStorageData(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
}
