/*
 * 页面列表项组件
 * 显示页面信息并提供操作按钮
 */

import React, { useState } from 'react';
import { pageStorage, groupStorage } from '../storage';
import { formatUrl, truncate } from '../utils';
import type { Page, Group } from '../types';

interface PageListItemProps {
  page: Page;
  groups: Group[];
  onEdit: (page: Page) => void;
  onDelete: (pageId: string) => void;
  onRemoveFromGroup?: (pageId: string, groupId: string) => void;
  currentGroupId?: string;
  onRefresh: () => void;
}

export const PageListItem: React.FC<PageListItemProps> = ({
  page,
  groups,
  onEdit,
  onDelete,
  onRemoveFromGroup,
  currentGroupId,
  onRefresh,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    chrome.tabs.create({ url: page.url, active: false });
  };

  const handleRemoveFromGroup = async () => {
    if (currentGroupId && onRemoveFromGroup) {
      await onRemoveFromGroup(page.id, currentGroupId);
      onRefresh();
    }
  };

  const getGroupNames = () => {
    return page.groups
      .map(id => groups.find(g => g.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favicon */}
      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
        {page.favicon ? (
          <img
            src={page.favicon}
            alt=""
            className="w-6 h-6 object-contain"
            onError={e => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
        )}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate" title={page.title}>
          {truncate(page.title, 60)}
        </h3>
        <p className="text-sm text-gray-500 truncate" title={page.url}>
          {formatUrl(page.url, 50)}
        </p>
        
        {/* 标签和分组 */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {page.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {page.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                >
                  {truncate(tag, 20)}
                </span>
              ))}
              {page.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                  +{page.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {page.groups.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {getGroupNames()}
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={handleOpen}
          title="打开"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
        
        <button
          onClick={() => onEdit(page)}
          title="编辑"
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {currentGroupId && onRemoveFromGroup && (
          <button
            onClick={handleRemoveFromGroup}
            title="从分组中移除"
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        )}

        <button
          onClick={() => onDelete(page.id)}
          title="删除"
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};