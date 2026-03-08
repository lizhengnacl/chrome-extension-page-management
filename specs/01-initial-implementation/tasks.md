# Chrome 页面管理插件 - 任务列表

## 任务说明
- [P] 标记表示该任务可以与其他任务并行执行
- 任务按照依赖关系排序，必须按顺序执行
- 采用 TDD 原则：先写测试，再写实现

---

## 阶段一：项目初始化

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T1-01 | 初始化 Vite + React + TypeScript 项目 | - | [P] |
| T1-02 | 配置 package.json，添加项目依赖 | T1-01 | - |
| T1-03 | 配置 tsconfig.json | T1-01 | [P] |
| T1-04 | 配置 vite.config.ts 支持 Chrome Extension | T1-01 | [P] |
| T1-05 | 创建 manifest.json 配置文件 | T1-01 | [P] |
| T1-06 | 创建项目基础目录结构 | T1-01 | [P] |
| T1-07 | 创建公共图标文件 (icon16.png, icon48.png, icon128.png) | T1-01 | [P] |
| T1-08 | 安装项目依赖 (pnpm install) | T1-02 | - |

---

## 阶段二：核心数据层

### 2.1 类型定义

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T2-01 | 创建 src/types/index.ts，定义 Page、Tag、Group、AppState、StorageData 接口 | T1-08 | - |

### 2.2 工具函数 (先测试后实现)

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T2-02 | 编写 validation.ts 的测试文件 | T2-01 | [P] |
| T2-03 | 实现 validation.ts (validateUrl, validatePage) | T2-02 | - |
| T2-04 | 编写 favicon.ts 的测试文件 | T2-01 | [P] |
| T2-05 | 实现 favicon.ts (getFaviconUrl, getDefaultFavicon) | T2-04 | - |
| T2-06 | 编写 storage.ts 的测试文件 | T2-01 | [P] |
| T2-07 | 实现 storage.ts (getStorageData, saveStorageData, updatePages, updateTags, updateGroups) | T2-06 | - |
| T2-08 | 编写 bookmark.ts 的测试文件 | T2-01, T2-03 | [P] |
| T2-09 | 实现 bookmark.ts (importFromBookmarks) | T2-08 | - |

### 2.3 自定义 Hooks

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T2-10 | 编写 useStorage.ts 的测试文件 | T2-07 | [P] |
| T2-11 | 实现 useStorage.ts Hook | T2-10 | - |
| T2-12 | 编写 usePages.ts 的测试文件 | T2-11 | [P] |
| T2-13 | 实现 usePages.ts Hook | T2-12 | - |
| T2-14 | 编写 useTags.ts 的测试文件 | T2-11 | [P] |
| T2-15 | 实现 useTags.ts Hook | T2-14 | - |
| T2-16 | 编写 useGroups.ts 的测试文件 | T2-11, T2-13 | [P] |
| T2-17 | 实现 useGroups.ts Hook | T2-16 | - |

---

## 阶段三：公共组件

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T3-01 | 创建 src/styles/globals.css 全局样式 | T1-06 | [P] |
| T3-02 | 实现 LoadingSpinner.tsx 组件 | T3-01 | [P] |
| T3-03 | 编写 PageCard.tsx 的测试文件 | T2-01, T3-02 | [P] |
| T3-04 | 实现 PageCard.tsx 组件 | T3-03 | - |
| T3-05 | 编写 TagTree.tsx 的测试文件 | T2-15, T3-02 | [P] |
| T3-06 | 实现 TagTree.tsx 组件 (递归标签树) | T3-05 | - |
| T3-07 | 编写 GroupList.tsx 的测试文件 | T2-17, T3-02 | [P] |
| T3-08 | 实现 GroupList.tsx 组件 | T3-07 | - |

---

