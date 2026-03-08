import React, { useState, useEffect } from 'react'
import type { Page, Tag } from '@/types'
import { validateUrl } from '@/utils/validation'
import { getFaviconUrl } from '@/utils/favicon'

interface AddPageFormProps {
  page?: Page
  tags: Tag[]
  onSubmit: (pageData: Partial<Page>) => void
  onCancel: () => void
}

export const AddPageForm: React.FC<AddPageFormProps> = ({ page, tags, onSubmit, onCancel }) => {
  const [url, setUrl] = useState(page?.url || '')
  const [title, setTitle] = useState(page?.title || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(page?.tags || [])
  const [urlError, setUrlError] = useState<string | null>(null)

  useEffect(() => {
    if (page) {
      setUrl(page.url)
      setTitle(page.title)
      setSelectedTags(page.tags)
    }
  }, [page])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateUrl(url)) {
      setUrlError('请输入有效的 URL')
      return
    }
    
    setUrlError(null)
    
    const pageData: Partial<Page> = {
      url,
      title: title || url,
      favicon: getFaviconUrl(url),
      tags: selectedTags,
      updatedAt: Date.now()
    }
    
    if (!page) {
      pageData.id = Date.now().toString()
      pageData.createdAt = Date.now()
      pageData.groups = []
      pageData.isStarred = false
    }
    
    onSubmit(pageData)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px 0' }}>
        {page ? '编辑页面' : '添加页面'}
      </h2>
      
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="page-url" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          URL
        </label>
        <input
          id="page-url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setUrlError(null)
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${urlError ? '#DC2626' : '#E5E7EB'}`,
            borderRadius: 6,
            fontSize: 14
          }}
          placeholder="https://example.com"
        />
        {urlError && (
          <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4, margin: 0 }}>
            {urlError}
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="page-title" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          标题
        </label>
        <input
          id="page-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            fontSize: 14
          }}
          placeholder="页面标题"
        />
      </div>
      
      {tags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
            标签
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                style={{
                  padding: '4px 12px',
                  border: 'none',
                  borderRadius: 9999,
                  fontSize: 12,
                  cursor: 'pointer',
                  backgroundColor: selectedTags.includes(tag.id) ? '#4F46E5' : '#F3F4F6',
                  color: selectedTags.includes(tag.id) ? 'white' : '#374151'
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: 6,
            fontSize: 14,
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
            padding: '8px 16px',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer',
            backgroundColor: '#4F46E5',
            color: 'white'
          }}
        >
          保存
        </button>
      </div>
    </form>
  )
}
