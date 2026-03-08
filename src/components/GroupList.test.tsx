import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { GroupList } from './GroupList'
import type { Group } from '@/types'

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

describe('GroupList', () => {
  it('should render group list', () => {
    render(<GroupList groups={mockGroups} onGroupSelect={() => {}} onOpenAll={() => {}} selectedGroupId={null} />)
    expect(screen.getByText('Morning Routine')).toBeInTheDocument()
    expect(screen.getByText('Work Resources')).toBeInTheDocument()
  })

  it('should display page count for each group', () => {
    render(<GroupList groups={mockGroups} onGroupSelect={() => {}} onOpenAll={() => {}} selectedGroupId={null} />)
    expect(screen.getByText('2 个页面')).toBeInTheDocument()
    expect(screen.getByText('1 个页面')).toBeInTheDocument()
  })

  it('should call onOpenAll when open all button is clicked', () => {
    const onOpenAll = vi.fn()
    render(<GroupList groups={mockGroups} onGroupSelect={() => {}} onOpenAll={onOpenAll} selectedGroupId={null} />)
    const openButton = screen.getAllByTestId('open-all-button')[0]
    fireEvent.click(openButton)
    expect(onOpenAll).toHaveBeenCalledWith('1')
  })

  it('should call onGroupSelect when group is clicked', () => {
    const onGroupSelect = vi.fn()
    render(<GroupList groups={mockGroups} onGroupSelect={onGroupSelect} onOpenAll={() => {}} selectedGroupId={null} />)
    const groupButton = screen.getByTestId('group-1')
    fireEvent.click(groupButton)
    expect(onGroupSelect).toHaveBeenCalledWith('1')
  })
})
