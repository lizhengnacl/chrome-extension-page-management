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
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2 text-gray-700">标签</label>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
        {availableTags.map((tag) => (
          <Tag
            key={tag.id}
            color={tag.color}
            onClick={() => toggleTag(tag.id)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedTags.includes(tag.id)
                ? 'ring-2 ring-blue-500'
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
        />
        <Button
          onClick={handleAddTag}
          isLoading={isAdding}
        >
          添加标签
        </Button>
      </div>
    </div>
  );
}
