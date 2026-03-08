import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from './Sidebar'
import type { Tag, Group } from '@/types'

const mockTags: Tag[] = [
  {
    id: '1',
    name: 'Work',
    parentId: null,
    children: ['2'],
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Design',
    parentId: '1',
    children: [],
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'Personal',
    parentId: null,
    children: [],
    createdAt: Date.now()
  }
]

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Morning Routine',
    pageIds: ['page1', 'page2'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    name: 'Work Resources',
    pageIds: ['page3'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

describe('Sidebar', () => {
  it('should render tags and groups sections', () => {
    render(
      <Sidebar 
        tags={mockTags}
        groups={mockGroups}
        selectedTagId={null}
        onTagSelect={() => {}}
        onGroupSelect={() => {}}
        onOpenGroup={() => {}}
      />
    )
    
    expect(screen.getByText('标签')).toBeTruthy()
    expect(screen.getByText('分组')).toBeTruthy()
  })

  it('should render TagTree component with tags', () => {
    render(
      <Sidebar 
        tags={mockTags}
        groups={mockGroups}
        selectedTagId={null}
        onTagSelect={() => {}}
        onGroupSelect={() => {}}
        onOpenGroup={() => {}}
      />
    )
    
    expect(screen.getByText('Work')).toBeTruthy()
    expect(screen.getByText('Personal')).toBeTruthy()
  })

  it('should render GroupList component with groups', () => {
    render(
      <Sidebar 
        tags={mockTags}
        groups={mockGroups}
        selectedTagId={null}
        onTagSelect={() => {}}
        onGroupSelect={() => {}}
        onOpenGroup={() => {}}
      />
    )
    
    expect(screen.getByText('Morning Routine')).toBeTruthy()
    expect(screen.getByText('Work Resources')).toBeTruthy()
  })

  it('should call onTagSelect when a tag is selected', () => {
    const onTagSelect = vi.fn()
    render(
      <Sidebar 
        tags={mockTags}
        groups={mockGroups}
        selectedTagId={null}
        onTagSelect={onTagSelect}
        onGroupSelect={() => {}}
        onOpenGroup={() => {}}
      />
    )
    
    fireEvent.click(screen.getByText('Work'))
    expect(onTagSelect).toHaveBeenCalled()
  })

  it('should call onOpenGroup when group open button is clicked', () => {
    const onOpenGroup = vi.fn()
    render(
      <Sidebar 
        tags={mockTags}
        groups={mockGroups}
        selectedTagId={null}
        onTagSelect={() => {}}
        onGroupSelect={() => {}}
        onOpenGroup={onOpenGroup}
      />
    )
    
    const openButtons = screen.getAllByText('一键打开')
    fireEvent.click(openButtons[0])
    expect(onOpenGroup).toHaveBeenCalledWith(mockGroups[0])
  })
})
