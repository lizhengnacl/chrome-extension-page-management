import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Newtab } from './Newtab'

vi.mock('@/hooks/usePages', () => ({
  usePages: vi.fn()
}))

vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn()
}))

vi.mock('@/hooks/useGroups', () => ({
  useGroups: vi.fn()
}))

vi.mock('@/pages/ShortcutGrid', () => ({
  ShortcutGrid: ({ pages, onPageClick }: any) => (
    <div data-testid="shortcut-grid">
      {pages.map((page: any) => (
        <button key={page.id} onClick={() => onPageClick(page)}>
          {page.title}
        </button>
      ))}
    </div>
  )
}))

vi.mock('@/pages/Sidebar', () => ({
  Sidebar: ({ tags, groups, selectedTagId, onTagSelect, onGroupSelect, onOpenGroup }: any) => (
    <div data-testid="sidebar">
      <div>{tags.map((tag: any) => (
        <button key={tag.id} onClick={() => onTagSelect(tag.id)}>
          {tag.name}
        </button>
      ))}</div>
      <div>{groups.map((group: any) => (
        <button key={group.id} onClick={() => onGroupSelect(group.id)}>
          {group.name}
        </button>
      ))}</div>
      <div>{groups.map((group: any) => (
        <button key={`open-${group.id}`} onClick={() => onOpenGroup(group)}>
          打开{group.name}
        </button>
      ))}</div>
    </div>
  )
}))

vi.mock('@/pages/PageList', () => ({
  PageList: ({ pages, tags, selectedTagId, selectedGroupId, onEdit, onDelete, onToggleStar }: any) => (
    <div data-testid="page-list">
      <div>筛选标签: {selectedTagId || '无'}</div>
      <div>筛选分组: {selectedGroupId || '无'}</div>
      {pages.map((page: any) => (
        <div key={page.id}>
          <span>{page.title}</span>
          <button onClick={() => onEdit(page)}>编辑</button>
          <button onClick={() => onDelete(page.id)}>删除</button>
          <button onClick={() => onToggleStar(page.id)}>星标</button>
        </div>
      ))}
    </div>
  )
}))

const mockUsePages = vi.hoisted(() => vi.fn())
const mockUseTags = vi.hoisted(() => vi.fn())
const mockUseGroups = vi.hoisted(() => vi.fn())

import { usePages } from '@/hooks/usePages'
import { useTags } from '@/hooks/useTags'
import { useGroups } from '@/hooks/useGroups'

vi.mocked(usePages).mockImplementation(mockUsePages)
vi.mocked(useTags).mockImplementation(mockUseTags)
vi.mocked(useGroups).mockImplementation(mockUseGroups)

