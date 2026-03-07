import { useState } from 'react';
import { TagList } from './TagList';
import { Button } from '../common';
import { useTags } from '../../hooks/useTags';

interface SidebarProps {
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
  onAddTag: (name: string) => Promise<void>;
}

export function Sidebar({ selectedTagId, onTagSelect, onAddTag }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { tags } = useTags();

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">标签</h2>}
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={() => setIsCollapsed(!isCollapsed)}
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
              {isCollapsed ? (
                <>
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 12" />
                </>
              ) : (
                <>
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 12" />
                </>
              )}
            </svg>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <TagList
          tags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={onTagSelect}
          onAddTag={onAddTag}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}
