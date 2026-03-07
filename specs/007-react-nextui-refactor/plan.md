# Chrome 页面管理插件 React + NextUI 重构技术实现方案
# Version: 1.0, Created: 2026-03-07

## 1. 技术上下文总结

### 1.1 技术选型
基于 spec.md 的需求，我们将采用以下技术栈：

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| NextUI | 2.x | UI 组件库 |
| Tailwind CSS | 3.x | 样式框架 |
| Vite | 5.x | 构建工具 |
| pnpm | latest | 包管理器 |
| Chrome Extension APIs | - | 浏览器扩展 API |

### 1.2 迁移策略
- **渐进式迁移**：保留原有代码，先建立新的 React 项目结构
- **功能保持**：100% 保留现有功能，不做任何功能增减
- **数据兼容**：保持现有数据结构不变，确保迁移前后数据兼容

---

## 2. "合宪性"审查

**重要说明**：本次重构需要修改 constitution.md 中的相关条款，具体修改如下：

### 2.1 需要修改的条款
- **第一条 1.2 (原生优先)**：原条款"不使用 React、Vue 等框架"将被修改为"使用 React 框架"
- **第一条 1.1 (YAGNI)**：在引入必要依赖的前提下，仍遵循此原则

### 2.2 仍需遵守的条款
- ✅ **用户体验铁律**：所有用户操作都必须有即时反馈
- ✅ **明确性原则**：所有异步操作都必须使用 try-catch 显式处理
- ✅ **Chrome API 优先原则**：使用 chrome.storage.sync、chrome.tabs 等 API
- ✅ **单一职责原则**：组件化设计，每个组件只做好一件事
- ✅ **可访问性原则**：使用语义化 HTML，支持键盘导航

---

## 3. 项目结构细化

### 3.1 完整目录结构
```
chrome-extension-page-management/
├── src/
│   ├── components/              # React 组件
│   │   ├── common/             # 通用组件
│   │   │   ├── Button.tsx      # 按钮组件（封装 NextUI Button）
│   │   │   ├── Input.tsx       # 输入框组件（封装 NextUI Input）
│   │   │   ├── Modal.tsx       # 模态框组件（封装 NextUI Modal）
│   │   │   ├── Card.tsx        # 卡片组件
│   │   │   └── Tag.tsx         # 标签组件
│   │   ├── popup/              # Popup 页面组件
│   │   │   ├── PageInfo.tsx    # 页面信息展示
│   │   │   ├── TagSelector.tsx # 标签选择器
│   │   │   └── GroupSelector.tsx # 分组选择器
│   │   └── newtab/             # Newtab 页面组件
│   │       ├── Sidebar.tsx     # 侧边栏
│   │       ├── TagList.tsx     # 标签列表
│   │       ├── FavoritesSection.tsx # 常用页面区域
│   │       ├── GroupsSection.tsx    # 分组区域
│   │       ├── PageItem.tsx    # 页面项
│   │       └── PageList.tsx    # 页面列表
│   ├── pages/                  # 页面入口
│   │   ├── Popup.tsx           # Popup 页面
│   │   └── Newtab.tsx          # Newtab 页面
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useStorage.ts       # 数据存储 Hook
│   │   ├── usePages.ts         # 页面管理 Hook
│   │   ├── useGroups.ts        # 分组管理 Hook
│   │   └── useTags.ts          # 标签管理 Hook
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts          # 存储工具（迁移自 lib/storage.js）
│   │   ├── constants.ts        # 常量（迁移自 lib/constants.js）
│   │   ├── colors.ts           # 颜色（迁移自 lib/colors.js）
│   │   ├── icons.ts            # 图标（迁移自 lib/icons.js）
│   │   └── utils.ts            # 工具函数（迁移自 lib/utils.js）
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # 类型定义
│   ├── styles/                 # 样式文件
│   │   └── globals.css         # 全局样式
│   ├── providers/              # Context Providers
│   │   └── AppProvider.tsx     # 应用级 Provider
│   ├── popup.html              # Popup HTML 入口
│   ├── popup.tsx               # Popup React 入口
│   ├── newtab.html             # Newtab HTML 入口
│   └── newtab.tsx              # Newtab React 入口
├── public/                     # 静态资源
│   └── icons/                  # 插件图标
├── dist/                       # 构建输出目录
│   ├── popup.html
│   ├── popup.js
│   ├── popup.css
│   ├── newtab.html
│   ├── newtab.js
│   ├── newtab.css
│   └── icons/
├── legacy/                     # 原有代码（保留作为参考）
│   ├── newtab/
│   ├── popup/
│   ├── lib/
│   └── src/
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── manifest.json               # Chrome 插件配置
├── package.json                # 项目依赖
└── constitution.md             # 更新后的开发宪法
```

### 3.2 构建产物说明
Vite 将构建出以下文件：
- `dist/popup.html` + `dist/popup.js` + `dist/popup.css`
- `dist/newtab.html` + `dist/newtab.js` + `dist/newtab.css`
- `dist/icons/` - 插件图标

