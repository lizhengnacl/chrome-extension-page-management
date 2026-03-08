/**
 * Pop-up界面入口组件
 * 用于收藏当前页面，支持多级标签和多归属分组
 */

import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast, showToast } from './components/ui/Toast';
import { TagInput } from './components/TagInput';
import { GroupSelector } from './components/GroupSelector';
import { StorageWarning } from './components/StorageWarning';
import { pageStorage, groupStorage, getStorageUsage } from './storage';
import { getCurrentTab, isSpecialPage, getFaviconUrl } from './utils';
import type { Page } from './types';

const Popup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    favicon: '',
    tags: [] as string[],
    groups: [] as string[],
  });

  // 初始化：获取当前页面信息
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const tab = await getCurrentTab();
    if (tab?.url && tab.title) {
      if (isSpecialPage(tab.url)) {
        setIsSpecial(true);
      } else {
        setFormData(prev => ({
          ...prev,
          url: tab.url || '',
          title: tab.title || '',
          favicon: tab.favIconUrl || getFaviconUrl(tab.url || ''),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url || !formData.title) {
      showToast('请填写完整信息', 'error');
      return;
    }

    // 如果没有选择分组，自动添加到"未分类"
    const groups = formData.groups.length > 0 ? formData.groups : ['default'];

    setIsLoading(true);
    try {
      const result = await pageStorage.add({
        url: formData.url,
        title: formData.title,
        favicon: formData.favicon,
        tags: formData.tags,
        groups,
      });

      if (result) {
        showToast('页面收藏成功！', 'success');
        // 清空表单
        setFormData({
          url: '',
          title: '',
          favicon: '',
          tags: [],
          groups: [],
        });
        // 重新初始化
        setTimeout(() => init(), 500);
      } else {
        showToast('该链接已在本分组中存在', 'error');
      }
    } catch (error) {
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 特殊页面提示
  if (isSpecial) {
    return (
      <div className="w-[360px] p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">此页面不支持收藏</h2>
          <p className="text-sm text-gray-500">
            Chrome浏览器限制了对特殊页面（如 chrome:// 或 file://）的访问。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] max-h-[600px] overflow-y-auto">
      {/* 头部 */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">收藏页面</h1>
        </div>
      </div>

      {/* 存储警告 */}
      <div className="px-4 pt-3">
        <StorageWarning />
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* URL */}
        <Input
          label="页面链接"
          value={formData.url}
          onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://example.com"
          readOnly
        />

        {/* 标题 */}
        <Input
          label="页面标题"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="页面标题"
        />

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标签
          </label>
          <TagInput
            value={formData.tags}
            onChange={tags => setFormData(prev => ({ ...prev, tags }))}
          />
        </div>

        {/* 分组 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所属分组
          </label>
          <GroupSelector
            value={formData.groups}
            onChange={groups => setFormData(prev => ({ ...prev, groups }))}
          />
        </div>

        {/* 提交按钮 */}
        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          保存收藏
        </Button>
      </form>

      {/* 提示信息 */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-400 text-center">
          按 Ctrl+Shift+S 可快速打开收藏面板
        </p>
      </div>
    </div>
  );
};

export default Popup;