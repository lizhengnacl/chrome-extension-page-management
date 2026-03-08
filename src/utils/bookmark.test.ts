import { describe, it, expect, vi } from 'vitest'
import { importFromBookmarks } from './bookmark'
import type { Page } from '@/types'
import { getFaviconUrl } from './favicon'

vi.mock('./favicon', () => ({
  getFaviconUrl: vi.fn(() => 'test-favicon')
}))

const mockBookmarks: chrome.bookmarks.BookmarkTreeNode[] = [
  {
    id: '1',
    title: 'Example',
    url: 'https://example.com',
    dateAdded: Date.now()
  },
  {
    id: '2',
    title: 'Folder',
    children: [
      {
        id: '3',
        title: 'Nested',
        url: 'https://nested.com',
        dateAdded: Date.now()
      }
    ]
  }
]

vi.stubGlobal('chrome', {
  bookmarks: {
    getTree: vi.fn((callback) => {
      callback(mockBookmarks)
    })
  }
})

describe('bookmark', () => {
  describe('importFromBookmarks', () => {
    it('should import bookmarks as Page objects', async () => {
      const pages: Page[] = await importFromBookmarks()
      expect(pages.length).toBeGreaterThan(0)
      expect(pages[0].url).toBe('https://example.com')
      expect(getFaviconUrl).toHaveBeenCalled()
    })
  })
})
