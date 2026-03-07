import { useState } from 'react';
import { Button, Input } from '../common';
import type { Tag } from '../../types';

interface TagListProps {
  tags: Tag[];
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  onAddTag: (name: string) => Promise<void>;
  isCollapsed?: boolean;
}

export function TagList({ tags, selectedTagId, onTagSelect, onAddTag, isCollapsed = false }: TagListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await onAddTag(newTagName.trim());
      setNewTagName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={() => setIsAdding(!isAdding)}
          title="添加标签"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </Button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              selectedTagId === tag.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ backgroundColor: tag.color }}
            title={tag.name}
          >
            <span className="text-white text-xs font-medium">
              {tag.name.charAt(0).toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
          !selectedTagId
            ? 'bg-gray-100 ring-2 ring-blue-500'
            : 'hover:bg-gray-100'
        }`}
        style={{ borderLeft: '4px solid #9ca3af' }}
      >
        <span className="flex-1">全部</span>
      </button>

      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center gap-2">
          <button
            onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
              selectedTagId === tag.id
                ? 'bg-gray-100 ring-2 ring-blue-500'
                : 'hover:bg-gray-100'
            }`}
            style={{ borderLeft: `4px solid ${tag.color}` }}
            title="单击选择，双击编辑"
          >
            <span className="flex-1 truncate">{tag.name}</span>
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2 mt-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="标签名称"
            size="sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTagName('');
              }
            }}
            autoFocus
          />
          <Button
            size="sm"
            color="primary"
            onClick={handleAddTag}
          >
            添加
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewTagName('');
            }}
          >
            取消
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="mt-2"
        >
          <svg
            className="w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          添加标签
        </Button>
      )}
    </div>
  );
}
