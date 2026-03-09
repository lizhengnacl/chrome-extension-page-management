/**
 * 浏览器书签导入工具
 * 负责从 Chrome 书签导入数据到插件
 * 采用批量处理策略减少存储写入次数
 */

import { pageStorage, groupStorage, getStorageData, setStorageData, generateId } from '../storage';
import { getFaviconUrl, isSamePage } from '../utils';
import type { Page, StorageData, Group } from '../types';

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  dateAdded?: number;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  error?: string;
}

interface ImportContext {
  importedUrls: Set<string>; // 跟踪已导入的 URL，避免重复处理
  pagesToAdd: Page[]; // 需要新增的页面
  pagesToUpdate: Map<string, Partial<Page>>; // 需要更新的页面 (id -> updates)
  groupsToAdd: Group[]; // 需要新增的分组
  existingPages: Array<{ id: string; url: string; groups: string[] }>; // 预加载现有页面
  existingGroups: Group[]; // 预加载现有分组
}

/** 简单延迟函数 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 递归遍历书签树，收集变更
 */
async function traverseBookmarks(
  node: BookmarkNode,
  groupIdMap: Map<string, string>,
  parentGroupId: string = 'default',
  context: ImportContext
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  // 如果是书签（有 URL）
  if (node.url) {
    try {
      // 检查是否已经在本次导入中处理过这个 URL
      const isAlreadyProcessed = Array.from(context.importedUrls).some(processedUrl => 
        isSamePage(processedUrl, node.url)
      );

      if (isAlreadyProcessed) {
        skipped++;
      } else {
        // 检查 URL 是否已在存储中存在
        const existingPage = context.existingPages.find(p => 
          isSamePage(p.url, node.url)
        );

        if (existingPage) {
          // URL 已存在，检查是否需要添加新分组
          if (!existingPage.groups.includes(parentGroupId)) {
            // 收集更新而不是立即写入
            const currentUpdates = context.pagesToUpdate.get(existingPage.id) || {};
            const newGroups = [...existingPage.groups, parentGroupId];
            context.pagesToUpdate.set(existingPage.id, {
              ...currentUpdates,
              groups: newGroups,
              updatedAt: Date.now(),
            });
            // 更新缓存
            existingPage.groups = newGroups;
            imported++;
          } else {
            // 已在该分组中，跳过
            skipped++;
          }
        } else {
          // URL 不存在，收集到新增列表而不是立即写入
          const newPage: Page = {
            id: generateId(),
            url: node.url,
            title: node.title || node.url,
            favicon: getFaviconUrl(node.url),
            tags: [],
            groups: [parentGroupId],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          context.pagesToAdd.push(newPage);
          imported++;
          // 记录已处理的 URL
          context.importedUrls.add(node.url);
          // 更新现有页面缓存
          context.existingPages.push({
            id: newPage.id,
            url: newPage.url,
            groups: newPage.groups,
          });
        }
      }
    } catch {
      skipped++;
    }
  }

  // 如果是文件夹（有 children）
  if (node.children && node.children.length > 0) {
    let currentGroupId = parentGroupId;

    // 如果不是根节点，创建或获取对应的分组
    if (node.title && node.title !== '') {
      // 检查分组是否已存在
      let group = context.existingGroups.find(g => g.name === node.title);

      if (!group) {
        // 检查是否已经在本次导入中添加过
        group = context.groupsToAdd.find(g => g.name === node.title);
      }

      if (!group) {
        // 收集新增分组而不是立即写入
        const maxOrder = Math.max(
          ...context.existingGroups.map(g => g.order),
          ...context.groupsToAdd.map(g => g.order),
          0
        );
        group = {
          id: generateId(),
          name: node.title,
          order: maxOrder + 1,
          createdAt: Date.now(),
        };
        context.groupsToAdd.push(group);
      }

      currentGroupId = group.id;
      groupIdMap.set(node.id, currentGroupId);
    }

    // 递归处理子节点
    for (const child of node.children) {
      const result = await traverseBookmarks(child, groupIdMap, currentGroupId, context);
      imported += result.imported;
      skipped += result.skipped;
    }
  }

  return { imported, skipped };
}

/**
 * 导入浏览器书签 - 优化版：批量处理减少写入次数
 */
export async function importBookmarks(): Promise<ImportResult> {
  try {
    // 获取书签树
    const bookmarkTree = await chrome.bookmarks.getTree();
    
    if (!bookmarkTree || bookmarkTree.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        error: '无法获取书签数据',
      };
    }

    // 获取现有数据
    const currentData = await getStorageData();
    
    // 初始化上下文
    const context: ImportContext = {
      importedUrls: new Set(),
      pagesToAdd: [],
      pagesToUpdate: new Map(),
      groupsToAdd: [],
      existingPages: currentData.pages.map(p => ({
        id: p.id,
        url: p.url,
        groups: [...p.groups],
      })),
      existingGroups: [...currentData.groups],
    };

    const groupIdMap = new Map<string, string>();
    let totalImported = 0;
    let totalSkipped = 0;

    // 遍历所有根节点，收集变更
    for (const rootNode of bookmarkTree) {
      if (rootNode.children) {
        for (const child of rootNode.children) {
          const result = await traverseBookmarks(child, groupIdMap, 'default', context);
          totalImported += result.imported;
          totalSkipped += result.skipped;
        }
      }
    }

    // 只有在有变更时才执行写入
    if (context.groupsToAdd.length > 0 || context.pagesToAdd.length > 0 || context.pagesToUpdate.size > 0) {
      // 添加小延迟避免配额
      await delay(100);
      
      // 构建新的数据
      const newData: StorageData = {
        ...currentData,
        // 添加新分组
        groups: [...currentData.groups, ...context.groupsToAdd],
        // 添加新页面
        pages: [
          ...currentData.pages,
          ...context.pagesToAdd,
        ],
      };

      // 应用页面更新
      context.pagesToUpdate.forEach((updates, pageId) => {
        const index = newData.pages.findIndex(p => p.id === pageId);
        if (index !== -1) {
          newData.pages[index] = {
            ...newData.pages[index],
            ...updates,
          };
        }
      });

      // 一次性保存所有变更
      const success = await setStorageData(newData);
      if (!success) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: totalImported + totalSkipped,
          error: '保存数据失败',
        };
      }
    }

    return {
      success: true,
      importedCount: totalImported,
      skippedCount: totalSkipped,
    };
  } catch (error) {
    console.error('导入书签失败:', error);
    return {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 获取书签树
 */
export async function getBookmarkTree(): Promise<BookmarkNode[]> {
  try {
    const bookmarkTree = await chrome.bookmarks.getTree();
    return bookmarkTree || [];
  } catch (error) {
    console.error('获取书签树失败:', error);
    return [];
  }
}

/**
 * 选择性导入书签
 */
export async function importSelectedBookmarks(selectedIds: Set<string>): Promise<ImportResult> {
  try {
    const bookmarkTree = await chrome.bookmarks.getTree();
    
    if (!bookmarkTree || bookmarkTree.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        error: '无法获取书签数据',
      };
    }

    const currentData = await getStorageData();
    
    const context: ImportContext = {
      importedUrls: new Set(),
      pagesToAdd: [],
      pagesToUpdate: new Map(),
      groupsToAdd: [],
      existingPages: currentData.pages.map(p => ({
        id: p.id,
        url: p.url,
        groups: [...p.groups],
      })),
      existingGroups: [...currentData.groups],
    };

    const groupIdMap = new Map<string, string>();
    let totalImported = 0;
    let totalSkipped = 0;

    function hasSelectedChildren(node: BookmarkNode): boolean {
      if (node.url && selectedIds.has(node.id)) {
        return true;
      }
      if (node.children) {
        return node.children.some(child => hasSelectedChildren(child));
      }
      return false;
    }

    async function traverseAndImport(
      node: BookmarkNode,
      parentGroupId: string = 'default'
    ): Promise<{ imported: number; skipped: number }> {
      let imported = 0;
      let skipped = 0;

      if (node.url) {
        if (selectedIds.has(node.id)) {
          try {
            const isAlreadyProcessed = Array.from(context.importedUrls).some(processedUrl => 
              isSamePage(processedUrl, node.url)
            );

            if (isAlreadyProcessed) {
              skipped++;
            } else {
              const existingPage = context.existingPages.find(p => 
                isSamePage(p.url, node.url)
              );

              if (existingPage) {
                if (!existingPage.groups.includes(parentGroupId)) {
                  const currentUpdates = context.pagesToUpdate.get(existingPage.id) || {};
                  const newGroups = [...existingPage.groups, parentGroupId];
                  context.pagesToUpdate.set(existingPage.id, {
                    ...currentUpdates,
                    groups: newGroups,
                    updatedAt: Date.now(),
                  });
                  existingPage.groups = newGroups;
                  imported++;
                } else {
                  skipped++;
                }
              } else {
                const newPage: Page = {
                  id: generateId(),
                  url: node.url,
                  title: node.title || node.url,
                  favicon: getFaviconUrl(node.url),
                  tags: [],
                  groups: [parentGroupId],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                
                context.pagesToAdd.push(newPage);
                imported++;
                context.importedUrls.add(node.url);
                context.existingPages.push({
                  id: newPage.id,
                  url: newPage.url,
                  groups: newPage.groups,
                });
              }
            }
          } catch {
            skipped++;
          }
        }
      }

      if (node.children && node.children.length > 0) {
        let currentGroupId = parentGroupId;

        if (node.title && node.title !== '' && hasSelectedChildren(node)) {
          let group = context.existingGroups.find(g => g.name === node.title);
          
          if (!group) {
            group = context.groupsToAdd.find(g => g.name === node.title);
          }

          if (!group) {
            const maxOrder = Math.max(
              ...context.existingGroups.map(g => g.order),
              ...context.groupsToAdd.map(g => g.order),
              0
            );
            group = {
              id: generateId(),
              name: node.title,
              order: maxOrder + 1,
              createdAt: Date.now(),
            };
            context.groupsToAdd.push(group);
          }

          currentGroupId = group.id;
          groupIdMap.set(node.id, currentGroupId);
        }

        for (const child of node.children) {
          const result = await traverseAndImport(child, currentGroupId);
          imported += result.imported;
          skipped += result.skipped;
        }
      }

      return { imported, skipped };
    }

    for (const rootNode of bookmarkTree) {
      if (rootNode.children) {
        for (const child of rootNode.children) {
          const result = await traverseAndImport(child, 'default');
          totalImported += result.imported;
          totalSkipped += result.skipped;
        }
      }
    }

    if (context.groupsToAdd.length > 0 || context.pagesToAdd.length > 0 || context.pagesToUpdate.size > 0) {
      await delay(100);
      
      const newData: StorageData = {
        ...currentData,
        groups: [...currentData.groups, ...context.groupsToAdd],
        pages: [
          ...currentData.pages,
          ...context.pagesToAdd,
        ],
      };

      context.pagesToUpdate.forEach((updates, pageId) => {
        const index = newData.pages.findIndex(p => p.id === pageId);
        if (index !== -1) {
          newData.pages[index] = {
            ...newData.pages[index],
            ...updates,
          };
        }
      });

      const success = await setStorageData(newData);
      if (!success) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: totalImported + totalSkipped,
          error: '保存数据失败',
        };
      }
    }

    return {
      success: true,
      importedCount: totalImported,
      skippedCount: totalSkipped,
    };
  } catch (error) {
    console.error('导入书签失败:', error);
    return {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
