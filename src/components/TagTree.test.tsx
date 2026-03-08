import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TagTree } from './TagTree'
import type { Tag } from '@/types'

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

describe('TagTree', () => {
  it('should render root tags', () => {
    render(<TagTree tags={mockTags} onTagSelect={() => {}} selectedTagId={null} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('should expand and collapse tags with children', () => {
    render(<TagTree tags={mockTags} onTagSelect={() => {}} selectedTagId={null} />)
    
    expect(screen.getByText('Design')).toBeInTheDocument()
    
    const toggleButton = screen.getByTestId('toggle-1')
    fireEvent.click(toggleButton)
    
    expect(screen.queryByText('Design')).not.toBeInTheDocument()
  })

  it('should call onTagSelect when tag is clicked', () => {
    const onTagSelect = vi.fn()
    render(<TagTree tags={mockTags} onTagSelect={onTagSelect} selectedTagId={null} />)
    const tagButton = screen.getByTestId('tag-1')
    fireEvent.click(tagButton)
    expect(onTagSelect).toHaveBeenCalledWith('1')
  })
})
