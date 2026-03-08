import React, { useState } from 'react'
import type { Tag } from '@/types'

interface TagTreeProps {
  tags: Tag[]
  onTagSelect: (tagId: string | null) => void
  selectedTagId: string | null
}

interface TagNodeProps {
  tag: Tag
  tags: Tag[]
  onTagSelect: (tagId: string | null) => void
  selectedTagId: string | null
  level: number
}

const TagNode: React.FC<TagNodeProps> = ({ tag, tags, onTagSelect, selectedTagId, level }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const children = tags.filter(t => t.parentId === tag.id)
  const hasChildren = children.length > 0

  return (
    <div>
      <div style={{
        paddingLeft: level * 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 4,
        paddingBottom: 4
      }}>
        {hasChildren && (
          <button
            data-testid={`toggle-${tag.id}`}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: 4,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: 4
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span style={{ width: 24 }} />}
        <button
          data-testid={`tag-${tag.id}`}
          onClick={() => onTagSelect(tag.id)}
          style={{
            flex: 1,
            textAlign: 'left',
            padding: '4px 8px',
            border: 'none',
            background: selectedTagId === tag.id ? '#E0E7FF' : 'transparent',
            color: selectedTagId === tag.id ? '#4338CA' : '#111827',
            cursor: 'pointer',
            borderRadius: 4
          }}
          onMouseEnter={(e) => {
            if (selectedTagId !== tag.id) {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTagId !== tag.id) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          {tag.name}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <TagNode
              key={child.id}
              tag={child}
              tags={tags}
              onTagSelect={onTagSelect}
              selectedTagId={selectedTagId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const TagTree: React.FC<TagTreeProps> = ({ tags, onTagSelect, selectedTagId }) => {
  const rootTags = tags.filter(t => t.parentId === null)

  return (
    <div>
      <button
        onClick={() => onTagSelect(null)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '4px 8px',
          border: 'none',
          background: selectedTagId === null ? '#E0E7FF' : 'transparent',
          color: selectedTagId === null ? '#4338CA' : '#111827',
          cursor: 'pointer',
          borderRadius: 4,
          marginBottom: 8
        }}
        onMouseEnter={(e) => {
          if (selectedTagId !== null) {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTagId !== null) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        全部
      </button>
      {rootTags.map((tag) => (
        <TagNode
          key={tag.id}
          tag={tag}
          tags={tags}
          onTagSelect={onTagSelect}
          selectedTagId={selectedTagId}
          level={0}
        />
      ))}
    </div>
  )
}
