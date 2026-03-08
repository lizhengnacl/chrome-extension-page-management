import { describe, it, expect } from 'vitest'
import { getFaviconUrl, getDefaultFavicon } from './favicon'

describe('favicon', () => {
  describe('getDefaultFavicon', () => {
    it('should return a default favicon URL', () => {
      const favicon = getDefaultFavicon()
      expect(typeof favicon).toBe('string')
      expect(favicon).toContain('data:image')
    })
  })

  describe('getFaviconUrl', () => {
    it('should return Google favicon service URL for valid domain', () => {
      const url = 'https://example.com/path'
      const favicon = getFaviconUrl(url)
      expect(favicon).toContain('google.com')
      expect(favicon).toContain('example.com')
    })

    it('should return default favicon for invalid URL', () => {
      const defaultFavicon = getDefaultFavicon()
      const favicon = getFaviconUrl('invalid-url')
      expect(favicon).toBe(defaultFavicon)
    })
  })
})
