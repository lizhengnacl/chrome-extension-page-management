export interface Page {
  id: string
  url: string
  title: string
  favicon: string
  tags: string[]
  groups: string[]
  isStarred: boolean
  createdAt: number
  updatedAt: number
}

export interface Tag {
  id: string
  name: string
  parentId: string | null
  children: string[]
  createdAt: number
}

export interface Group {
  id: string
  name: string
  pageIds: string[]
  createdAt: number
  updatedAt: number
}

export interface AppState {
  pages: Page[]
  tags: Tag[]
  groups: Group[]
  isInitialized: boolean
}

export interface StorageData {
  version: string
  pages: Page[]
  tags: Tag[]
  groups: Group[]
}
