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
    <div className={`flex flex-col h-full bg-background-secondary/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-400"
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
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" x2="7.01" y1="7" y2="7" />
              </svg>
              <h2 className="text-lg font-semibold text-text-primary">标签</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={() => setIsCollapsed(!isCollapsed)}
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
