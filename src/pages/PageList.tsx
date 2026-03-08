import React, { useMemo } from 'react'
import { PageCard } from '@/components/PageCard'
import type { Page } from '@/types'

interface PageListProps {
  pages: Page[]
  selectedTagId: string | null
  selectedGroupId: string | null
  onEdit: (page: Page) => void
  onDelete: (pageId: string) => void
  onToggleStar: (pageId: string) => void
}

export const PageList: React.FC<PageListProps> = ({
  pages,
  selectedTagId,
  selectedGroupId,
  onEdit,
  onDelete,
  onToggleStar
}) => {
  const filteredPages = useMemo(() => {
    let result = pages

    if (selectedTagId) {
      result = result.filter(page => page.tags.includes(selectedTagId))
    }

    if (selectedGroupId) {
      result = result.filter(page => page.groups.includes(selectedGroupId))
    }

    return result
  }, [pages, selectedTagId, selectedGroupId])

  if (filteredPages.length === 0) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        color: '#6B7280'
      }}>
        <p>暂无页面</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredPages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>
    </div>
  )
}
