import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagManager } from './TagManager'
import type { Tag } from '@/types'

const mockTags: Tag[] = [
  { id: '1', name: 'Work', parentId: null, children: [], createdAt: Date.now() },
  { id: '2', name: 'Personal', parentId: null, children: [], createdAt: Date.now() }
]

describe('TagManager', () => {
  it('should render tag tree', () => {
    render(<TagManager tags={mockTags} onAddTag={() => {}} onDeleteTag={() => {}} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('should show add tag form when add button is clicked', () => {
    render(<TagManager tags={mockTags} onAddTag={() => {}} onDeleteTag={() => {}} />)
    const addButton = screen.getByText(/添加标签/i)
    fireEvent.click(addButton)
    expect(screen.getByPlaceholderText(/标签名称/i)).toBeInTheDocument()
  })

  it('should call onAddTag when new tag is submitted', () => {
    const onAddTag = vi.fn()
    render(<TagManager tags={mockTags} onAddTag={onAddTag} onDeleteTag={() => {}} />)
    fireEvent.click(screen.getByText(/添加标签/i))
    fireEvent.change(screen.getByPlaceholderText(/标签名称/i), { target: { value: 'New Tag' } })
    fireEvent.click(screen.getByText(/保存/i))
    expect(onAddTag).toHaveBeenCalled()
  })

  it('should call onDeleteTag when delete button is clicked', () => {
    const onDeleteTag = vi.fn()
    render(<TagManager tags={mockTags} onAddTag={() => {}} onDeleteTag={onDeleteTag} />)
    const deleteButtons = screen.getAllByText('🗑️')
    fireEvent.click(deleteButtons[0])
    expect(onDeleteTag).toHaveBeenCalledWith('1')
  })
})
