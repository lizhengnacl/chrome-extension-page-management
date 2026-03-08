import { useState, useEffect, useCallback } from 'react'
import type { StorageData, Page, Tag, Group } from '@/types'
import {
  getStorageData,
  saveStorageData
} from '@/utils/storage'

export function useStorage() {
  const [data, setData] = useState<StorageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const storageData = await getStorageData()
      setData(storageData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveData = useCallback(async (newData: StorageData) => {
    try {
      setError(null)
      await saveStorageData(newData)
      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存数据失败')
    }
  }, [])

  const savePages = useCallback(async (pages: Page[]) => {
    if (!data) return
    const newData = { ...data, pages }
    await saveData(newData)
  }, [data, saveData])

  const saveTags = useCallback(async (tags: Tag[]) => {
    if (!data) return
    const newData = { ...data, tags }
    await saveData(newData)
  }, [data, saveData])

  const saveGroups = useCallback(async (groups: Group[]) => {
    if (!data) return
    const newData = { ...data, groups }
    await saveData(newData)
  }, [data, saveData])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    loadData,
    saveData,
    savePages,
    saveTags,
    saveGroups
  }
}
