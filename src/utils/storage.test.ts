import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStorageData,
  saveStorageData,
  updatePages,
  updateTags,
  updateGroups
} from './storage'
import type { StorageData, Page, Tag, Group } from '@/types'

const mockChromeStorage: Record<string, any> = {}

vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: vi.fn((keys, callback) => {
        const result: Record<string, any> = {}
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            if (mockChromeStorage[key]) result[key] = mockChromeStorage[key]
          })
        } else if (typeof keys === 'string') {
          if (mockChromeStorage[keys]) result[keys] = mockChromeStorage[keys]
        }
        callback(result)
      }),
      set: vi.fn((data, callback) => {
        Object.assign(mockChromeStorage, data)
        callback?.()
      })
    }
  }
})

describe('storage', () => {
  beforeEach(() => {
    Object.keys(mockChromeStorage).forEach(key => delete mockChromeStorage[key])
  })

  describe('getStorageData', () => {
    it('should return default data when no data exists', async () => {
      const data = await getStorageData()
      expect(data.pages).toEqual([])
      expect(data.tags).toEqual([])
      expect(data.groups).toEqual([])
    })

    it('should return saved data when data exists', async () => {
      const testData: StorageData = {
        version: '1.0',
        pages: [{
          id: '1',
          url: 'https://example.com',
          title: 'Test',
          favicon: '',
          tags: [],
          groups: [],
          isStarred: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }],
        tags: [],
        groups: []
      }
      mockChromeStorage['pageManagementData'] = JSON.stringify(testData)

      const data = await getStorageData()
      expect(data.pages.length).toBe(1)
    })
  })

  describe('saveStorageData', () => {
    it('should save data to storage', async () => {
      const testData: StorageData = {
        version: '1.0',
        pages: [],
        tags: [],
        groups: []
      }
      await saveStorageData(testData)
      expect(mockChromeStorage['pageManagementData']).toBeDefined()
    })
  })

  describe('updatePages', () => {
    it('should update pages in storage', async () => {
      const pages: Page[] = [{
        id: '1',
        url: 'https://example.com',
        title: 'Test',
        favicon: '',
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }]
      await updatePages(pages)
      const data = await getStorageData()
      expect(data.pages.length).toBe(1)
    })
  })

  describe('updateTags', () => {
    it('should update tags in storage', async () => {
      const tags: Tag[] = [{
        id: '1',
        name: 'Test',
        parentId: null,
        children: [],
        createdAt: Date.now()
      }]
      await updateTags(tags)
      const data = await getStorageData()
      expect(data.tags.length).toBe(1)
    })
  })

  describe('updateGroups', () => {
    it('should update groups in storage', async () => {
      const groups: Group[] = [{
        id: '1',
        name: 'Test',
        pageIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }]
      await updateGroups(groups)
      const data = await getStorageData()
      expect(data.groups.length).toBe(1)
    })
  })
})
