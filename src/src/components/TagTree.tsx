/**
 * 标签树组件
 * 显示可折叠的多级标签树，支持拖拽排序
 */

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TagNode } from '../types';

interface TagTreeProps {
  nodes: TagNode[];
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
  onDeleteTag?: (tagPath: string) => void;
  onEditTag?: (tagPath: string, tagName: string) => void;
  onReorderTags?: (parentPath: string | null, tagIds: string[]) => void;
}

interface SortableTagNodeItemProps {
  node: TagNode;
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
  level: number;
  onDeleteTag?: (tagPath: string) => void;
  onEditTag?: (tagPath: string, tagName: string) => void;
  onReorderTags?: (parentPath: string | null, tagIds: string[]) => void;
}

const SortableTagNodeItem: React.FC<SortableTagNodeItemProps> = ({
  node,
  onTagClick,
  selectedTag,
  level,
  onDeleteTag,
  onEditTag,
  onReorderTags,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedTag === node.path;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div 
        className="flex items-center gap-1 px-2 py-1.5 text-sm rounded-md transition-colors"
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ paddingLeft: `${level * 16}px` }} className="flex items-center gap-1 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-all"
            title="拖拽排序"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          
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
          
          <div
            className={`flex items-center gap-1 flex-1 rounded px-1 py-0.5 ${
              isSelected
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
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
          </div>
          
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
      </div>

      {hasChildren && isExpanded && onReorderTags && (
        <TagTreeLevel
          nodes={node.children}
          parentPath={node.path}
          onTagClick={onTagClick}
          selectedTag={selectedTag}
          level={level + 1}
          onDeleteTag={onDeleteTag}
          onEditTag={onEditTag}
          onReorderTags={onReorderTags}
        />
      )}
      {hasChildren && isExpanded && !onReorderTags && (
        <div>
          {node.children.map(child => (
            <SortableTagNodeItem
              key={child.id}
              node={child}
              onTagClick={onTagClick}
              selectedTag={selectedTag}
              level={level + 1}
              onDeleteTag={onDeleteTag}
              onEditTag={onEditTag}
              onReorderTags={onReorderTags}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TagTreeLevelProps {
  nodes: TagNode[];
  parentPath: string | null;
  onTagClick: (tagPath: string) => void;
  selectedTag?: string;
  level: number;
  onDeleteTag?: (tagPath: string) => void;
  onEditTag?: (tagPath: string, tagName: string) => void;
  onReorderTags?: (parentPath: string | null, tagIds: string[]) => void;
}

const TagTreeLevel: React.FC<TagTreeLevelProps> = ({
  nodes,
  parentPath,
  onTagClick,
  selectedTag,
  level,
  onDeleteTag,
  onEditTag,
  onReorderTags,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<TagNode[]>(nodes);

  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalNodes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });

      const newNodes = arrayMove([...localNodes], 
        localNodes.findIndex((item) => item.id === active.id),
        localNodes.findIndex((item) => item.id === over.id)
      );
      
      if (onReorderTags) {
        await onReorderTags(parentPath, newNodes.map(n => n.id));
      }
    }

    setActiveId(null);
  };

  return (
    <div className="space-y-0.5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localNodes.map(n => n.id)}
          strategy={verticalListSortingStrategy}
        >
          {localNodes.map(node => (
            <SortableTagNodeItem
              key={node.id}
              node={node}
              onTagClick={onTagClick}
              selectedTag={selectedTag}
              level={level}
              onDeleteTag={onDeleteTag}
              onEditTag={onEditTag}
              onReorderTags={onReorderTags}
            />
          ))}
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80 bg-white rounded-lg shadow-xl border border-blue-200 px-3 py-2 text-sm">
              {(() => {
                const node = localNodes.find(n => n.id === activeId);
                return node ? node.name : '';
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export const TagTree: React.FC<TagTreeProps> = ({
  nodes,
  onTagClick,
  selectedTag,
  onDeleteTag,
  onEditTag,
  onReorderTags,
}) => {
  if (nodes.length === 0) {
    return (
      <div className="px-3 py-4 text-center text-sm text-gray-400">
        暂无标签
      </div>
    );
  }

  if (onReorderTags) {
    return (
      <TagTreeLevel
        nodes={nodes}
        parentPath={null}
        onTagClick={onTagClick}
        selectedTag={selectedTag}
        level={0}
        onDeleteTag={onDeleteTag}
        onEditTag={onEditTag}
        onReorderTags={onReorderTags}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <SortableTagNodeItem
          key={node.id}
          node={node}
          onTagClick={onTagClick}
          selectedTag={selectedTag}
          level={0}
          onDeleteTag={onDeleteTag}
          onEditTag={onEditTag}
          onReorderTags={onReorderTags}
        />
      ))}
    </div>
  );
};
