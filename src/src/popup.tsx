/**
 * Pop-up界面入口组件
 * 用于收藏当前页面，支持多级标签和多归属分组
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast, showToast } from './components/ui/Toast';
import { TagInput, type TagInputRef } from './components/TagInput';
import { GroupSelector } from './components/GroupSelector';
import { StorageWarning } from './components/StorageWarning';
import { pageStorage, groupStorage, getStorageUsage } from './storage';
import { getCurrentTab, isSpecialPage, getFaviconUrl } from './utils';
import type { Page } from './types';
import IconSvg from '../icons/icon.svg';

const Popup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [shortcutSet, setShortcutSet] = useState(true);
  const [existingPage, setExistingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    favicon: '',
    tags: [] as string[],
    groups: [] as string[],
  });
  const tagInputRef = useRef<TagInputRef>(null);

  // 初始化：获取当前页面信息和检查快捷键设置
  useEffect(() => {
    init();
  }, []);

  const checkShortcut = async () => {
    try {
      const commands = await chrome.commands.getAll();
      const actionCommand = commands.find(cmd => cmd.name === '_execute_action');
      setShortcutSet(!!actionCommand?.shortcut);
    } catch (error) {
      console.error('检查快捷键失败:', error);
    }
  };

  const init = async () => {
    const tab = await getCurrentTab();
    if (tab?.url && tab.title) {
      if (isSpecialPage(tab.url)) {
        setIsSpecial(true);
      } else {
        const existing = await pageStorage.getByUrl(tab.url);
        setExistingPage(existing || null);
        
        if (existing) {
          setFormData({
            url: tab.url || '',
            title: existing.title,
            favicon: existing.favicon || tab.favIconUrl || getFaviconUrl(tab.url || ''),
            tags: existing.tags,
            groups: existing.groups,
          });
        } else {
          setFormData(prev => ({
            ...prev,
            url: tab.url || '',
            title: tab.title || '',
            favicon: tab.favIconUrl || getFaviconUrl(tab.url || ''),
          }));
        }
      }
    }
    checkShortcut();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTags = tagInputRef.current?.getAllTags() || formData.tags;
    tagInputRef.current?.flushInput();
    
    if (!formData.url || !formData.title) {
      showToast('请填写完整信息', 'error');
      return;
    }

    // 如果没有选择分组，自动添加到"未分类"
    const groups = formData.groups.length > 0 ? formData.groups : ['default'];

    setIsLoading(true);
    try {
      if (existingPage) {
        // 检查是否有变更
        const hasChanges = 
          existingPage.title !== formData.title ||
          JSON.stringify(existingPage.tags.sort()) !== JSON.stringify(finalTags.sort()) ||
          JSON.stringify(existingPage.groups.sort()) !== JSON.stringify(groups.sort());

        if (!hasChanges) {
          // 没有变更，直接关闭 popup
          window.close();
          return;
        }

        // 有变更，更新页面
        const result = await pageStorage.update(existingPage.id, {
          title: formData.title,
          tags: finalTags,
          groups,
        });

        if (result.success) {
          showToast('更新成功！', 'success');
          window.close();
        } else {
          showToast('更新失败，请重试', 'error');
        }
      } else {
        // 页面不存在，新增
        const result = await pageStorage.add({
          url: formData.url,
          title: formData.title,
          favicon: formData.favicon,
          tags: finalTags,
          groups,
        });

        if (result) {
          showToast('页面收藏成功！', 'success');
          window.close();
        } else {
          // 理论上不会出现，因为 init 时已经检查过了
          showToast('保存失败，请重试', 'error');
        }
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src={IconSvg} className="w-10 h-10" alt="Logo" />
          </div>
          <h1 className="text-lg font-semibold text-white">页集</h1>
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
            ref={tagInputRef}
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
        {shortcutSet ? (
          <p className="text-xs text-gray-400 text-center">
            按 {navigator.platform.toLowerCase().includes('mac') ? 'Command+Shift+S' : 'Ctrl+Shift+S'} 可快速打开页集
          </p>
        ) : (
          <div className="text-center">
            <p className="text-xs text-amber-600 mb-1">
              ⚠️ 快捷键未设置
            </p>
            <a
              href={`chrome://extensions/shortcuts`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              点击此处设置快捷键
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;