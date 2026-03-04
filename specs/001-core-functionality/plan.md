# Chrome 页面管理插件 - 核心功能技术实现方案

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
| **数据存储** | chrome.storage.sync | 跨设备同步，符合宪法要求 |
| **浏览器 API** | Chrome Extension APIs | tabs, action, storage, contextMenus |

### 1.2 核心设计原则
- **零依赖**: 除 Chrome API 外，不引入任何第三方库
- **模块化**: 按单一职责原则拆分文件
- **原生优先**: 充分利用 Chrome 原生能力
- **响应快速**: 优化性能，确保 < 100ms 加载

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
| 2.2 快速访问 | ✅ 符合 | 优化 popup 加载，目标 < 100ms |
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
| 4.1 数据持久化 | ✅ 符合 | 使用 chrome.storage.sync，不使用 localStorage |
| 4.2 标签页操作 | ✅ 符合 | 使用 chrome.tabs API 获取当前页面 |
| 4.3 插件管理 | ✅ 符合 | 使用 chrome.action API 管理图标和 popup |

### 2.5 第五条：单一职责原则 (Single Responsibility) ✅

| 子条款 | 符合情况 | 说明 |
|--------|---------|------|
| 5.1 文件内聚 | ✅ 符合 | storage.js 只负责存储，ui.js 只负责渲染 |
| 5.2 组件化 | ✅ 符合 | UI 按功能拆分为独立组件 |

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
├── manifest.json              # 插件配置文件
├── icons/                     # 插件图标
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # 弹出窗口
│   ├── popup.html            # popup 主页面
│   ├── popup.css             # popup 样式
│   └── popup.js              # popup 主逻辑
├── background/                # 后台脚本
│   └── background.js         # 后台服务逻辑
├── js/                        # 共享 JavaScript 模块
│   ├── storage.js            # 数据存储层
│   ├── page-manager.js       # 页面管理业务逻辑
│   ├── folder-manager.js     # 分组管理业务逻辑
│   ├── search.js             # 搜索功能
│   ├── import-export.js      # 导入导出功能
│   └── utils.js              # 工具函数
└── css/                       # 共享样式
    └── common.css            # 通用样式
```

### 3.2 文件职责说明

| 文件路径 | 职责 |
|---------|------|
| `manifest.json` | 插件配置，声明权限和脚本 |
| `popup/popup.html` | popup 的 HTML 结构 |
| `popup/popup.css` | popup 的样式 |
| `popup/popup.js` | popup 的 UI 交互和状态管理 |
| `background/background.js` | 右键菜单、快捷键、后台任务 |
| `js/storage.js` | chrome.storage.sync 的封装 |
| `js/page-manager.js` | 页面 CRUD 业务逻辑 |
| `js/folder-manager.js` | 分组 CRUD 业务逻辑 |
| `js/search.js` | 页面搜索算法 |
| `js/import-export.js` | 数据导入导出 |
| `js/utils.js` | 通用工具函数 |

---

## 4. 核心数据结构

### 4.1 页面数据结构 (Page)

```javascript
{
  id: "page_1234567890",           // 唯一标识符，使用 page_ + 时间戳
  url: "https://example.com",       // 页面 URL
  title: "示例网站",                 // 页面标题
  tags: ["工作", "参考"],           // 标签数组
  notes: "这是一个示例备注",         // 备注信息
  folderId: "folder_123",           // 所属分组 ID，null 表示无分组
  visitCount: 5,                     // 访问次数
  createdAt: "2026-03-04T10:00:00.000Z",  // 创建时间
  updatedAt: "2026-03-04T15:30:00.000Z",  // 最后更新时间
  lastVisitedAt: "2026-03-04T14:20:00.000Z" // 最后访问时间
}
```

### 4.2 分组数据结构 (Folder)

```javascript
{
  id: "folder_123",                 // 唯一标识符，使用 folder_ + 时间戳
  name: "工作资料",                  // 分组名称
  createdAt: "2026-03-04T09:00:00.000Z",  // 创建时间
  updatedAt: "2026-03-04T10:00:00.000Z"   // 最后更新时间
}
```

### 4.3 设置数据结构 (Settings)

```javascript
{
  defaultFolder: null,              // 默认分组 ID
  showVisitCount: true,             // 是否显示访问次数
  sortBy: "lastVisitedAt",          // 排序字段: createdAt | lastVisitedAt | visitCount | title
  sortOrder: "desc",                // 排序方向: asc | desc
  theme: "light"                    // 主题: light | dark
}
```

### 4.4 整体存储结构

```javascript
{
  pages: [/* Page 数组 */],
  folders: [/* Folder 数组 */],
  settings: {/* Settings 对象 */},
  deletedPages: [/* 待撤销删除的 Page 数组，保留 5 秒 */]
}
```

---

## 5. 接口设计

### 5.1 存储层接口 (storage.js)

```javascript
// 获取所有数据
async function getAllData()

