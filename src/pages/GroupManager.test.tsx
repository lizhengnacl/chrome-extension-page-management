import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupManager } from './GroupManager'
import type { Group } from '@/types'

const mockGroups: Group[] = [
  { id: '1', name: 'Morning Routine', pageIds: ['page1', 'page2'], createdAt: Date.now(), updatedAt: Date.now() },
  { id: '2', name: 'Work Resources', pageIds: ['page3'], createdAt: Date.now(), updatedAt: Date.now() }
]

describe('GroupManager', () => {
  it('should render group list', () => {
    render(<GroupManager groups={mockGroups} onAddGroup={() => {}} onDeleteGroup={() => {}} />)
    expect(screen.getByText('Morning Routine')).toBeInTheDocument()
    expect(screen.getByText('Work Resources')).toBeInTheDocument()
  })

  it('should display page count for each group', () => {
    render(<GroupManager groups={mockGroups} onAddGroup={() => {}} onDeleteGroup={() => {}} />)
    expect(screen.getByText('2 个页面')).toBeInTheDocument()
    expect(screen.getByText('1 个页面')).toBeInTheDocument()
  })

  it('should show add group form when add button is clicked', () => {
    render(<GroupManager groups={mockGroups} onAddGroup={() => {}} onDeleteGroup={() => {}} />)
    const addButton = screen.getByText(/添加分组/i)
    fireEvent.click(addButton)
    expect(screen.getByPlaceholderText(/分组名称/i)).toBeInTheDocument()
  })

  it('should call onDeleteGroup when delete button is clicked', () => {
    const onDeleteGroup = vi.fn()
    render(<GroupManager groups={mockGroups} onAddGroup={() => {}} onDeleteGroup={onDeleteGroup} />)
    const deleteButtons = screen.getAllByText('🗑️')
    fireEvent.click(deleteButtons[0])
    expect(onDeleteGroup).toHaveBeenCalledWith('1')
  })
})
