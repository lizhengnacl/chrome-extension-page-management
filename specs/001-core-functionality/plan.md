# Chrome 页面管理插件 - 技术实现方案
# Version: 1.0, Created: 2026-03-05

---

## 1. 技术上下文总结

### 1.1 技术栈
- **语言**: JavaScript (ES6+)
- **框架**: 原生 JavaScript（不使用 React/Vue 等框架）
- **样式**: 原生 CSS
- **包管理**: pnpm
- **构建工具**: 无复杂构建，原生 Chrome 插件结构
- **浏览器 API**: chrome.tabs, chrome.storage.sync, chrome.action

### 1.2 项目目标
基于 `specs/001-core-functionality/spec.md` 的需求，实现一个功能完整、性能优异、用户体验良好的 Chrome 页面管理插件。

---

## 2. "合宪性"审查

逐条对照 `constitution.md` 进行审查：

### ✅ 第一条：简单性原则 (Simplicity First)
- **1.1 (YAGNI)**: 只实现 spec.md 中明确要求的功能，不添加额外功能
- **1.2 (原生优先)**: 使用原生 JavaScript 和 Chrome API，不引入第三方框架
- **1.3 (反过度工程)**: 使用简单的函数和数据结构，避免复杂设计模式

### ✅ 第二条：用户体验铁律 (User Experience Imperative)
- **2.1 (即时反馈)**: 所有操作都有视觉反馈（成功提示、加载状态、错误提示）
- **2.2 (快速访问)**: popup 响应时间 < 100ms，newtab 加载时间 < 300ms
- **2.3 (直观操作)**: 界面设计简洁直观，无需文档即可使用

### ✅ 第三条：明确性原则 (Clarity and Explicitness)
- **3.1 (错误处理)**: 所有异步操作使用 try-catch，友好错误提示
- **3.2 (状态管理)**: 使用简单状态对象，变更清晰可追踪
- **3.3 (注释的意义)**: 关键逻辑有清晰注释，解释"为什么"而非"是什么"

### ✅ 第四条：Chrome API 优先原则 (Chrome API First)
- **4.1 (数据持久化)**: 使用 chrome.storage.sync 实现跨设备同步
- **4.2 (标签页操作)**: 使用 chrome.tabs API 获取当前页面信息
- **4.3 (插件管理)**: 使用 chrome.action API 管理插件图标

### ✅ 第五条：单一职责原则 (Single Responsibility)
- **5.1 (文件内聚)**: 按功能拆分文件（storage.js, ui.js, utils.js 等）
- **5.2 (组件化)**: UI 按功能划分为独立组件

### ✅ 第六条：可访问性原则 (Accessibility)
- **6.1 (语义化 HTML)**: 使用语义化标签
- **6.2 (键盘导航)**: 所有功能支持键盘操作
- **6.3 (ARIA 标签)**: 必要时使用 ARIA 标签增强可访问性

---

## 3. 项目结构细化

```
chrome-extension-page-management/
├── manifest.json              # 插件配置文件
├── icons/                     # 插件图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # Popup 页面
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── newtab/                    # Newtab 页面
│   ├── newtab.html
│   ├── newtab.css
│   └── newtab.js
├── background/                # 后台脚本（如需要）
│   └── background.js
├── lib/                       # 共享库
│   ├── storage.js             # 数据存储模块
│   ├── utils.js               # 工具函数
│   └── constants.js           # 常量定义
└── specs/                     # 规格文档
    ├── plan.md
    └── 001-core-functionality/
        └── spec.md
```

### 文件职责说明

| 文件 | 职责 |
|------|------|
| `manifest.json` | 插件配置、权限声明 |
| `popup/popup.html` | Popup 页面结构 |
| `popup/popup.css` | Popup 页面样式 |
| `popup/popup.js` | Popup 页面逻辑 |
| `newtab/newtab.html` | Newtab 页面结构 |
| `newtab/newtab.css` | Newtab 页面样式 |
| `newtab/newtab.js` | Newtab 页面逻辑 |
| `lib/storage.js` | 数据读写、CRUD 操作 |
| `lib/utils.js` | 通用工具函数（ID 生成、日期处理等） |
| `lib/constants.js` | 常量定义（默认数据、配置等） |

---

## 4. 核心数据结构

