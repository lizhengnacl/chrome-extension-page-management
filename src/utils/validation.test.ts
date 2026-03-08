import { describe, it, expect } from 'vitest'
import { validateUrl, validatePage } from './validation'
import type { Page } from '@/types'

describe('validation', () => {
  describe('validateUrl', () => {
    it('should return true for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://example.com')).toBe(true)
      expect(validateUrl('https://sub.example.com/path?query=1')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(validateUrl('')).toBe(false)
      expect(validateUrl('not a url')).toBe(false)
      expect(validateUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('validatePage', () => {
    it('should return true for valid Page objects', () => {
      const validPage: Page = {
        id: '1',
        url: 'https://example.com',
        title: 'Example',
        favicon: 'https://example.com/favicon.ico',
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      expect(validatePage(validPage)).toBe(true)
    })

    it('should return false for Page with invalid URL', () => {
      const invalidPage: Page = {
        id: '1',
        url: 'invalid url',
        title: 'Example',
        favicon: 'https://example.com/favicon.ico',
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      expect(validatePage(invalidPage)).toBe(false)
    })

    it('should return false for Page with empty title', () => {
      const invalidPage: Page = {
        id: '1',
        url: 'https://example.com',
        title: '',
        favicon: 'https://example.com/favicon.ico',
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      expect(validatePage(invalidPage)).toBe(false)
    })
  })
})
