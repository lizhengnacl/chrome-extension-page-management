import React from 'react'
import type { Page } from '@/types'

interface ShortcutGridProps {
  pages: Page[]
  onPageClick: (page: Page) => void
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({ pages, onPageClick }) => {
  if (pages.length === 0) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        color: '#6B7280'
      }}>
        <p>暂无星标页面</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 16,
      padding: 16
    }}>
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onPageClick(page)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 16,
            border: 'none',
            borderRadius: 12,
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.1s',
            gap: 8
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <img
            src={page.favicon}
            alt=""
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              objectFit: 'contain'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0NGRDVGRSIvPgo8cGF0aCBkPSJNMTIgMjBIMzZWMzOEgxMlYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
            }}
          />
          <span style={{
            fontSize: 12,
            color: '#374151',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
            maxHeight: 31
          }}>
            {page.title}
          </span>
        </button>
      ))}
    </div>
  )
}
