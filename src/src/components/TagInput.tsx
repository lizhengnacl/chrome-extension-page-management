/**
 * 标签输入组件
 * 支持下拉多选、搜索和新建标签
 */

import React, { useState, useRef, useEffect } from 'react';
import { tagStorage } from '../storage';
import { DropdownPortal } from './DropdownPortal';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  dropdownMode?: 'floating' | 'inline';
}

export interface TagInputRef {
  flushInput: () => void;
  getAllTags: () => string[];
}

export const TagInput = React.forwardRef<TagInputRef, TagInputProps>(({
  value,
  onChange,
  placeholder = '选择或搜索标签...',
  dropdownMode = 'floating',
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const flushInput = () => {
  };

  const getAllTags = () => {
    return [...value];
  };

  React.useImperativeHandle(ref, () => ({
    flushInput,
    getAllTags,
  }));

  // 加载标签列表
  useEffect(() => {
    if (isOpen) {
      tagStorage.getAllPaths().then(setAllTags);
    }
  }, [isOpen]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const filteredTags = allTags.filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateNew = searchQuery.trim() && !allTags.some(t =>
    t.toLowerCase() === searchQuery.toLowerCase()
  );

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter(t => t !== tag));
    } else {
      onChange([...value, tag]);
      tagStorage.addTag(tag);
    }
  };

  const handleCreateTag = async () => {
    if (!searchQuery.trim()) return;
    
    setIsCreating(true);
    try {
      await tagStorage.addTag(searchQuery.trim());
      onChange([...value, searchQuery.trim()]);
      setSearchQuery('');
      const updatedTags = await tagStorage.getAllPaths();
      setAllTags(updatedTags);
    } finally {
      setIsCreating(false);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const dropdownContent = (
    <>
      {/* 搜索框 */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索标签..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 标签列表 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            暂无标签
          </div>
        ) : (
          filteredTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                value.includes(tag) ? 'bg-blue-50' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {tag}
              </span>
              {value.includes(tag) && (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))
        )}
      </div>

      {/* 创建新标签 */}
      {canCreateNew && (
        <div className="p-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建标签 "{searchQuery.trim()}"
          </button>
        </div>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            value.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded"
              >
                {tag}
              </span>
            ))
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉框 */}
      {isOpen && dropdownMode === 'inline' && (
        <div
          ref={dropdownRef}
          className="mt-2 flex max-h-64 flex-col overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {dropdownContent}
        </div>
      )}

      {isOpen && dropdownMode === 'floating' && (
        <DropdownPortal
          ref={dropdownRef}
          anchorRef={triggerRef}
          isOpen={isOpen}
          className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {dropdownContent}
        </DropdownPortal>
      )}

      <p className="mt-1 text-xs text-gray-500">
        支持多级标签格式，如：技术/AI/大模型
      </p>
    </div>
  );
});
TagInput.displayName = 'TagInput';
