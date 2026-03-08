/**
 * 标签树组件
 * 显示可折叠的多级标签树
 */

import React, { useState } from 'react';
import type { TagNode } from '../types';

interface TagTreeProps {
  nodes: TagNode[];
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
}

interface TagNodeItemProps {
  node: TagNode;
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
  level: number;
}

const TagNodeItem: React.FC<TagNodeItemProps> = ({
  node,
  onTagClick,
  selectedTag,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedTag === node.path;

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => onTagClick(node.path)}
        className={`w-full flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="truncate">{node.name}</span>
      </button>

      {/* 子节点 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TagNodeItem
              key={child.id}
              node={child}
              onTagClick={onTagClick}
              selectedTag={selectedTag}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TagTree: React.FC<TagTreeProps> = ({
  nodes,
  onTagClick,
  selectedTag,
}) => {
  if (nodes.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-sm text-gray-400">
        暂无标签
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <TagNodeItem
          key={node.id}
          node={node}
          onTagClick={onTagClick}
          selectedTag={selectedTag}
          level={0}
        />
      ))}
    </div>
  );
};