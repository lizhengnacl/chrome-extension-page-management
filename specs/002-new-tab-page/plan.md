# Chrome 页面管理插件 - 新标签页技术实现方案

## 版本信息
- **版本**: 1.0
- **创建日期**: 2026-03-04
- **状态**: 待审核
- **关联规格**: [spec.md](./spec.md)

---

## 1. 技术上下文总结

### 1.1 技术栈选型

| 分类 | 技术选型 | 说明 |
|------|---------|------|
| **编程语言** | JavaScript (ES6+) | 原生 JavaScript，不使用框架 |
| **样式方案** | 原生 CSS | 简单直接，无额外依赖 |
| **包管理** | pnpm | 高效的包管理器 |
| **构建工具** | 无需构建 | Chrome 插件原生支持 |
| **数据存储** | chrome.storage.sync + chrome.storage.local | 页面数据用 sync，缩略图和本地设置用 local |
| **浏览器 API** | Chrome Extension APIs | tabs, storage, action, contextMenus |

### 1.2 核心设计原则
- **零依赖**: 除 Chrome API 外，不引入任何第三方库
- **模块化**: 按单一职责原则拆分文件
- **原生优先**: 充分利用 Chrome 原生能力
- **响应快速**: 优化性能，确保 < 500ms 加载

---

## 2. 合宪性审查

### 2.1 第一条：简单性原则 (Simplicity First) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 1.1 YAGNI | ✅ 符合 | 只实现规格书中明确要求的功能，无过度设计 |
| 1.2 原生优先 | ✅ 符合 | 使用原生 JavaScript 和 Chrome API，不使用 React/Vue |
| 1.3 反过度工程 | ✅ 符合 | 采用简单函数和数据结构，避免复杂设计模式 |

### 2.2 第二条：用户体验铁律 (User Experience Imperative) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 2.1 即时反馈 | ✅ 符合 | 所有操作提供成功/加载/错误提示 |
| 2.2 快速访问 | ✅ 符合 | 优化新标签页加载，目标 < 500ms |
| 2.3 直观操作 | ✅ 符合 | 界面设计遵循直觉，无学习曲线 |

### 2.3 第三条：明确性原则 (Clarity and Explicitness) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 3.1 错误处理 | ✅ 符合 | 所有异步操作使用 try-catch，错误提示友好 |
| 3.2 状态管理 | ✅ 符合 | 使用简单状态对象，变更可追踪 |
| 3.3 注释的意义 | ✅ 符合 | 注释解释"为什么"，关键逻辑有清晰说明 |

### 2.4 第四条：Chrome API 优先原则 (Chrome API First) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 4.1 数据持久化 | ✅ 符合 | 使用 chrome.storage.sync 存储页面数据，chrome.storage.local 存储缩略图 |
| 4.2 标签页操作 | ✅ 符合 | 使用 chrome.tabs.captureVisibleTab 获取缩略图 |
| 4.3 插件管理 | ✅ 符合 | 使用 chrome.action API，通过 manifest 配置新标签页 |

### 2.5 第五条：单一职责原则 (Single Responsibility) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 5.1 文件内聚 | ✅ 符合 | thumbnail-manager.js 只负责缩略图，drag-drop.js 只负责拖拽 |
| 5.2 组件化 | ✅ 符合 | UI 按功能拆分为独立组件（仪表盘、页面列表、设置面板等） |

### 2.6 第六条：可访问性原则 (Accessibility) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 6.1 语义化 HTML | ✅ 符合 | 使用语义化标签，便于屏幕阅读器 |
| 6.2 键盘导航 | ✅ 符合 | 所有功能支持键盘操作 |
| 6.3 ARIA 标签 | ✅ 符合 | 必要时使用 ARIA 增强可访问性 |

---

## 3. 项目结构细化

### 3.1 目录结构

```
chrome-extension-page-management/
├── manifest.json                      # 插件配置文件（需更新）
├── icons/                             # 插件图标
├── popup/                             # 弹出窗口（保持不变）
├── newtab/                            # 新增：新标签页
│   ├── newtab.html                   # 新标签页主页面
│   ├── newtab.css                    # 新标签页样式
│   └── newtab.js                     # 新标签页主逻辑
├── background/                        # 后台脚本（需更新）
│   └── background.js
├── js/                                # 共享 JavaScript 模块
│   ├── storage.js                    # 数据存储层（需扩展）
│   ├── page-manager.js               # 页面管理业务逻辑（复用）
│   ├── folder-manager.js             # 分组管理业务逻辑（复用）
│   ├── search.js                     # 搜索功能（复用）
│   ├── import-export.js              # 导入导出功能（复用）
│   ├── utils.js                      # 工具函数（复用）
│   ├── thumbnail-manager.js          # 新增：缩略图管理
│   ├── local-storage.js              # 新增：本地存储封装
│   ├── drag-drop.js                  # 新增：拖拽功能
│   ├── batch-operations.js           # 新增：批量操作
│   ├── dashboard.js                  # 新增：统计仪表盘
│   └── search-history.js             # 新增：搜索历史
└── css/                               # 共享样式
    └── common.css                    # 通用样式
```

