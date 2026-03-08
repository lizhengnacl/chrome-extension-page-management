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
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={() => setIsAdding(!isAdding)}
          title="添加标签"
          className="text-text-muted hover:text-text-primary hover:bg-background-tertiary/50"
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
        {tags.map((tag, index) => (
          <button
            key={tag.id}
            onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
              selectedTagId === tag.id
                ? 'ring-2 ring-white ring-offset-2 ring-offset-background-secondary scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: tag.color, animationDelay: `${index * 0.05}s` }}
            title={tag.name}
          >
            <span className="text-white text-xs font-bold">
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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 group ${
          !selectedTagId
            ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-text-primary'
            : 'text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary'
        }`}
      >
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-text-muted to-text-secondary flex items-center justify-center">
          <svg
            className="w-3 h-3 text-text-primary"
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
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <span className="flex-1 font-medium">全部</span>
      </button>

      {tags.map((tag, index) => (
        <div key={tag.id} className="flex items-center gap-2">
          <button
            onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 group ${
              selectedTagId === tag.id
                ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 text-text-primary'
                : 'text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary'
            }`}
            style={{ borderLeft: `4px solid ${tag.color}` }}
            title="单击选择，双击编辑"
          >
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: tag.color }}
            >
              <span className="text-white text-xs font-bold">
                {tag.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="flex-1 truncate font-medium">{tag.name}</span>
          </button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex flex-col gap-2 mt-2 animate-fade-in">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="输入标签名称..."
            size="sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTagName('');
              }
            }}
            classNames={{
              input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
              inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl',
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              onClick={handleAddTag}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white"
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
              className="text-text-secondary hover:text-text-primary"
            >
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="mt-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50 border border-dashed border-border/50"
        >
          <svg
            className="w-4 h-4 mr-2"
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