## 阶段四：Popup 页面

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T4-01 | 创建 Popup 入口 HTML 文件 | T1-06 | [P] |
| T4-02 | 编写 AddPageForm.tsx 的测试文件 | T3-04, T2-13, T2-15 | [P] |
| T4-03 | 实现 AddPageForm.tsx 组件 (添加/编辑页面表单) | T4-02 | - |
| T4-04 | 编写 TagManager.tsx 的测试文件 | T3-06, T2-15 | [P] |
| T4-05 | 实现 TagManager.tsx 组件 | T4-04 | - |
| T4-06 | 编写 GroupManager.tsx 的测试文件 | T3-08, T2-17, T2-13 | [P] |
| T4-07 | 实现 GroupManager.tsx 组件 | T4-06 | - |
| T4-08 | 编写 Popup.tsx 的测试文件 | T4-03, T4-05, T4-07, T3-04 | [P] |
| T4-09 | 实现 Popup.tsx 主组件 | T4-08 | - |
| T4-10 | 配置 Popup 页面入口 | T4-01, T4-09 | - |

---

## 阶段五：Newtab 页面

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T5-01 | 创建 Newtab 入口 HTML 文件 | T1-06 | [P] |
| T5-02 | 编写 ShortcutGrid.tsx 的测试文件 | T3-04, T2-13 | [P] |
| T5-03 | 实现 ShortcutGrid.tsx 组件 (常用页面快捷方式网格) | T5-02 | - |
| T5-04 | 编写 Sidebar.tsx 的测试文件 | T3-06, T3-08, T2-15, T2-17 | [P] |
| T5-05 | 实现 Sidebar.tsx 组件 (左侧导航条) | T5-04 | - |
| T5-06 | 编写 PageList.tsx 的测试文件 | T3-04, T2-13 | [P] |
| T5-07 | 实现 PageList.tsx 组件 (带标签筛选的页面列表) | T5-06 | - |
| T5-08 | 编写 Newtab.tsx 的测试文件 | T5-03, T5-05, T5-07, T2-17 | [P] |
| T5-09 | 实现 Newtab.tsx 主组件 | T5-08 | - |
| T5-10 | 配置 Newtab 页面入口 | T5-01, T5-09 | - |

---

## 阶段六：Background Service Worker

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T6-01 | 实现 Background.ts Service Worker | T2-07 | - |

---

## 阶段七：集成与优化

| ID | 任务描述 | 依赖 | 并行 |
|----|---------|------|------|
| T7-01 | 集成书签导入功能 (首次使用引导) | T2-09, T4-09, T5-09 | - |
| T7-02 | 添加错误边界组件 | T4-09, T5-09 | [P] |
| T7-03 | 添加用户反馈提示 (成功/错误 Toast) | T4-09, T5-09 | [P] |
| T7-04 | 性能优化 (React.memo, useMemo, useCallback) | T3-04, T3-06, T3-08, T5-03, T5-07 | - |
| T7-05 | 可访问性优化 (语义化 HTML, ARIA 标签, 键盘导航) | T3-04, T3-06, T3-08, T4-09, T5-09 | - |
| T7-06 | 运行完整测试套件 | T2-03, T2-05, T2-07, T2-09, T2-11, T2-13, T2-15, T2-17 | - |
| T7-07 | 构建生产版本 | T7-06 | - |
| T7-08 | 验证插件加载和基本功能 | T7-07 | - |

---

## 验收检查清单

### Popup 页面验收
- [ ] 用户点击插件图标，能在 100ms 内打开 Popup 页面
- [ ] 用户能快速添加当前页面，自动填充 URL、标题和 favicon
- [ ] 用户能创建无限层级的标签树
- [ ] 用户能创建分组并将页面添加到分组

### Newtab 页面验收
- [ ] 新标签页能在 200ms 内加载完成
- [ ] 星标页面能在新标签页以网格形式展示
- [ ] 左侧导航条展示可折叠的标签树，点击能筛选页面
- [ ] 点击分组的"一键打开"按钮，能在新标签页打开分组内的所有页面

### 数据管理验收
- [ ] 数据能正确保存到 chrome.storage.sync
- [ ] 首次使用时能从 Chrome 书签导入数据
- [ ] 所有异步操作都有 try-catch 错误处理，无静默失败