### 3.2 文件职责说明

| 文件路径 | 职责 |
|---------|------|
| `manifest.json` | 插件配置，添加 chrome_url_overrides 配置新标签页 |
| `newtab/newtab.html` | 新标签页的 HTML 结构 |
| `newtab/newtab.css` | 新标签页的样式 |
| `newtab/newtab.js` | 新标签页的 UI 交互和状态管理 |
| `background/background.js` | 扩展：添加缩略图生成的后台任务 |
| `js/storage.js` | 保持不变，继续负责 chrome.storage.sync |
| `js/local-storage.js` | 新增：chrome.storage.local 的封装 |
| `js/thumbnail-manager.js` | 新增：缩略图的生成、存储、更新管理 |
| `js/drag-drop.js` | 新增：拖拽排序、移动分组、创建分组 |
| `js/batch-operations.js` | 新增：批量删除、移动、添加标签、导出 |
| `js/dashboard.js` | 新增：统计数据计算和仪表盘渲染 |
| `js/search-history.js` | 新增：搜索历史记录和管理 |

---

## 4. 核心数据结构

### 4.1 缩略图数据结构 (Thumbnail)

```javascript
{
  pageId: "page_1234567890",
  thumbnailUrl: "data:image/png;base64,...",
  createdAt: "2026-03-04T10:00:00.000Z",
  updatedAt: "2026-03-04T15:30:00.000Z"
}
```

### 4.2 搜索历史数据结构 (SearchHistory)

```javascript
{
  query: "工作资料",
  searchedAt: "2026-03-04T16:00:00.000Z"
}
```

### 4.3 新标签页设置数据结构 (NewTabSettings)

```javascript
{
  defaultView: "grouped",
  groupExpanded: true,
  visibleColumns: ["thumbnail", "title", "url", "folder", "tags", "visitCount", "lastVisitedAt"],
  sortBy: "lastVisitedAt",
  sortOrder: "desc",
  showDashboard: true
}
```

### 4.4 整体本地存储结构 (chrome.storage.local)

```javascript
{
  thumbnails: [/* Thumbnail 数组 */],
  searchHistory: [/* SearchHistory 数组，最多保留 50 条 */],
  newTabSettings: {/* NewTabSettings 对象 */}
}
```

---

## 5. 接口设计

### 5.1 本地存储接口 (local-storage.js)

```javascript
// 获取所有本地数据
async function getAllLocalData()

// 保存所有本地数据
async function saveAllLocalData(data)

// 获取缩略图列表
async function getThumbnails()

// 保存缩略图列表
async function saveThumbnails(thumbnails)

// 获取单个缩略图
async function getThumbnail(pageId)

// 保存单个缩略图
async function saveThumbnail(thumbnail)

// 删除缩略图
async function deleteThumbnail(pageId)

// 获取搜索历史
async function getSearchHistory()

// 保存搜索历史
async function saveSearchHistory(history)

// 添加搜索历史记录
async function addSearchHistoryItem(query)

// 获取新标签页设置
async function getNewTabSettings()

// 保存新标签页设置
async function saveNewTabSettings(settings)
```

### 5.2 缩略图管理接口 (thumbnail-manager.js)

```javascript
// 生成页面缩略图
async function generateThumbnail(tabId)

// 获取页面缩略图（优先从缓存获取）
async function getPageThumbnail(pageId, pageUrl)

// 手动更新缩略图
async function refreshThumbnail(pageId, tabId)

// 定期更新缩略图（后台任务）
async function scheduleThumbnailUpdate()

// 获取 favicon 作为降级方案
function getFaviconUrl(pageUrl)
```

### 5.3 拖拽功能接口 (drag-drop.js)

```javascript
// 初始化拖拽功能
function initDragDrop(container, options)

// 处理拖拽开始
function handleDragStart(event, pageId)

// 处理拖拽结束
function handleDragEnd(event)

// 处理放置
function handleDrop(event, targetFolderId)

// 更新页面排序
async function reorderPages(pageIds, newOrder)

// 移动页面到分组
async function movePageToFolder(pageId, folderId)

// 创建新分组并移动页面
async function createFolderWithPage(folderName, pageId)
```

