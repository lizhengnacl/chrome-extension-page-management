# Chrome 页面管理插件 - 任务分解清单
# Version: 1.0, Created: 2026-03-05

---

## 任务说明
- **[P]**: 可并行执行的任务
- **依赖**: 任务 ID，表示必须先完成该任务才能执行当前任务
- **TDD**: 所有功能模块遵循测试先行原则

---

## 阶段 1: 基础项目结构和常量

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T1-01 | 创建项目目录结构 | - | - | 创建 icons/, popup/, newtab/, lib/, background/ 目录 |
| T1-02 | 实现 lib/constants.js | lib/constants.js | T1-01 | [P] 定义默认数据、配置常量 |
| T1-03 | 编写 manifest.json | manifest.json | T1-01 | [P] 插件配置、权限声明 |

---

## 阶段 2: 工具函数模块

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T2-01 | 实现 generateId() 函数 | lib/utils.js | T1-02 | [P] 生成唯一 ID |
| T2-02 | 实现 getTimestamp() 函数 | lib/utils.js | T1-02 | [P] 获取当前时间戳 |
| T2-03 | 实现 getFaviconUrl() 函数 | lib/utils.js | T1-02 | [P] 获取网站 favicon |
| T2-04 | 实现 downloadJsonFile() 函数 | lib/utils.js | T1-02 | [P] 下载 JSON 文件 |
| T2-05 | 实现 readJsonFile() 函数 | lib/utils.js | T1-02 | [P] 读取 JSON 文件 |
| T2-06 | 实现 showToast() 函数 | lib/utils.js | T1-02 | [P] 显示提示消息 |
| T2-07 | 实现 showConfirm() 函数 | lib/utils.js | T1-02 | [P] 显示确认对话框 |

---

## 阶段 3: 存储模块 - 初始化和基础读取

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T3-01 | 实现 initStorage() 函数 | lib/storage.js | T2-01, T2-02 | 初始化存储结构 |
| T3-02 | 实现 getPages() 函数 | lib/storage.js | T3-01 | [P] 获取所有页面 |
| T3-03 | 实现 getPageById() 函数 | lib/storage.js | T3-01 | [P] 根据 ID 获取页面 |
| T3-04 | 实现 getGroups() 函数 | lib/storage.js | T3-01 | [P] 获取所有分组 |
| T3-05 | 实现 getTags() 函数 | lib/storage.js | T3-01 | [P] 获取所有标签 |

---

## 阶段 4: 存储模块 - Pages CRUD

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T4-01 | 实现 addPage() 函数 | lib/storage.js | T3-02 | 添加新页面 |
| T4-02 | 实现 updatePage() 函数 | lib/storage.js | T3-03 | 更新页面 |
| T4-03 | 实现 deletePage() 函数 | lib/storage.js | T3-03 | 删除页面 |
| T4-04 | 实现 getFavoritePages() 函数 | lib/storage.js | T3-02 | 获取常用页面 |
| T4-05 | 实现 searchPages() 函数 | lib/storage.js | T3-02 | 搜索页面 |
| T4-06 | 实现 getPagesByGroupId() 函数 | lib/storage.js | T3-02, T3-04 | 根据分组获取页面 |
| T4-07 | 实现 getPagesByTagId() 函数 | lib/storage.js | T3-02, T3-05 | 根据标签获取页面 |

---

## 阶段 5: 存储模块 - Groups CRUD

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T5-01 | 实现 addGroup() 函数 | lib/storage.js | T3-04 | [P] 添加新分组 |
| T5-02 | 实现 updateGroup() 函数 | lib/storage.js | T3-04 | [P] 更新分组 |
| T5-03 | 实现 deleteGroup() 函数 | lib/storage.js | T3-04, T4-02 | [P] 删除分组（同时更新页面 groupId） |

---

## 阶段 6: 存储模块 - Tags CRUD

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T6-01 | 实现 addTag() 函数 | lib/storage.js | T3-05 | [P] 添加新标签 |
| T6-02 | 实现 updateTag() 函数 | lib/storage.js | T3-05 | [P] 更新标签 |
| T6-03 | 实现 deleteTag() 函数 | lib/storage.js | T3-05, T4-02 | [P] 删除标签（同时从页面移除） |

---

## 阶段 7: 存储模块 - 导入导出

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T7-01 | 实现 exportData() 函数 | lib/storage.js | T3-02, T3-04, T3-05 | 导出数据为 JSON |
| T7-02 | 实现 importData() 函数 | lib/storage.js | T3-01 | 从 JSON 导入数据 |

---

## 阶段 8: Popup 页面

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T8-01 | 创建 popup.html 结构 | popup/popup.html | T1-03 | Popup 页面 HTML 结构 |
| T8-02 | 创建 popup.css 样式 | popup/popup.css | T8-01 | [P] Popup 页面样式 |
| T8-03 | 实现 initPopup() 函数 | popup/popup.js | T4-01, T3-05, T2-06 | 初始化 Popup |
| T8-04 | 实现 handleAddPage() 函数 | popup/popup.js | T8-03 | 处理添加页面 |