describe('Newtab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUsePages.mockReturnValue({
      pages: [],
      getStarredPages: vi.fn().mockReturnValue([]),
      getPagesByGroup: vi.fn().mockReturnValue([]),
      updatePage: vi.fn(),
      deletePage: vi.fn()
    })
    
    mockUseTags.mockReturnValue({
      tags: []
    })
    
    mockUseGroups.mockReturnValue({
      groups: []
    })
    
    global.chrome = {
      tabs: {
        create: vi.fn().mockImplementation(() => Promise.resolve({} as any))
      }
    } as any
  })

  it('应该渲染 Newtab 组件', () => {
    render(<Newtab />)
    expect(screen.getByTestId('shortcut-grid')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('page-list')).toBeInTheDocument()
  })

  it('应该只显示星标页面在 ShortcutGrid 中', () => {
    const starredPages = [
      { id: '1', title: '星标页面1', isStarred: true },
      { id: '2', title: '星标页面2', isStarred: true }
    ]
    const allPages = [
      ...starredPages,
      { id: '3', title: '普通页面', isStarred: false }
    ]
    
    mockUsePages.mockReturnValue({
      pages: allPages,
      getStarredPages: vi.fn().mockReturnValue(starredPages),
      getPagesByGroup: vi.fn().mockReturnValue([]),
      updatePage: vi.fn(),
      deletePage: vi.fn()
    })
    
    render(<Newtab />)
    
    const shortcutGrid = screen.getByTestId('shortcut-grid')
    expect(shortcutGrid).toContainHTML('星标页面1')
    expect(shortcutGrid).toContainHTML('星标页面2')
    expect(shortcutGrid).not.toContainHTML('普通页面')
  })

  it('点击标签时应该更新筛选状态', () => {
    const tags = [
      { id: 'tag1', name: '标签1' }
    ]
    
    mockUseTags.mockReturnValue({
      tags
    })
    
    render(<Newtab />)
    
    fireEvent.click(screen.getByText('标签1'))
    
    expect(screen.getByText('筛选标签: tag1')).toBeInTheDocument()
  })

  it('点击分组时应该更新筛选状态', () => {
    const groups = [
      { id: 'group1', name: '分组1' }
    ]
    
    mockUseGroups.mockReturnValue({
      groups
    })
    
    render(<Newtab />)
    
    fireEvent.click(screen.getByText('分组1'))
    
    expect(screen.getByText('筛选分组: group1')).toBeInTheDocument()
  })

  it('点击星标页面时应该打开新标签页', () => {
    const starredPages = [
      { id: '1', title: '星标页面', url: 'https://example.com', isStarred: true }
    ]
    
    mockUsePages.mockReturnValue({
      pages: starredPages,
      getStarredPages: vi.fn().mockReturnValue(starredPages),
      getPagesByGroup: vi.fn().mockReturnValue([]),
      updatePage: vi.fn(),
      deletePage: vi.fn()
    })
    
    render(<Newtab />)
    
    const shortcutGrid = screen.getByTestId('shortcut-grid')
    const button = shortcutGrid.querySelector('button') as HTMLElement
    fireEvent.click(button)
    
    expect(global.chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example.com' })
  })

  it('点击分组的打开按钮时应该打开分组内的所有页面', () => {
    const pages = [
      { id: '1', title: '页面1', url: 'https://example1.com', groups: ['group1'], isStarred: false }
    ]
    const groups = [
      { id: 'group1', name: '分组1' }
    ]
    
    mockUsePages.mockReturnValue({
      pages,
      getStarredPages: vi.fn().mockReturnValue([]),
      getPagesByGroup: vi.fn().mockReturnValue(pages),
      updatePage: vi.fn(),
      deletePage: vi.fn()
    })
    
    mockUseGroups.mockReturnValue({
      groups
    })
    
    render(<Newtab />)
    
    fireEvent.click(screen.getByText('打开分组1'))
    
    expect(global.chrome.tabs.create).toHaveBeenCalledWith({ url: 'https://example1.com' })
  })

  it('点击星标按钮时应该切换星标状态', () => {
    const pages = [
      { id: '1', title: '页面1', isStarred: false }
    ]
    
    const mockUpdatePage = vi.fn()
    
    mockUsePages.mockReturnValue({
      pages,
      getStarredPages: vi.fn().mockReturnValue([]),
      updatePage: mockUpdatePage,
      deletePage: vi.fn()
    })
    
    render(<Newtab />)
    
    fireEvent.click(screen.getByText('星标'))
    
    expect(mockUpdatePage).toHaveBeenCalledWith('1', { isStarred: true })
  })

  it('点击删除按钮时应该删除页面', () => {
    const pages = [
      { id: '1', title: '页面1', isStarred: false }
    ]
    
    const mockDeletePage = vi.fn()
    
    mockUsePages.mockReturnValue({
      pages,
      getStarredPages: vi.fn().mockReturnValue([]),
      updatePage: vi.fn(),
      deletePage: mockDeletePage
    })
    
    render(<Newtab />)
    
    fireEvent.click(screen.getByText('删除'))
    
    expect(mockDeletePage).toHaveBeenCalledWith('1')
  })
})
