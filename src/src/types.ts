/**
 * 类型定义模块
 * 定义页面、标签、分组等核心数据结构的类型
 */

/** 页面数据结构 */
export type PageTitleSource = 'captured' | 'manual' | 'auto';

export interface Page {
  id: string;
  url: string;
  title: string;
  titleSource?: PageTitleSource; // 标题来源：初次捕获、用户手动编辑或自动修复
  titleUpdatedAt?: number;
  favicon: string;
  tags: string[]; // 多级标签路径数组，如 ["技术/AI", "工具"]
  groups: string[]; // 所属分组ID数组
  order: number; // 排序权重
  createdAt: number;
  updatedAt: number;
}

/** 标签节点结构（树形） */
export interface TagNode {
  id: string;
  name: string;
  path: string; // 完整路径，如 "技术/AI/大模型"
  order: number; // 排序权重
  children: TagNode[];
}

/** 分组结构 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  order: number; // 排序权重
  pinned: boolean; // 是否置顶
  createdAt: number;
}

/** 用户设置 */
export interface UserSettings {
  lastSyncAt: number;
  storageWarningShown: boolean;
  lastSelectedGroupId: string;
}

/** 存储数据结构 */
export interface StorageData {
  pages: Page[];
  groups: Group[];
  tags: TagNode[];
  settings: UserSettings;
}

/** Pop-up表单数据 */
export interface PopupFormData {
  url: string;
  title: string;
  favicon: string;
  tags: string[];
  groups: string[];
}

/** 搜索筛选条件 */
export interface FilterCriteria {
  keyword: string;
  tags: string[];
  groups: string[];
}

/** 编辑页面表单 */
export interface EditPageForm {
  title: string;
  tags: string[];
  groups: string[];
}

/** 存储用量信息 */
export interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
}