manifest.json 将指向这些构建产物。

---

## 4. 核心数据结构

### 4.1 保持不变的数据结构
为了确保数据兼容性，完全保持现有数据结构不变：

```typescript
// 页面数据结构
interface Page {
  id: string;
  url: string;
  title: string;
  favicon: string;
  groupId: string | null;
  tags: string[];
  isFavorite: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
}

// 分组数据结构
interface Group {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

// 标签数据结构
interface Tag {
  id: string;
  name: string;
  color: string;
}

// 完整存储数据结构
interface StorageData {
  pages: Page[];
  groups: Group[];
  tags: Tag[];
}
```

---

## 5. 接口设计

### 5.1 自定义 Hooks 接口

#### useStorage.ts
```typescript
interface UseStorageReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (data: T) => Promise<void>;
  updateData: (updater: (prev: T) => T) => Promise<void>;
}

function useStorage<T>(key: string, defaultValue: T): UseStorageReturn<T>;
```

#### usePages.ts
```typescript
interface UsePagesReturn {
  pages: Page[];
  loading: boolean;
  error: string | null;
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePage: (id: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  reorderPages: (groupId: string | null, newOrder: string[]) => Promise<void>;
}

function usePages(): UsePagesReturn;
```

#### useGroups.ts
```typescript
interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  addGroup: (name: string) => Promise<void>;
  updateGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  reorderGroups: (newOrder: string[]) => Promise<void>;
  openAllPagesInGroup: (groupId: string) => Promise<void>;
}

function useGroups(): UseGroupsReturn;
```

#### useTags.ts
```typescript
interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  addTag: (name: string, color?: string) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
}

function useTags(): UseTagsReturn;
```

### 5.2 组件 Props 接口

#### PageItem.tsx
```typescript
interface PageItemProps {
  page: Page;
  onEdit: (page: Page) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}
```

#### TagSelector.tsx
```typescript
interface TagSelectorProps {
  selectedTags: string[];
  availableTags: Tag[];
  onChange: (tagIds: string[]) => void;
  onAddTag: (name: string) => Promise<void>;
}
```

---

## 6. NextUI 主题配置

### 6.1 主题配置文件 (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
import { nextui } from '@nextui-org/react';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    nextui({
      prefix: 'nextui',
      addCommonColors: true,
      defaultTheme: 'light',
      defaultExtendTheme: 'light',
      layout: {
        radius: {
          small: '6px',
          medium: '8px',
          large: '12px',
        },
        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
            },
            focus: '#3b82f6',
          },
        },
      },
    }),
  ],
}
```

### 6.2 NextUI Provider 配置
```tsx
import { NextUIProvider } from '@nextui-org/react';

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
}
```

---

## 7. 实现阶段划分

### 阶段 1：项目初始化与配置
- 更新 constitution.md
- 初始化 Vite + React 项目结构
- 安装依赖（React、NextUI、Tailwind CSS 等）
- 配置 Vite、Tailwind、PostCSS
- 配置 NextUI 主题

### 阶段 2：基础设施迁移
- 迁移工具函数（lib/*.js → src/utils/*.ts）
- 实现自定义 Hooks（useStorage、usePages、useGroups、useTags）
- 创建通用组件封装（Button、Input、Modal 等）

### 阶段 3：Popup 页面重构
- 创建 Popup 页面组件
- 实现 PageInfo 组件
- 实现 TagSelector 组件
- 实现 GroupSelector 组件
- 集成所有功能并测试

### 阶段 4：Newtab 页面重构
- 创建 Newtab 页面布局
- 实现 Sidebar 组件
- 实现 FavoritesSection 组件
- 实现 GroupsSection 组件
- 实现 PageItem 和 PageList 组件
- 集成所有功能并测试

### 阶段 5：优化与测试
- 性能优化（代码分割、Tree Shaking）
- 完整功能测试
- 构建产物大小检查
- 加载时间测试
- 文档完善

---

## 8. Vite 配置详情

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        newtab: resolve(__dirname, 'src/newtab.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
```

---

## 9. 风险缓解措施

| 风险 | 缓解措施 |
|------|----------|
| 构建产物过大 | 1. 配置 Vite 代码分割<br>2. 按需引入 NextUI 组件<br>3. 使用生产模式构建<br>4. 启用 Tree Shaking |
| 加载时间变长 | 1. 优化组件渲染<br>2. 使用 React.memo 优化重渲染<br>3. 懒加载非关键组件<br>4. 压缩构建产物 |
| 功能回归 | 1. 保留原有代码作为参考<br>2. 逐功能迁移并测试<br>3. 使用相同的数据结构<br>4. 完整的回归测试 |
| 数据兼容性 | 1. 保持数据结构完全不变<br>2. 编写数据迁移测试<br>3. 提供数据备份功能 |
