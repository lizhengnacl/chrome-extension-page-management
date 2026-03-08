import { useCallback } from 'react'
import type { Group } from '@/types'
import { useStorage } from './useStorage'
import { usePages } from './usePages'

export function useGroups() {
  const { data, saveGroups } = useStorage()
  const { pages, updatePage } = usePages()

  const groups = data?.groups || []

  const addGroup = useCallback(async (name: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      pageIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const newGroups = [...groups, newGroup]
    await saveGroups(newGroups)
  }, [groups, saveGroups])

  const updateGroup = useCallback(async (id: string, updates: Partial<Group>) => {
    const newGroups = groups.map(group =>
      group.id === id ? { ...group, ...updates, updatedAt: Date.now() } : group
    )
    await saveGroups(newGroups)
  }, [groups, saveGroups])

  const deleteGroup = useCallback(async (id: string) => {
    const newGroups = groups.filter(group => group.id !== id)
    await saveGroups(newGroups)

    const pagesInGroup = pages.filter(page => page.groups.includes(id))
    for (const page of pagesInGroup) {
      await updatePage(page.id, {
        groups: page.groups.filter(g => g !== id)
      })
    }
  }, [groups, saveGroups, pages, updatePage])

  const getGroupById = useCallback((id: string) => {
    return groups.find(group => group.id === id)
  }, [groups])

  const addPageToGroup = useCallback(async (groupId: string, pageId: string) => {
    const group = getGroupById(groupId)
    if (!group) return

    const newGroups = groups.map(g =>
      g.id === groupId
        ? { ...g, pageIds: [...g.pageIds, pageId], updatedAt: Date.now() }
        : g
    )
    await saveGroups(newGroups)

    const page = pages.find(p => p.id === pageId)
    if (page && !page.groups.includes(groupId)) {
      await updatePage(pageId, {
        groups: [...page.groups, groupId]
      })
    }
  }, [groups, saveGroups, getGroupById, pages, updatePage])

  const removePageFromGroup = useCallback(async (groupId: string, pageId: string) => {
    const newGroups = groups.map(g =>
      g.id === groupId
        ? { ...g, pageIds: g.pageIds.filter(id => id !== pageId), updatedAt: Date.now() }
        : g
    )
    await saveGroups(newGroups)

    const page = pages.find(p => p.id === pageId)
    if (page) {
      await updatePage(pageId, {
        groups: page.groups.filter(g => g !== groupId)
      })
    }
  }, [groups, saveGroups, pages, updatePage])

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    addPageToGroup,
    removePageFromGroup
  }
}
