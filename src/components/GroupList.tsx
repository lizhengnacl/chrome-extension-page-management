import React from 'react'
import type { Group } from '@/types'

interface GroupListProps {
  groups: Group[]
  onGroupSelect: (groupId: string | null) => void
  onOpenAll: (groupId: string) => void
  selectedGroupId: string | null
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  onGroupSelect,
  onOpenAll,
  selectedGroupId
}) => {
  return (
    <div>
      <button
        onClick={() => onGroupSelect(null)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '4px 8px',
          border: 'none',
          background: selectedGroupId === null ? '#E0E7FF' : 'transparent',
          color: selectedGroupId === null ? '#4338CA' : '#111827',
          cursor: 'pointer',
          borderRadius: 4,
          marginBottom: 8
        }}
        onMouseEnter={(e) => {
          if (selectedGroupId !== null) {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedGroupId !== null) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        全部分组
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map((group) => (
          <div
            key={group.id}
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 12,
              border: `2px solid ${selectedGroupId === group.id ? '#4F46E5' : '#E5E7EB'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                data-testid={`group-${group.id}`}
                onClick={() => onGroupSelect(group.id)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <h3 style={{
                  fontWeight: 500,
                  color: '#111827',
                  margin: 0,
                  fontSize: 14
                }}>{group.name}</h3>
                <p style={{
                  fontSize: 12,
                  color: '#6B7280',
                  margin: '4px 0 0 0'
                }}>{group.pageIds.length} 个页面</p>
              </button>
              <button
                data-testid="open-all-button"
                onClick={() => onOpenAll(group.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
              >
                一键打开
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