### 4.1 Page（页面）
```javascript
{
  id: string,              // 唯一标识符，格式: page_{timestamp}_{random}
  url: string,             // 页面 URL
  title: string,           // 页面标题
  favicon: string,         // favicon URL
  groupId: string | null,  // 所属分组 ID，null 表示未分组
  tags: string[],          // 标签 ID 数组
  isFavorite: boolean,     // 是否标记为常用
  order: number,           // 排序顺序
  createdAt: number,       // 创建时间戳
  updatedAt: number        // 更新时间戳
}
```

### 4.2 Group（分组）
```javascript
{
  id: string,              // 唯一标识符，格式: group_{timestamp}_{random}
  name: string,            // 分组名称
  order: number,           // 排序顺序
  createdAt: number        // 创建时间戳
}
```

### 4.3 Tag（标签）
```javascript
{
  id: string,              // 唯一标识符，格式: tag_{timestamp}_{random}
  name: string,            // 标签名称
  color: string            // 标签颜色（十六进制）
}
```

### 4.4 Storage Root（存储根对象）
```javascript
{
  version: "1.0",
  pages: Page[],
  groups: Group[],
  tags: Tag[]
}
```

---

## 5. 接口设计

### 5.1 Storage 模块 (lib/storage.js)

#### 5.1.1 初始化
```javascript
/**
 * 初始化存储，确保有默认数据结构
 * @returns {Promise<void>}
 */
async function initStorage()
```

#### 5.1.2 Pages CRUD
```javascript
/**
 * 获取所有页面
 * @returns {Promise<Page[]>}
 */
async function getPages()

/**
 * 根据 ID 获取页面
 * @param {string} pageId
 * @returns {Promise<Page | null>}
 */
async function getPageById(pageId)

/**
 * 添加新页面
 * @param {Omit<Page, 'id' | 'createdAt' | 'updatedAt'>} page
 * @returns {Promise<Page>}
 */
async function addPage(page)

/**
 * 更新页面
 * @param {string} pageId
 * @param {Partial<Page>} updates
 * @returns {Promise<Page>}
 */
async function updatePage(pageId, updates)

/**
 * 删除页面
 * @param {string} pageId
 * @returns {Promise<void>}
 */
async function deletePage(pageId)

/**
 * 获取常用页面
 * @returns {Promise<Page[]>}
 */
async function getFavoritePages()

/**
 * 搜索页面
 * @param {string} keyword
 * @returns {Promise<Page[]>}
 */
async function searchPages(keyword)

/**
 * 根据分组 ID 获取页面
 * @param {string} groupId
 * @returns {Promise<Page[]>}
 */
async function getPagesByGroupId(groupId)

/**
 * 根据标签 ID 获取页面
 * @param {string} tagId
 * @returns {Promise<Page[]>}
 */
async function getPagesByTagId(tagId)
```

#### 5.1.3 Groups CRUD
```javascript
/**
 * 获取所有分组
 * @returns {Promise<Group[]>}
 */
async function getGroups()

/**
 * 添加新分组
 * @param {Omit<Group, 'id' | 'createdAt'>} group
 * @returns {Promise<Group>}
 */
async function addGroup(group)

/**
 * 更新分组
 * @param {string} groupId
 * @param {Partial<Group>} updates
 * @returns {Promise<Group>}
 */
async function updateGroup(groupId, updates)

/**
 * 删除分组（同时将该组下的页面 groupId 设为 null）
 * @param {string} groupId
 * @returns {Promise<void>}
 */
async function deleteGroup(groupId)
```

#### 5.1.4 Tags CRUD
```javascript
/**
 * 获取所有标签
 * @returns {Promise<Tag[]>}
 */
async function getTags()

/**
 * 添加新标签
 * @param {Omit<Tag, 'id'>} tag
 * @returns {Promise<Tag>}
 */
async function addTag(tag)

/**
 * 更新标签
 * @param {string} tagId
 * @param {Partial<Tag>} updates
 * @returns {Promise<Tag>}
 */
async function updateTag(tagId, updates)

/**
 * 删除标签（同时从所有页面的 tags 数组中移除该标签 ID）
 * @param {string} tagId
 * @returns {Promise<void>}
 */
async function deleteTag(tagId)
```

