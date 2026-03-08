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
  onDeleteTag?: (tagPath: string) => void;
  onEditTag?: (tagPath: string, tagName: string) => void;
}

interface TagNodeItemProps {
  node: TagNode;
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
  level: number;
  onDeleteTag?: (tagPath: string) => void;
  onEditTag?: (tagPath: string, tagName: string) => void;
}

const TagNodeItem: React.FC<TagNodeItemProps> = ({
  node,
  onTagClick,
  selectedTag,
  level,
  onDeleteTag,
  onEditTag,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedTag === node.path;

  return (
    <div className="select-none" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors ${
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
        <button
          type="button"
          onClick={() => onTagClick(node.path)}
          className="flex items-center gap-1 flex-1 text-left"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="truncate">{node.name}</span>
        </button>
        <div className="flex items-center gap-0.5">
          {onEditTag && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditTag(node.path, node.name);
              }}
              className={`p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              title="编辑标签"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDeleteTag && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTag(node.path);
              }}
              className={`p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              title="删除标签"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

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
              onDeleteTag={onDeleteTag}
              onEditTag={onEditTag}
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
  onDeleteTag,
  onEditTag,
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
          onDeleteTag={onDeleteTag}
          onEditTag={onEditTag}
        />
      ))}
    </div>
  );
};