import React, { useState } from 'react'
import type { Group } from '@/types'

interface GroupManagerProps {
  groups: Group[]
  onAddGroup: (name: string) => void
  onDeleteGroup: (groupId: string) => void
}

export const GroupManager: React.FC<GroupManagerProps> = ({ groups, onAddGroup, onDeleteGroup }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim())
      setNewGroupName('')
      setShowAddForm(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>分组管理</h2>
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
          添加分组
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGroup} style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="分组名称"
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
                setNewGroupName('')
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map((group) => (
          <div
            key={group.id}
            style={{
              padding: 12,
              backgroundColor: '#F9FAFB',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px 0', color: '#111827' }}>
                {group.name}
              </h3>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                {group.pageIds.length} 个页面
              </p>
            </div>
            <button
              onClick={() => onDeleteGroup(group.id)}
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
        {groups.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 14, padding: 16 }}>
            暂无分组
          </p>
        )}
      </div>
    </div>
  )
}
