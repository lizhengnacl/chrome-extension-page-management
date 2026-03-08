import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PageList } from './PageList'
import type { Page, Tag } from '@/types'

const mockPages: Page[] = [
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
    tags: ['tag1', 'tag2'],
    groups: [],
    isStarred: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '3',
    url: 'https://stackoverflow.com',
    title: 'Stack Overflow',
    favicon: 'https://stackoverflow.com/favicon.ico',
    tags: ['tag2'],
    groups: [],
    isStarred: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

const mockTags: Tag[] = [
  {
    id: 'tag1',
    name: 'Work',
    parentId: null,
    children: [],
    createdAt: Date.now()
  },
  {
    id: 'tag2',
    name: 'Personal',
    parentId: null,
    children: [],
    createdAt: Date.now()
  }
]

describe('PageList', () => {
  it('should render all pages when no tag is selected', () => {
    render(
      <PageList 
        pages={mockPages}
        tags={mockTags}
        selectedTagId={null}
        selectedGroupId={null}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleStar={() => {}}
      />
    )
    
    expect(screen.getByText('Example Page')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
    expect(screen.getByText('Stack Overflow')).toBeTruthy()
  })

  it('should filter pages by selected tag', () => {
    render(
      <PageList 
        pages={mockPages}
        tags={mockTags}
        selectedTagId="tag1"
        selectedGroupId={null}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleStar={() => {}}
      />
    )
    
    expect(screen.getByText('Example Page')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
    expect(screen.queryByText('Stack Overflow')).not.toBeTruthy()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <PageList 
        pages={mockPages}
        tags={mockTags}
        selectedTagId={null}
        selectedGroupId={null}
        onEdit={onEdit}
        onDelete={() => {}}
        onToggleStar={() => {}}
      />
    )
    
    const editButtons = screen.getAllByTestId('edit-button')
    fireEvent.click(editButtons[0])
    expect(onEdit).toHaveBeenCalledWith(mockPages[0])
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(
      <PageList 
        pages={mockPages}
        tags={mockTags}
        selectedTagId={null}
        selectedGroupId={null}
        onEdit={() => {}}
        onDelete={onDelete}
        onToggleStar={() => {}}
      />
    )
    
    const deleteButtons = screen.getAllByTestId('delete-button')
    fireEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith(mockPages[0].id)
  })

  it('should call onToggleStar when star button is clicked', () => {
    const onToggleStar = vi.fn()
    render(
      <PageList 
        pages={mockPages}
        tags={mockTags}
        selectedTagId={null}
        selectedGroupId={null}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleStar={onToggleStar}
      />
    )
    
    const starButtons = screen.getAllByTestId('star-button')
    fireEvent.click(starButtons[0])
    expect(onToggleStar).toHaveBeenCalledWith(mockPages[0].id)
  })

  it('should display empty state when no pages match the filter', () => {
    render(
      <PageList 
        pages={[]}
        tags={mockTags}
        selectedTagId={null}
        selectedGroupId={null}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleStar={() => {}}
      />
    )
    
    expect(screen.getByText('暂无页面')).toBeTruthy()
  })
})
