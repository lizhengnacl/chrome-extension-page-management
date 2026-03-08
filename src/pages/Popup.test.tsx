import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Popup } from './Popup'

vi.mock('@/hooks/usePages', () => ({
  usePages: vi.fn(() => ({
    pages: [],
    addPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn()
  }))
}))

vi.mock('@/hooks/useTags', () => ({
  useTags: vi.fn(() => ({
    tags: [],
    addTag: vi.fn(),
    deleteTag: vi.fn()
  }))
}))

vi.mock('@/hooks/useGroups', () => ({
  useGroups: vi.fn(() => ({
    groups: [],
    addGroup: vi.fn(),
    deleteGroup: vi.fn()
  }))
}))

vi.mock('@/hooks/useStorage', () => ({
  useStorage: vi.fn(() => ({
    isLoading: false,
    data: { pages: [], tags: [], groups: [] },
    savePages: vi.fn(),
    saveTags: vi.fn(),
    saveGroups: vi.fn()
  }))
}))

describe('Popup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the popup title', () => {
    render(<Popup />)
    expect(screen.getByText('页面管理')).toBeTruthy()
  })

  it('renders the navigation tabs', () => {
    render(<Popup />)
    const buttons = screen.getAllByRole('button')
    const tabTexts = buttons.map(btn => btn.textContent)
    expect(tabTexts).toContain('添加页面')
    expect(tabTexts).toContain('标签')
    expect(tabTexts).toContain('分组')
  })

  it('shows AddPageForm by default', () => {
    render(<Popup />)
    expect(screen.getByPlaceholderText('https://example.com')).toBeTruthy()
  })

  it('switches to TagManager when Tags tab is clicked', () => {
    render(<Popup />)
    const tagsButtons = screen.getAllByText('标签')
    fireEvent.click(tagsButtons[0])
    expect(screen.getByText('标签管理')).toBeTruthy()
  })

  it('switches to GroupManager when Groups tab is clicked', () => {
    render(<Popup />)
    const groupsButtons = screen.getAllByText('分组')
    fireEvent.click(groupsButtons[0])
    expect(screen.getByText('分组管理')).toBeTruthy()
  })

  it('switches back to AddPageForm when Add tab is clicked', () => {
    render(<Popup />)
    const tagsButtons = screen.getAllByText('标签')
    fireEvent.click(tagsButtons[0])
    const addButtons = screen.getAllByText('添加页面')
    fireEvent.click(addButtons[0])
    expect(screen.getByPlaceholderText('https://example.com')).toBeTruthy()
  })
})
