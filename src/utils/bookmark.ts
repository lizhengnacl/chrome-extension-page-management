import type { Page } from '@/types'
import { getFaviconUrl } from './favicon'

function extractBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[]): Page[] {
  const pages: Page[] = []
  const now = Date.now()

  nodes.forEach(node => {
    if (node.url) {
      pages.push({
        id: node.id,
        url: node.url,
        title: node.title || node.url,
        favicon: getFaviconUrl(node.url),
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: node.dateAdded || now,
        updatedAt: now
      })
    }
    if (node.children) {
      pages.push(...extractBookmarks(node.children))
    }
  })

  return pages
}

export async function importFromBookmarks(): Promise<Page[]> {
  return new Promise((resolve) => {
    try {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const pages = extractBookmarks(bookmarkTreeNodes)
        resolve(pages)
      })
    } catch {
      resolve([])
    }
  })
}
