import React, { useState, useCallback } from 'react'
import { usePages } from '@/hooks/usePages'
import { useTags } from '@/hooks/useTags'
import { useGroups } from '@/hooks/useGroups'
import { ShortcutGrid } from './ShortcutGrid'
import { Sidebar } from './Sidebar'
import { PageList } from './PageList'
import type { Page, Group } from '@/types'

export const Newtab: React.FC = () => {
  const { pages, getStarredPages, updatePage, deletePage, getPagesByGroup } = usePages()
  const { tags } = useTags()
  const { groups } = useGroups()
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const handlePageClick = useCallback((page: Page) => {
    try {
      chrome.tabs.create({ url: page.url })
    } catch (error) {
      console.error('Failed to open page:', error)
    }
  }, [])

  const handleTagSelect = useCallback((tagId: string | null) => {
    setSelectedTagId(tagId)
  }, [])

  const handleGroupSelect = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId)
  }, [])

  const handleOpenGroup = useCallback((group: Group) => {
    try {
      const pagesInGroup = getPagesByGroup(group.id)
      pagesInGroup.forEach((page) => {
        chrome.tabs.create({ url: page.url })
      })
    } catch (error) {
      console.error('Failed to open group pages:', error)
    }
  }, [getPagesByGroup])

  const handleEdit = useCallback((page: Page) => {
    console.log('Edit page:', page)
  }, [])

  const handleDelete = useCallback(async (pageId: string) => {
    try {
      await deletePage(pageId)
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }, [deletePage])

  const handleToggleStar = useCallback(async (pageId: string) => {
    try {
      const page = pages.find(p => p.id === pageId)
      if (page) {
        await updatePage(pageId, { isStarred: !page.isStarred })
      }
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }, [pages, updatePage])

  const starredPages = getStarredPages()

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F3F4F6' }}>
      <Sidebar
        tags={tags}
        groups={groups}
        selectedTagId={selectedTagId}
        onTagSelect={handleTagSelect}
        onGroupSelect={handleGroupSelect}
        onOpenGroup={handleOpenGroup}
      />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: 16, backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#111827' }}>
            快捷方式
          </h1>
        </div>
        <ShortcutGrid
          pages={starredPages}
          onPageClick={handlePageClick}
        />
        <div style={{ padding: 16, backgroundColor: 'white', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', marginTop: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#111827' }}>
            所有页面
          </h2>
        </div>
        <PageList
          pages={pages}
          selectedTagId={selectedTagId}
          selectedGroupId={selectedGroupId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStar={handleToggleStar}
        />
      </div>
    </div>
  )
}
