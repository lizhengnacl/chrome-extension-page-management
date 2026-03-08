import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { AddPageForm } from './AddPageForm'
import { TagManager } from './TagManager'
import { GroupManager } from './GroupManager'
import { usePages } from '@/hooks/usePages'
import { useTags } from '@/hooks/useTags'
import { useGroups } from '@/hooks/useGroups'
import type { Page } from '@/types'

type TabType = 'add' | 'tags' | 'groups'

export const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('add')
  const { addPage, updatePage } = usePages()
  const { tags, addTag, deleteTag } = useTags()
  const { groups, addGroup, deleteGroup } = useGroups()

  const handleAddPageSubmit = (pageData: Partial<Page>) => {
    if (pageData.id) {
      updatePage(pageData.id, pageData)
    } else {
      addPage(pageData as Page)
    }
  }

  const handleCancel = () => {
  }

  return (
    <div style={{ width: 400, maxHeight: 600, overflow: 'auto' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, marginBottom: 12 }}>
          页面管理
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              backgroundColor: activeTab === 'add' ? '#4F46E5' : '#F3F4F6',
              color: activeTab === 'add' ? 'white' : '#374151'
            }}
          >
            添加页面
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              backgroundColor: activeTab === 'tags' ? '#4F46E5' : '#F3F4F6',
              color: activeTab === 'tags' ? 'white' : '#374151'
            }}
          >
            标签
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              backgroundColor: activeTab === 'groups' ? '#4F46E5' : '#F3F4F6',
              color: activeTab === 'groups' ? 'white' : '#374151'
            }}
          >
            分组
          </button>
        </div>
      </div>
      
      <div>
        {activeTab === 'add' && (
          <AddPageForm
            tags={tags}
            onSubmit={handleAddPageSubmit}
            onCancel={handleCancel}
          />
        )}
        {activeTab === 'tags' && (
          <TagManager
            tags={tags}
            onAddTag={addTag}
            onDeleteTag={deleteTag}
          />
        )}
        {activeTab === 'groups' && (
          <GroupManager
            groups={groups}
            onAddGroup={addGroup}
            onDeleteGroup={deleteGroup}
          />
        )}
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(<Popup />)
}
