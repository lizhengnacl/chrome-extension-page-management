import { useState } from 'react';
import { Button, Input } from '../../components/common';
import { Tag } from '../../components/common/Tag';
import type { Tag as TagType } from '../../types';

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: TagType[];
  onChange: (tagIds: string[]) => void;
  onAddTag: (name: string) => Promise<void>;
}

export function TagSelector({ selectedTags, availableTags, onChange, onAddTag }: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      return;
    }

    try {
      setIsAdding(true);
      await onAddTag(newTagName.trim());
      setNewTagName('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-text-secondary">标签</label>
      <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
        {availableTags.map((tag) => (
          <Tag
            key={tag.id}
            color={tag.color}
            onClick={() => toggleTag(tag.id)}
            className={`cursor-pointer transition-all duration-300 ${
              selectedTags.includes(tag.id)
                ? 'ring-2 ring-white ring-offset-2 ring-offset-background-primary scale-105'
                : 'hover:opacity-80 hover:scale-[1.02]'
            }`}
          >
            {tag.name}
          </Tag>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="输入新标签名称"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTag();
            }
          }}
          classNames={{
            input: 'bg-background-tertiary/50 border-border/50 text-text-primary placeholder-text-muted',
            inputWrapper: 'bg-background-tertiary/30 border border-border/50 rounded-xl',
          }}
        />
        <Button
          onClick={handleAddTag}
          isLoading={isAdding}
          color="primary"
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white"
        >
          添加
        </Button>
      </div>
    </div>
  );
}
