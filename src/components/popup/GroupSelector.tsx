import { useState } from 'react';
import { Button, Input, Select, SelectItem } from '@nextui-org/react';
import type { Group } from '../../types';

interface GroupSelectorProps {
  selectedGroupId: string | null;
  availableGroups: Group[];
  onChange: (groupId: string | null) => void;
  onAddGroup: (name: string) => Promise<Group>;
}

export function GroupSelector({ selectedGroupId, availableGroups, onChange, onAddGroup }: GroupSelectorProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      return;
    }

    try {
      setIsAdding(true);
      const newGroup = await onAddGroup(newGroupName.trim());
      setNewGroupName('');
      onChange(newGroup.id);
    } catch (error) {
      console.error('Failed to add group:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2 text-gray-700">分组</label>
      <Select
        placeholder="未分组"
        selectedKeys={selectedGroupId ? [selectedGroupId] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;
          onChange(selectedKey || null);
        }}
        className="mb-3"
      >
        {availableGroups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {group.name}
          </SelectItem>
        ))}
      </Select>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="输入新分组名称"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddGroup();
            }
          }}
        />
        <Button
          onClick={handleAddGroup}
          isLoading={isAdding}
        >
          添加分组
        </Button>
      </div>
    </div>
  );
}
