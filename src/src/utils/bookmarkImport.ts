/**
 * 浏览器书签导入工具
 * 负责从 Chrome 书签导入数据到插件
 */

import { pageStorage, groupStorage } from '../storage';
import { getFaviconUrl } from '../utils';

interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  error?: string;
}

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  dateAdded?: number;
}

/**
 * 递归遍历书签树
 */
async function traverseBookmarks(
  node: BookmarkNode,
  groupIdMap: Map<string, string>,
  parentGroupId: string = 'default'
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  // 如果是书签（有 URL）
  if (node.url) {
    try {
      const result = await pageStorage.add({
        url: node.url,
        title: node.title || node.url,
        favicon: getFaviconUrl(node.url),
        tags: [],
        groups: [parentGroupId],
      });

      if (result) {
        imported++;
      } else {
        skipped++;
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
      const existingGroups = await groupStorage.getAll();
      let group = existingGroups.find(g => g.name === node.title);

      if (!group) {
        group = await groupStorage.add(node.title);
      }

      currentGroupId = group.id;
      groupIdMap.set(node.id, currentGroupId);
    }

    // 递归处理子节点
    for (const child of node.children) {
      const result = await traverseBookmarks(child, groupIdMap, currentGroupId);
      imported += result.imported;
      skipped += result.skipped;
    }
  }

  return { imported, skipped };
}

/**
 * 导入浏览器书签
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

    const groupIdMap = new Map<string, string>();
    let totalImported = 0;
    let totalSkipped = 0;

    // 遍历所有根节点
    for (const rootNode of bookmarkTree) {
      if (rootNode.children) {
        for (const child of rootNode.children) {
          const result = await traverseBookmarks(child, groupIdMap);
          totalImported += result.imported;
          totalSkipped += result.skipped;
        }
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
