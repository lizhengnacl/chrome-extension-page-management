import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { PageCard } from './PageCard'
import type { Page } from '@/types'

const mockPage: Page = {
  id: '1',
  url: 'https://example.com',
  title: 'Example Page',
  favicon: 'https://example.com/favicon.ico',
  tags: ['tag1'],
  groups: ['group1'],
  isStarred: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
}

describe('PageCard', () => {
  it('should render page information correctly', () => {
    render(<PageCard page={mockPage} onEdit={() => {}} onDelete={() => {}} onToggleStar={() => {}} />)
    expect(screen.getByText('Example Page')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<PageCard page={mockPage} onEdit={onEdit} onDelete={() => {}} onToggleStar={() => {}} />)
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    expect(onEdit).toHaveBeenCalledWith(mockPage)
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<PageCard page={mockPage} onEdit={() => {}} onDelete={onDelete} onToggleStar={() => {}} />)
    const deleteButton = screen.getByTestId('delete-button')
    fireEvent.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith(mockPage.id)
  })

  it('should call onToggleStar when star button is clicked', () => {
    const onToggleStar = vi.fn()
    render(<PageCard page={mockPage} onEdit={() => {}} onDelete={() => {}} onToggleStar={onToggleStar} />)
    const starButton = screen.getByTestId('star-button')
    fireEvent.click(starButton)
    expect(onToggleStar).toHaveBeenCalledWith(mockPage.id)
  })
})
