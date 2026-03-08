import type { Page } from '@/types'

export function validateUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

export function validatePage(page: Page): boolean {
  if (!validateUrl(page.url)) return false
  if (!page.title || page.title.trim() === '') return false
  return true
}
