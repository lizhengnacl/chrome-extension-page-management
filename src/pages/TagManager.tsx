import React, { useState } from 'react'
import type { Tag } from '@/types'

interface TagManagerProps {
  tags: Tag[]
  onAddTag: (name: string, parentId: string | null) => void
  onDeleteTag: (tagId: string) => void
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, onAddTag, onDeleteTag }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTagName.trim()) {
      onAddTag(newTagName.trim(), null)
      setNewTagName('')
      setShowAddForm(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>标签管理</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            backgroundColor: '#4F46E5',
            color: 'white'
          }}
        >
          添加标签
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTag} style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="标签名称"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 8
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setNewTagName('')
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#374151'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                backgroundColor: '#4F46E5',
                color: 'white'
              }}
            >
              保存
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tags.filter(t => t.parentId === null).map((tag) => (
          <div
            key={tag.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: '#F9FAFB',
              borderRadius: 6
            }}
          >
            <span style={{ fontSize: 14, color: '#111827' }}>{tag.name}</span>
            <button
              onClick={() => onDeleteTag(tag.id)}
              style={{
                padding: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 14,
                color: '#DC2626'
              }}
            >
              🗑️
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, padding: 16 }}>
            暂无标签
          </p>
        )}
      </div>
    </div>
  )
}
