import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddPageForm } from './AddPageForm'
import type { Page, Tag } from '@/types'

const mockTags: Tag[] = [
  { id: 'tag1', name: 'Work', parentId: null, children: [], createdAt: Date.now() },
  { id: 'tag2', name: 'Personal', parentId: null, children: [], createdAt: Date.now() }
]

const mockPage: Page = {
  id: '1',
  url: 'https://example.com',
  title: 'Example Page',
  favicon: 'https://example.com/favicon.ico',
  tags: ['tag1'],
  groups: [],
  isStarred: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
}

describe('AddPageForm', () => {
  it('should render form fields', () => {
    render(<AddPageForm tags={mockTags} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/标题/i)).toBeInTheDocument()
  })

  it('should call onSubmit with form data when submitted', () => {
    const onSubmit = vi.fn()
    render(<AddPageForm tags={mockTags} onSubmit={onSubmit} onCancel={() => {}} />)
    
    fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: 'https://test.com' } })
    fireEvent.change(screen.getByLabelText(/标题/i), { target: { value: 'Test Page' } })
    fireEvent.click(screen.getByText(/保存/i))
    
    expect(onSubmit).toHaveBeenCalled()
  })

  it('should populate form when editing an existing page', () => {
    render(<AddPageForm page={mockPage} tags={mockTags} onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByLabelText(/URL/i)).toHaveValue('https://example.com')
    expect(screen.getByLabelText(/标题/i)).toHaveValue('Example Page')
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<AddPageForm tags={mockTags} onSubmit={() => {}} onCancel={onCancel} />)
    fireEvent.click(screen.getByText(/取消/i))
    expect(onCancel).toHaveBeenCalled()
  })
})