### 5.4 批量操作接口 (batch-operations.js)

```javascript
// 批量删除页面
async function batchDeletePages(pageIds)

// 批量移动页面到分组
async function batchMoveToFolder(pageIds, folderId)

// 批量添加标签
async function batchAddTags(pageIds, tags)

// 批量导出页面
function batchExportPages(pageIds, pages)

// 获取选中的页面
function getSelectedPages(pageIds, allPages)
```

### 5.5 仪表盘接口 (dashboard.js)

```javascript
// 计算统计数据
function calculateStats(pages, folders)

// 获取今日访问次数
function getTodayVisitCount(pages)

// 获取本周访问次数
function getWeekVisitCount(pages)

// 获取最常访问的 TOP 10
function getTopVisitedPages(pages, limit = 10)

// 获取最近保存的页面
function getRecentSavedPages(pages, limit = 10)

// 获取所有标签
function getAllTags(pages)

// 渲染仪表盘
function renderDashboard(stats, container)
```

### 5.6 搜索历史接口 (search-history.js)

```javascript
// 添加搜索记录
async function addSearchQuery(query)

// 获取搜索建议（基于历史和标签、分组）
function getSearchSuggestions(query, pages, folders)

// 清除搜索历史
async function clearSearchHistory()

// 获取最近搜索（最多 10 条）
function getRecentSearches(history, limit = 10)
```

---

## 6. 实现阶段规划

### 阶段 1: 基础框架搭建
- [ ] 更新 manifest.json，添加 chrome_url_overrides
- [ ] 创建 newtab/ 目录结构
- [ ] 创建 newtab.html 基础结构
- [ ] 创建 local-storage.js
- [ ] 实现新标签页基础 UI 框架

### 阶段 2: 页面列表展示
- [ ] 复用 popup 的页面列表逻辑
- [ ] 实现列表布局
- [ ] 实现可配置显示列
- [ ] 实现分组折叠/展开
- [ ] 实现最近访问优先排序

### 阶段 3: 缩略图功能
- [ ] 创建 thumbnail-manager.js
- [ ] 实现 chrome.tabs.captureVisibleTab 调用
- [ ] 实现缩略图存储（localStorage）
- [ ] 实现缩略图渐进式加载
- [ ] 实现 favicon 降级方案
- [ ] 实现手动更新缩略图功能

### 阶段 4: 拖拽功能
- [ ] 创建 drag-drop.js
- [ ] 实现拖拽排序
- [ ] 实现拖拽到分组
- [ ] 实现拖拽创建新分组

### 阶段 5: 批量操作
- [ ] 创建 batch-operations.js
- [ ] 实现多选复选框
- [ ] 实现批量删除
- [ ] 实现批量移动分组
- [ ] 实现批量添加标签
- [ ] 实现批量导出

### 阶段 6: 统计仪表盘
- [ ] 创建 dashboard.js
- [ ] 实现统计数据计算
- [ ] 实现仪表盘 UI
- [ ] 展示 TOP 10 页面
- [ ] 展示最近保存页面

### 阶段 7: 搜索优化
- [ ] 创建 search-history.js
- [ ] 实现大搜索框 UI
- [ ] 实现搜索历史记录
- [ ] 实现搜索建议/自动补全

### 阶段 8: 设置面板
- [ ] 实现设置面板 UI
- [ ] 实现默认视图配置
- [ ] 实现显示列配置
- [ ] 实现设置保存和即时生效

### 阶段 9: 优化和体验
- [ ] 性能优化（< 500ms 加载）
- [ ] 缩略图加载优化
- [ ] 错误处理完善
- [ ] 可访问性增强
- [ ] UI 美化

---

## 7. 验收标准

参见 [spec.md 第 4 节](./spec.md#4-验收标准)

---

## 8. 风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| chrome.storage.local 配额限制 | 缩略图存储受限 | 压缩缩略图，限制尺寸，定期清理旧缩略图 |
| 缩略图生成失败 | 用户体验下降 | 提供 favicon 作为降级方案，显示占位图 |
| 拖拽性能问题 | 大量页面时卡顿 | 实现虚拟滚动，限制同时拖拽数量 |
| 新标签页加载慢 | 用户体验差 | 优化渲染，缩略图渐进式加载，使用缓存 |
| 隐私问题 | 用户担忧 | 明确告知缩略图仅存储在本地，不上传 |

---

## 9. 合宪性声明

本技术方案已通过合宪性审查，完全符合 [constitution.md](../../constitution.md) 中的所有原则。