#### 5.1.5 导入导出
```javascript
/**
 * 导出数据为 JSON
 * @returns {Promise<string>} JSON 字符串
 */
async function exportData()

/**
 * 从 JSON 导入数据
 * @param {string} jsonString
 * @returns {Promise<void>}
 */
async function importData(jsonString)
```

### 5.2 Utils 模块 (lib/utils.js)

```javascript
/**
 * 生成唯一 ID
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix)

/**
 * 获取当前时间戳
 * @returns {number}
 */
function getTimestamp()

/**
 * 获取网站 favicon URL
 * @param {string} url
 * @returns {string}
 */
function getFaviconUrl(url)

/**
 * 下载 JSON 文件
 * @param {string} content
 * @param {string} filename
 */
function downloadJsonFile(content, filename)

/**
 * 读取上传的 JSON 文件
 * @param {File} file
 * @returns {Promise<string>}
 */
function readJsonFile(file)

/**
 * 显示提示消息
 * @param {string} message
 * @param {'success' | 'error' | 'info'} type
 */
function showToast(message, type)

/**
 * 显示确认对话框
 * @param {string} message
 * @returns {Promise<boolean>}
 */
function showConfirm(message)
```

### 5.3 Popup 页面事件处理

```javascript
// popup/popup.js
document.addEventListener('DOMContentLoaded', async () => {
  await initPopup()
})

async function initPopup() {
  // 1. 获取当前标签页信息
  // 2. 渲染添加表单
  // 3. 绑定事件
}

async function handleAddPage() {
  // 1. 获取表单数据
  // 2. 调用 storage.addPage()
  // 3. 显示成功提示
  // 4. 关闭 popup
}
```

### 5.4 Newtab 页面事件处理

```javascript
// newtab/newtab.js
document.addEventListener('DOMContentLoaded', async () => {
  await initNewtab()
})

async function initNewtab() {
  // 1. 初始化 storage
  // 2. 渲染常用页面
  // 3. 渲染分组列表
  // 4. 绑定事件
}

async function handleOpenGroup(groupId) {
  // 1. 获取分组下的所有页面
  // 2. 使用 chrome.tabs.create 打开
}

async function handleToggleFavorite(pageId) {
  // 1. 更新页面的 isFavorite 状态
  // 2. 重新渲染
}

async function handleSearch(keyword) {
  // 1. 调用 storage.searchPages()
  // 2. 渲染搜索结果
}

async function handleExport() {
  // 1. 调用 storage.exportData()
  // 2. 下载文件
}

async function handleImport(file) {
  // 1. 读取文件内容
  // 2. 调用 storage.importData()
  // 3. 重新渲染
}
```

---

## 6. 实现里程碑

### Milestone 1: 基础项目结构和存储模块
- [ ] 创建项目目录结构
- [ ] 编写 manifest.json
- [ ] 实现 lib/constants.js
- [ ] 实现 lib/utils.js
- [ ] 实现 lib/storage.js（核心 CRUD）

### Milestone 2: Popup 页面
- [ ] 实现 popup.html
- [ ] 实现 popup.css
- [ ] 实现 popup.js
- [ ] 测试添加页面功能

### Milestone 3: Newtab 页面 - 基础功能
- [ ] 实现 newtab.html 结构
- [ ] 实现 newtab.css 样式
- [ ] 实现 newtab.js 初始化
- [ ] 渲染分组和页面列表

### Milestone 4: Newtab 页面 - 高级功能
- [ ] 实现分组 CRUD
- [ ] 实现页面 CRUD
- [ ] 实现标签管理
- [ ] 实现常用页面功能
- [ ] 实现打开分组功能
- [ ] 实现搜索功能
- [ ] 实现拖拽排序

### Milestone 5: 数据管理
- [ ] 实现数据导出
- [ ] 实现数据导入

### Milestone 6: 优化和测试
- [ ] 性能优化
- [ ] 可访问性优化
- [ ] 错误处理完善
- [ ] 全面测试

---

## 7. 风险与缓解措施

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| chrome.storage.sync 配额限制 | 高 | 中 | 监控数据大小，提供本地存储备选方案 |
| favicon 加载失败 | 中 | 高 | 提供默认 favicon 占位符 |
| 大量数据导致性能下降 | 中 | 中 | 实现虚拟滚动或分页 |
| 拖拽排序在某些浏览器下异常 | 低 | 低 | 使用原生 HTML5 Drag & Drop API |
