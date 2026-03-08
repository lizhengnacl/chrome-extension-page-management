import type { StorageData, Page, Tag, Group } from '@/types'

const STORAGE_KEY = 'pageManagementData'
const STORAGE_VERSION = '1.0'

export function getDefaultStorageData(): StorageData {
  return {
    version: STORAGE_VERSION,
    pages: [],
    tags: [],
    groups: []
  }
}

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(STORAGE_KEY, (result) => {
        if (result[STORAGE_KEY]) {
          try {
            const data = JSON.parse(result[STORAGE_KEY])
            resolve(data)
          } catch {
            resolve(getDefaultStorageData())
          }
        } else {
          resolve(getDefaultStorageData())
        }
      })
    } catch {
      resolve(getDefaultStorageData())
    }
  })
}

export async function saveStorageData(data: StorageData): Promise<void> {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.set({
        [STORAGE_KEY]: JSON.stringify(data)
      }, () => {
        resolve()
      })
    } catch {
      resolve()
    }
  })
}

export async function updatePages(pages: Page[]): Promise<void> {
  const data = await getStorageData()
  await saveStorageData({ ...data, pages })
}

export async function updateTags(tags: Tag[]): Promise<void> {
  const data = await getStorageData()
  await saveStorageData({ ...data, tags })
}

export async function updateGroups(groups: Group[]): Promise<void> {
  const data = await getStorageData()
  await saveStorageData({ ...data, groups })
}