// 保存所有数据
async function saveAllData(data)

// 获取页面列表
async function getPages()

// 保存页面列表
async function savePages(pages)

// 获取分组列表
async function getFolders()

// 保存分组列表
async function saveFolders(folders)

// 获取设置
async function getSettings()

// 保存设置
async function saveSettings(settings)
```

### 5.2 页面管理接口 (page-manager.js)

```javascript
// 添加新页面
async function addPage(pageData)

// 更新页面
async function updatePage(pageId, updates)

// 删除页面（支持撤销）
async function deletePage(pageId)

// 撤销删除
async function undoDeletePage()

// 获取单个页面
async function getPage(pageId)

// 打开页面（记录访问）
async function openPage(pageId)

// 按条件筛选页面
function filterPages(pages, { folderId, tag, searchQuery })

// 排序页面
function sortPages(pages, { sortBy, sortOrder })
```

### 5.3 分组管理接口 (folder-manager.js)

```javascript
// 添加分组
async function addFolder(name)

// 更新分组
async function updateFolder(folderId, name)

// 删除分组
async function deleteFolder(folderId)

// 获取单个分组
async function getFolder(folderId)
```

### 5.4 搜索接口 (search.js)

```javascript
// 搜索页面
function searchPages(pages, query)

// 计算匹配分数（内部函数）
function calculateMatchScore(page, query)
```

### 5.5 导入导出接口 (import-export.js)

```javascript
// 导出数据为 JSON
function exportData(data)

// 从 JSON 导入数据
async function importData(jsonData)

// 从 Chrome 书签导入
async function importFromBookmarks()
```

### 5.6 工具函数接口 (utils.js)

```javascript
// 生成唯一 ID
function generateId(prefix)

// 格式化日期
function formatDate(dateString)

// 验证 URL
function isValidUrl(string)

// 防抖函数
function debounce(func, wait)

// 显示通知
function showNotification(message, type = 'info')
```

---

## 6. 实现阶段规划

### 阶段 1: 基础框架搭建 (MVP)
- [ ] 创建项目结构
- [ ] 编写 manifest.json
- [ ] 实现 storage.js
- [ ] 实现基础 popup UI

### 阶段 2: 核心页面管理
- [ ] 实现 page-manager.js
- [ ] 实现添加/编辑/删除页面
- [ ] 实现撤销删除功能
- [ ] 实现 popup 页面列表

### 阶段 3: 分组和标签
- [ ] 实现 folder-manager.js
- [ ] 实现分组管理 UI
- [ ] 实现标签功能

### 阶段 4: 搜索和排序
- [ ] 实现 search.js
- [ ] 实现搜索框 UI
- [ ] 实现排序功能

### 阶段 5: 快捷操作
- [ ] 实现 background.js
- [ ] 实现右键菜单
- [ ] 实现快捷键

### 阶段 6: 数据同步与导入导出
- [ ] 实现 import-export.js
- [ ] 实现导入导出 UI
- [ ] 验证 chrome.storage.sync 同步

### 阶段 7: 优化和体验
- [ ] 性能优化（< 100ms 加载）
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
| chrome.storage.sync 配额限制 | 数据存储受限 | 压缩数据，提醒用户清理 |
| 跨设备同步延迟 | 用户体验下降 | 提供本地缓存，显示同步状态 |
| 大量数据性能问题 | 搜索/加载慢 | 实现虚拟滚动，优化搜索算法 |
| 浏览器兼容性 | 功能不可用 | 明确支持 Chrome 88+ |

---

## 9. 合宪性声明

本技术方案已通过合宪性审查，完全符合 [constitution.md](../../constitution.md) 中的所有原则。
