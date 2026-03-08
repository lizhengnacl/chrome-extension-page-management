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
export function formatUrl(url: string, maxLength = 50): string {
  try {
    const urlObj = new URL(url);
    const simplified = `${urlObj.hostname}${urlObj.pathname}`;
    return truncate(simplified, maxLength);
  } catch {
    return truncate(url, maxLength);
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
  if (url.startsWith('http')) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=32`;
  }
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