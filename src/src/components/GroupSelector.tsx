/**
 * 分组选择器组件
 * 支持下拉多选、搜索和新建分组
 */

import React, { useState, useRef, useEffect } from 'react';
import { groupStorage } from '../storage';
import type { Group } from '../types';

interface GroupSelectorProps {
  value: string[];
  onChange: (groupIds: string[]) => void;
  placeholder?: string;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  value,
  onChange,
  placeholder = '选择或搜索分组...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 加载分组列表
  useEffect(() => {
    groupStorage.getAll().then(setGroups);
  }, [isOpen]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGroups = groups.filter(g => value.includes(g.id));
  const canCreateNew = searchQuery.trim() && !groups.some(g =>
    g.name.toLowerCase() === searchQuery.toLowerCase()
  );

  const toggleGroup = (groupId: string) => {
    if (value.includes(groupId)) {
      onChange(value.filter(id => id !== groupId));
    } else {
      onChange([...value, groupId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newGroup = await groupStorage.add(searchQuery.trim());
      onChange([...value, newGroup.id]);
      setSearchQuery('');
      const updatedGroups = await groupStorage.getAll();
      setGroups(updatedGroups);
    } finally {
      setIsCreating(false);
    }
  };

  const removeGroup = (groupId: string) => {
    onChange(value.filter(id => id !== groupId));
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {selectedGroups.length === 0 ? (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          ) : (
            selectedGroups.map(group => (
              <span
                key={group.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-sm rounded"
              >
                {group.name}
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
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索分组..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 分组列表 */}
          <div className="max-h-48 overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                暂无分组
              </div>
            ) : (
              filteredGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    value.includes(group.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {group.name}
                  </span>
                  {value.includes(group.id) && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          {/* 创建新分组 */}
          {canCreateNew && (
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建分组 "{searchQuery.trim()}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* 已选分组标签（外部显示） */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedGroups.map(group => (
            <span
              key={group.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md"
            >
              {group.name}
              <button
                type="button"
                onClick={() => removeGroup(group.id)}
                className="hover:text-purple-900 focus:outline-none"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};