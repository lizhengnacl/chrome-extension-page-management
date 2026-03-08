import { useCallback } from 'react'
import type { Tag } from '@/types'
import { useStorage } from './useStorage'

export function useTags() {
  const { data, saveTags } = useStorage()

  const tags = data?.tags || []

  const addTag = useCallback(async (name: string, parentId: string | null) => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name,
      parentId,
      children: [],
      createdAt: Date.now()
    }
    const newTags = [...tags, newTag]
    if (parentId) {
      const updatedTags = newTags.map(t =>
        t.id === parentId
          ? { ...t, children: [...t.children, newTag.id] }
          : t
      )
      await saveTags(updatedTags)
    } else {
      await saveTags(newTags)
    }
  }, [tags, saveTags])

  const updateTag = useCallback(async (id: string, updates: Partial<Tag>) => {
    const newTags = tags.map(tag =>
      tag.id === id ? { ...tag, ...updates } : tag
    )
    await saveTags(newTags)
  }, [tags, saveTags])

  const deleteTag = useCallback(async (id: string) => {
    const tagToDelete = tags.find(t => t.id === id)
    if (!tagToDelete) return

    let newTags = tags.filter(tag => tag.id !== id)

    if (tagToDelete.parentId) {
      newTags = newTags.map(t =>
        t.id === tagToDelete.parentId
          ? { ...t, children: t.children.filter(childId => childId !== id) }
          : t
      )
    }

    const deleteChildrenRecursively = (parentId: string) => {
      const children = newTags.filter(t => t.parentId === parentId)
      children.forEach(child => {
        newTags = newTags.filter(t => t.id !== child.id)
        deleteChildrenRecursively(child.id)
      })
    }
    deleteChildrenRecursively(id)

    await saveTags(newTags)
  }, [tags, saveTags])

  const getTagById = useCallback((id: string) => {
    return tags.find(tag => tag.id === id)
  }, [tags])

  const getRootTags = useCallback(() => {
    return tags.filter(tag => tag.parentId === null)
  }, [tags])

  const getChildrenTags = useCallback((parentId: string) => {
    return tags.filter(tag => tag.parentId === parentId)
  }, [tags])

  return {
    tags,
    addTag,
    updateTag,
    deleteTag,
    getTagById,
    getRootTags,
    getChildrenTags
  }
}
