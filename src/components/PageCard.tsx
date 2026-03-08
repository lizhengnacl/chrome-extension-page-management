import React from 'react'
import type { Page } from '@/types'

interface PageCardProps {
  page: Page
  onEdit: (page: Page) => void
  onDelete: (pageId: string) => void
  onToggleStar: (pageId: string) => void
}

export const PageCard: React.FC<PageCardProps> = ({ page, onEdit, onDelete, onToggleStar }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: 16,
      marginBottom: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <img
          src={page.favicon}
          alt=""
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            flexShrink: 0
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0NGRDVGRSIvPgo8cGF0aCBkPSJNOCAxMEgyNFYyNEg4VjEwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontWeight: 500,
            color: '#111827',
            margin: 0,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{page.title}</h3>
          <p style={{
            fontSize: 12,
            color: '#6B7280',
            margin: '4px 0 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{page.url}</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            data-testid="star-button"
            onClick={() => onToggleStar(page.id)}
            style={{
              padding: 4,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              color: page.isStarred ? '#EAB308' : '#9CA3AF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {page.isStarred ? '⭐' : '☆'}
          </button>
          <button
            data-testid="edit-button"
            onClick={() => onEdit(page)}
            style={{
              padding: 4,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              color: '#4B5563'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✏️
          </button>
          <button
            data-testid="delete-button"
            onClick={() => onDelete(page.id)}
            style={{
              padding: 4,
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              color: '#DC2626'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            🗑️
          </button>
        </div>
      </div>
      {page.tags.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {page.tags.map((tagId: string) => (
            <span
              key={tagId}
              style={{
                padding: '2px 8px',
                backgroundColor: '#E0E7FF',
                color: '#4338CA',
                fontSize: 10,
                borderRadius: 4
              }}
            >
              {tagId}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
