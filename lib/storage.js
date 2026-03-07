import { DEFAULT_DATA, STORAGE_KEY } from './constants.js';
import { generateId, getTimestamp } from './utils.js';
import { generateColorFromTagName } from './colors.js';

const TAG_COLORS_MIGRATION_VERSION = 1;

async function getStorageData() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || null);
    });
  });
}

async function setStorageData(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: data }, () => {
      resolve();
    });
  });
}

async function migrateTagColorsIfNeeded() {
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

async function initStorage() {
  try {
    const existingData = await getStorageData();
    if (!existingData) {
      await setStorageData(DEFAULT_DATA);
    } else {
      await migrateTagColorsIfNeeded();
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    throw error;
  }
}

async function getPages() {
  try {
    const data = await getStorageData();
    return data ? data.pages : [];
  } catch (error) {
    console.error('Failed to get pages:', error);
    throw error;
  }
}

async function getPageById(pageId) {
  try {
    const pages = await getPages();
    return pages.find(page => page.id === pageId) || null;
  } catch (error) {
    console.error('Failed to get page by ID:', error);
    throw error;
  }
}

async function getGroups() {
  try {
    const data = await getStorageData();
    return data ? data.groups : [];
  } catch (error) {
    console.error('Failed to get groups:', error);
    throw error;
  }
}

async function getTags() {
  try {
    const data = await getStorageData();
    return data ? data.tags : [];
  } catch (error) {
    console.error('Failed to get tags:', error);
    throw error;
  }
}

async function addPage(page) {
  try {
    const data = await getStorageData();
    
    const existingPage = data.pages.find(p => p.url === page.url);
    if (existingPage) {
      throw new Error('Page already exists');
    }
    
    const newPage = {
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

async function updatePage(pageId, updates) {
  try {
    const data = await getStorageData();
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

async function deletePage(pageId) {
  try {
    const data = await getStorageData();
    data.pages = data.pages.filter(page => page.id !== pageId);
    await setStorageData(data);
  } catch (error) {
    console.error('Failed to delete page:', error);
    throw error;
  }
}

async function getFavoritePages() {
  try {
    const pages = await getPages();
    return pages.filter(page => page.isFavorite);
  } catch (error) {
    console.error('Failed to get favorite pages:', error);
    throw error;
  }
}

async function searchPages(keyword) {
  try {
    const pages = await getPages();
    const lowerKeyword = keyword.toLowerCase();
    const tags = await getTags();
    const tagIdToName = {};
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

async function getPagesByGroupId(groupId) {
  try {
    const pages = await getPages();
    return pages.filter(page => page.groupId === groupId);
  } catch (error) {
    console.error('Failed to get pages by group ID:', error);
    throw error;
  }
}

async function getPagesByTagId(tagId) {
  try {
    const pages = await getPages();
    return pages.filter(page => page.tags.includes(tagId));
  } catch (error) {
    console.error('Failed to get pages by tag ID:', error);
    throw error;
  }
}

async function addGroup(group) {
  try {
    const data = await getStorageData();
    const newGroup = {
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

async function updateGroup(groupId, updates) {
  try {
    const data = await getStorageData();
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

async function deleteGroup(groupId) {
  try {
    const data = await getStorageData();
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

async function addTag(tag) {
  try {
    const data = await getStorageData();
    const newTag = {
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

async function updateTag(tagId, updates) {
  try {
    const data = await getStorageData();
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

async function deleteTag(tagId) {
  try {
    const data = await getStorageData();
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

async function exportData() {
  try {
    const data = await getStorageData();
    if (!data) {
      throw new Error('No storage data found');
    }
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...data
    }, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

async function importData(jsonString) {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Invalid JSON string');
    }
    const imported = JSON.parse(jsonString);
    const data = {
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

export {
  initStorage,
  migrateTagColorsIfNeeded,
  getPages,
  getPageById,
  getGroups,
  getTags,
  addPage,
  updatePage,
  deletePage,
  getFavoritePages,
  searchPages,
  getPagesByGroupId,
  getPagesByTagId,
  addGroup,
  updateGroup,
  deleteGroup,
  addTag,
  updateTag,
  deleteTag,
  exportData,
  importData
};
