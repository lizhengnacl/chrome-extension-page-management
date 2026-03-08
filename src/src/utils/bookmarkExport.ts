/**
 * 浏览器书签导出工具
 * 负责将插件数据导出到 Chrome 书签
 */

import { pageStorage, groupStorage } from '../storage';
import type { Page, Group } from '../types';

interface ExportResult {
  success: boolean;
  exportedCount: number;
  error?: string;
}

/**
 * 递归创建书签文件夹和书签
 */
async function createBookmarkTree(
  parentId: string,
  group: Group,
  pages: Page[]
): Promise<number> {
  let exportedCount = 0;

  try {
    // 创建文件夹
    const folder = await chrome.bookmarks.create({
      parentId,
      title: group.name,
    });

    // 为该分组下的每个页面创建书签
    for (const page of pages) {
      if (page.groups.includes(group.id)) {
        try {
          await chrome.bookmarks.create({
            parentId: folder.id,
            title: page.title,
            url: page.url,
          });
          exportedCount++;
        } catch {
          // 忽略单个书签创建失败
        }
      }
    }
  } catch {
    // 文件夹创建失败，尝试直接在父级创建书签
    for (const page of pages) {
      if (page.groups.includes(group.id)) {
        try {
          await chrome.bookmarks.create({
            parentId,
            title: `${group.name} - ${page.title}`,
            url: page.url,
          });
          exportedCount++;
        } catch {
          // 忽略单个书签创建失败
        }
      }
    }
  }

  return exportedCount;
}

/**
 * 导出到浏览器书签
 */
export async function exportBookmarks(): Promise<ExportResult> {
  try {
    const [pages, groups] = await Promise.all([
      pageStorage.getAll(),
      groupStorage.getAll(),
    ]);

    if (pages.length === 0) {
      return {
        success: false,
        exportedCount: 0,
        error: '没有可导出的页面',
      };
    }

    // 获取书签根节点
    const bookmarkTree = await chrome.bookmarks.getTree();
    if (!bookmarkTree || bookmarkTree.length === 0) {
      return {
        success: false,
        exportedCount: 0,
        error: '无法获取书签根节点',
      };
    }

    const rootNode = bookmarkTree[0];
    if (!rootNode.children || rootNode.children.length === 0) {
      return {
        success: false,
        exportedCount: 0,
        error: '无法找到书签根目录',
      };
    }

    // 找到其他书签文件夹作为目标
    let targetFolder = rootNode.children.find(
      (child) => child.title === '其他书签' || child.title === 'Other Bookmarks'
    );

    // 如果找不到，使用第一个文件夹
    if (!targetFolder) {
      targetFolder = rootNode.children[0];
    }

    // 创建导出根文件夹
    const exportRoot = await chrome.bookmarks.create({
      parentId: targetFolder.id,
      title: `页面管理器导出 - ${new Date().toLocaleDateString('zh-CN')}`,
    });

    let totalExported = 0;

    // 按分组导出
    for (const group of groups) {
      const count = await createBookmarkTree(exportRoot.id, group, pages);
      totalExported += count;
    }

    return {
      success: true,
      exportedCount: totalExported,
    };
  } catch (error) {
    console.error('导出书签失败:', error);
    return {
      success: false,
      exportedCount: 0,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
