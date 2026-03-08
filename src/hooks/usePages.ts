import { useCallback } from 'react'
import type { Page } from '@/types'
import { useStorage } from './useStorage'

export function usePages() {
  const { data, savePages } = useStorage()

  const pages = data?.pages || []

  const addPage = useCallback(async (page: Page) => {
    const newPages = [...pages, page]
    await savePages(newPages)
  }, [pages, savePages])

  const updatePage = useCallback(async (id: string, updates: Partial<Page>) => {
    const newPages = pages.map(page =>
      page.id === id ? { ...page, ...updates, updatedAt: Date.now() } : page
    )
    await savePages(newPages)
  }, [pages, savePages])

  const deletePage = useCallback(async (id: string) => {
    const newPages = pages.filter(page => page.id !== id)
    await savePages(newPages)
  }, [pages, savePages])

  const getPageById = useCallback((id: string) => {
    return pages.find(page => page.id === id)
  }, [pages])

  const getStarredPages = useCallback(() => {
    return pages.filter(page => page.isStarred)
  }, [pages])

  const getPagesByTag = useCallback((tagId: string) => {
    return pages.filter(page => page.tags.includes(tagId))
  }, [pages])

  const getPagesByGroup = useCallback((groupId: string) => {
    return pages.filter(page => page.groups.includes(groupId))
  }, [pages])

  return {
    pages,
    addPage,
    updatePage,
    deletePage,
    getPageById,
    getStarredPages,
    getPagesByTag,
    getPagesByGroup
  }
}