---

## 阶段 9: Newtab 页面 - 基础结构和渲染

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T9-01 | 创建 newtab.html 结构 | newtab/newtab.html | T1-03 | Newtab 页面 HTML 结构 |
| T9-02 | 创建 newtab.css 样式 | newtab/newtab.css | T9-01 | [P] Newtab 页面样式 |
| T9-03 | 实现 initNewtab() 函数 | newtab/newtab.js | T3-01, T4-04, T3-04 | 初始化 Newtab |
| T9-04 | 实现渲染常用页面函数 | newtab/newtab.js | T9-03 | 渲染常用页面区域 |
| T9-05 | 实现渲染分组列表函数 | newtab/newtab.js | T9-03 | 渲染分组和页面列表 |

---

## 阶段 10: Newtab 页面 - 分组管理

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T10-01 | 实现 handleAddGroup() 函数 | newtab/newtab.js | T5-01, T9-05 | [P] 创建新分组 |
| T10-02 | 实现 handleEditGroup() 函数 | newtab/newtab.js | T5-02, T9-05 | [P] 编辑分组名称 |
| T10-03 | 实现 handleDeleteGroup() 函数 | newtab/newtab.js | T5-03, T2-07, T9-05 | [P] 删除分组 |
| T10-04 | 实现 handleOpenGroup() 函数 | newtab/newtab.js | T4-06, T9-05 | [P] 打开分组所有页面 |

---

## 阶段 11: Newtab 页面 - 页面管理

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T11-01 | 实现 handleAddPage() 函数 | newtab/newtab.js | T4-01, T3-05, T3-04, T9-05 | [P] 手动添加页面 |
| T11-02 | 实现 handleEditPage() 函数 | newtab/newtab.js | T4-02, T3-05, T3-04, T9-05 | [P] 编辑页面 |
| T11-03 | 实现 handleDeletePage() 函数 | newtab/newtab.js | T4-03, T2-07, T9-05 | [P] 删除页面 |
| T11-04 | 实现 handleToggleFavorite() 函数 | newtab/newtab.js | T4-02, T9-04, T9-05 | [P] 切换常用标记 |
| T11-05 | 实现拖拽排序功能 | newtab/newtab.js | T4-02, T9-05 | [P] 拖拽调整页面顺序 |

---

## 阶段 12: Newtab 页面 - 标签和搜索

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T12-01 | 实现 handleAddTag() 函数 | newtab/newtab.js | T6-01 | [P] 创建新标签 |
| T12-02 | 实现 handleEditTag() 函数 | newtab/newtab.js | T6-02 | [P] 编辑标签 |
| T12-03 | 实现 handleDeleteTag() 函数 | newtab/newtab.js | T6-03, T2-07 | [P] 删除标签 |
| T12-04 | 实现 handleSearch() 函数 | newtab/newtab.js | T4-05, T9-05 | [P] 搜索页面 |
| T12-05 | 实现 handleFilterByTag() 函数 | newtab/newtab.js | T4-07, T9-05 | [P] 按标签筛选页面 |

---

## 阶段 13: Newtab 页面 - 数据管理

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T13-01 | 实现 handleExport() 函数 | newtab/newtab.js | T7-01, T2-04 | [P] 导出数据 |
| T13-02 | 实现 handleImport() 函数 | newtab/newtab.js | T7-02, T2-05, T2-07, T9-03 | [P] 导入数据 |

---

## 阶段 14: 优化和收尾

| ID | 任务描述 | 文件 | 依赖 | 备注 |
|----|----------|------|------|------|
| T14-01 | 性能优化检查 | 多个文件 | T8-04, T13-02 | 检查加载时间和响应速度 |
| T14-02 | 可访问性优化 | popup/popup.html, newtab/newtab.html | T8-01, T9-01 | 检查语义化 HTML、键盘导航 |
| T14-03 | 添加插件图标 | icons/icon16.png, icons/icon48.png, icons/icon128.png | T1-01 | [P] 创建或放置插件图标 |
| T14-04 | 全面功能测试 | - | T14-03 | 手动测试所有功能 |

---

## 执行顺序建议

### 第一波并行（基础）
- T1-01 → T1-02, T1-03
- T2-01 到 T2-07（可并行）

### 第二波并行（存储模块）
- T3-01 → T3-02 到 T3-05（可并行）
- T4-01 到 T4-07（部分可并行）
- T5-01 到 T5-03（可并行）
- T6-01 到 T6-03（可并行）
- T7-01, T7-02

### 第三波并行（UI 页面）
- T8-01, T8-02 → T8-03 → T8-04
- T9-01, T9-02 → T9-03 → T9-04, T9-05
- T10-01 到 T10-04（可并行）
- T11-01 到 T11-05（可并行）
- T12-01 到 T12-05（可并行）
- T13-01, T13-02（可并行）

### 第四波（优化）
- T14-01 到 T14-04
