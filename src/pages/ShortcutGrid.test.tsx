import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ShortcutGrid } from './ShortcutGrid'
import type { Page } from '@/types'

const mockStarredPages: Page[] = [
  {
    id: '1',
    url: 'https://example.com',
    title: 'Example Page',
    favicon: 'https://example.com/favicon.ico',
    tags: ['tag1'],
    groups: [],
    isStarred: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    url: 'https://github.com',
    title: 'GitHub',
    favicon: 'https://github.com/favicon.ico',
    tags: ['tag2'],
    groups: [],
    isStarred: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '3',
    url: 'https://stackoverflow.com',
    title: 'Stack Overflow',
    favicon: 'https://stackoverflow.com/favicon.ico',
    tags: [],
    groups: [],
    isStarred: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

describe('ShortcutGrid', () => {
  it('should render starred pages as shortcuts', () => {
    render(<ShortcutGrid pages={mockStarredPages} onPageClick={() => {}} />)
    
    expect(screen.getByText('Example Page')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
    expect(screen.getByText('Stack Overflow')).toBeTruthy()
  })

  it('should call onPageClick when a shortcut is clicked', () => {
    const onPageClick = vi.fn()
    render(<ShortcutGrid pages={mockStarredPages} onPageClick={onPageClick} />)
    
    fireEvent.click(screen.getByText('GitHub'))
    expect(onPageClick).toHaveBeenCalledWith(mockStarredPages[1])
  })

  it('should display empty state when there are no starred pages', () => {
    render(<ShortcutGrid pages={[]} onPageClick={() => {}} />)
    
    expect(screen.getByText('暂无星标页面')).toBeTruthy()
  })

  it('should render favicons for each shortcut', () => {
    render(<ShortcutGrid pages={mockStarredPages} onPageClick={() => {}} />)
    
    const images = document.querySelectorAll('img')
    expect(images.length).toBe(3)
  })
})
