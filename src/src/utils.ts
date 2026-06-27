/**
 * 工具函数模块
 * 提供通用辅助函数和格式化工具
 */

/** 截断文本 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/** 格式化URL显示 */
export function formatUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/** 格式化文件大小 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/** 检查是否为特殊页面（不支持收藏） */
export function isSpecialPage(url: string): boolean {
  return url.startsWith('chrome://') ||
         url.startsWith('file://') ||
         url.startsWith('chrome-extension://') ||
         url.startsWith('edge://') ||
         url.startsWith('about:');
}

/** 防抖函数 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** 按标题字母顺序排序 */
export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    a.title.localeCompare(b.title, 'zh-CN', { sensitivity: 'base' })
  );
}

/** 规范化页面标题，避免保存不可见空白和多余换行 */
export function normalizePageTitle(title?: string): string {
  return (title || '').replace(/\s+/g, ' ').trim();
}

const GENERIC_PAGE_TITLES = new Set([
  'untitled',
  'no title',
  'loading',
  'new tab',
  'about:blank',
  '无标题',
  '加载中',
  '新标签页',
  '飞书云文档',
  '飞书文档',
  'lark docs',
  'lark doc',
  'feishu docs',
  'feishu doc',
]);

function getUrlTitleCandidates(url?: string): string[] {
  if (!url) return [];

  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    return [
      urlObj.href.toLowerCase(),
      host,
      `${host}${path}`.toLowerCase(),
    ];
  } catch {
    return [url.toLowerCase()];
  }
}

/** 判断标题是否过于泛化，不能作为自动覆盖依据 */
export function isLowQualityPageTitle(title?: string, url?: string): boolean {
  const normalized = normalizePageTitle(title);
  if (!normalized || normalized.length <= 1) return true;

  const lowerTitle = normalized.toLowerCase();
  if (GENERIC_PAGE_TITLES.has(lowerTitle)) return true;

  if (lowerTitle.startsWith('http://') || lowerTitle.startsWith('https://')) {
    return true;
  }

  return getUrlTitleCandidates(url).some(candidate => lowerTitle === candidate);
}

/**
 * 自动标题只允许修复低质量标题，不能覆盖用户已确认或已经可用的标题。
 */
export function shouldUseAutoPageTitle(
  currentTitle: string,
  nextTitle: string | undefined,
  url: string,
  titleSource?: 'captured' | 'manual' | 'auto'
): boolean {
  const normalizedNextTitle = normalizePageTitle(nextTitle);
  if (titleSource === 'manual') return false;
  if (isLowQualityPageTitle(normalizedNextTitle, url)) return false;
  if (!isLowQualityPageTitle(currentTitle, url)) return false;

  return normalizePageTitle(currentTitle) !== normalizedNextTitle;
}

/** 解析多级标签路径 */
export function parseTagPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

/** 构建标签路径 */
export function buildTagPath(parts: string[]): string {
  return parts.join('/');
}

/** 获取当前标签页信息 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  } catch {
    return null;
  }
}

/** 获取favicon URL */
export function getFaviconUrl(url: string): string {
  void url;
  return '';
}

/** 深拷贝 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** 数组去重 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** 延迟函数 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 规范化URL用于比较
 * 移除末尾斜杠、统一小写等，但保留path、query、hash的差异
 */
export function normalizeUrlForComparison(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // 移除末尾的斜杠（根路径除外）
    if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // 移除默认端口
    if ((urlObj.protocol === 'http:' && urlObj.port === '80') ||
        (urlObj.protocol === 'https:' && urlObj.port === '443')) {
      urlObj.port = '';
    }
    
    // 排序查询参数（可选，让参数顺序不影响比较）
    const params = new URLSearchParams(urlObj.searchParams);
    params.sort();
    urlObj.search = params.toString() ? `?${params.toString()}` : '';
    
    return urlObj.href;
  } catch {
    // 如果URL解析失败，返回原URL
    return url;
  }
}

/**
 * 判断两个URL是否视为同一页面
 * 完整比较：包括path、query、hash的差异
 */
export function isSamePage(url1: string, url2: string): boolean {
  const normalized1 = normalizeUrlForComparison(url1);
  const normalized2 = normalizeUrlForComparison(url2);
  return normalized1 === normalized2;
}
