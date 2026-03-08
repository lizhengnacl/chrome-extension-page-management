import React from 'react'
import { TagTree } from '@/components/TagTree'
import { GroupList } from '@/components/GroupList'
import type { Tag, Group } from '@/types'

interface SidebarProps {
  tags: Tag[]
  groups: Group[]
  selectedTagId: string | null
  onTagSelect: (tagId: string | null) => void
  onGroupSelect: (groupId: string | null) => void
  onOpenGroup: (group: Group) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  tags,
  groups,
  selectedTagId,
  onTagSelect,
  onGroupSelect,
  onOpenGroup
}) => {
  return (
    <div style={{
      width: 280,
      backgroundColor: '#F9FAFB',
      borderRight: '1px solid #E5E7EB',
      height: '100vh',
      overflow: 'auto',
      padding: 16
    }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#6B7280',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          标签
        </h2>
        <TagTree
          tags={tags}
          onTagSelect={onTagSelect}
          selectedTagId={selectedTagId}
        />
      </div>
      
      <div>
        <h2 style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#6B7280',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          分组
        </h2>
        <GroupList
          groups={groups}
          onGroupSelect={onGroupSelect}
          onOpenAll={(groupId) => {
            const group = groups.find(g => g.id === groupId)
            if (group) {
              onOpenGroup(group)
            }
          }}
          selectedGroupId={null}
        />
      </div>
    </div>
  )
}
