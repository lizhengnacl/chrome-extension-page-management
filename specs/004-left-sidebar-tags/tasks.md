# 左侧标签栏任务执行清单
# Version: 1.0, Created: 2026-03-07

---

## 阶段 1: HTML 结构重构

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-1.1 | 修改 newtab.html，将 body 内容包裹在 flex h-screen 容器中 | 无 | P0 | pending |
| TASK-1.2 | 在 newtab.html 中添加左侧 sidebar 元素（aside#sidebar） | TASK-1.1 | P0 | pending |
| TASK-1.3 | 在 sidebar 中添加头部区域（标题、折叠按钮、添加标签按钮） | TASK-1.2 | P0 | pending |
| TASK-1.4 | 在 sidebar 中添加 tagsList 容器 | TASK-1.2 | P0 | pending |
| TASK-1.5 | 移除原页面顶部的 tagsSection | TASK-1.1 | P0 | pending |
| TASK-1.6 | 将主内容区域（header、favoritesSection、groupsSection）包裹在 main 标签中 | TASK-1.1 | P0 | pending |
| TASK-1.7 | 将顶部的 addTagBtn 移动到 sidebar 头部区域 | TASK-1.3 | P0 | pending |

---

## 阶段 2: CSS 样式适配

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-2.1 | 给 sidebar 添加基础样式（w-[300px]、bg-white、border-r、flex flex-col） | TASK-1.2 | P0 | pending |
| TASK-2.2 | 给 main 添加样式（flex-1、overflow-y-auto、bg-gray-100） | TASK-1.6 | P0 | pending |
| TASK-2.3 | 给 tagsList 添加样式（flex-1、overflow-y-auto、p-4） | TASK-1.4 | P0 | pending |
| TASK-2.4 | 添加 collapsed 类样式（w-[60px]） | TASK-2.1 | P0 | pending |
| TASK-2.5 | 添加过渡动画（transition-all duration-300） | TASK-2.1, TASK-2.4 | P0 | pending |
| TASK-2.6 | 添加折叠状态下隐藏文字的样式 | TASK-2.4 | P0 | pending |

---

## 阶段 3: JavaScript 逻辑更新

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-3.1 | 在 state 对象中添加 isSidebarCollapsed: false | TASK-1.2 | P0 | pending |
| TASK-3.2 | 新增 renderSidebar() 函数，更新折叠状态样式并调用 renderTags() | TASK-3.1 | P0 | pending |
| TASK-3.3 | 新增 toggleSidebarCollapse() 函数，切换 isSidebarCollapsed 并调用 renderSidebar() | TASK-3.2 | P0 | pending |
| TASK-3.4 | 重写 renderTags() 函数，渲染垂直列表样式 | TASK-1.4 | P0 | pending |
| TASK-3.5 | 修改 renderEditingTag() 函数，适配垂直列表布局 | TASK-3.4 | P0 | pending |
| TASK-3.6 | 更新 renderAll() 函数，添加 renderSidebar() 调用 | TASK-3.2 | P0 | pending |
| TASK-3.7 | 更新 bindEvents() 函数，添加折叠按钮的点击事件 | TASK-3.3 | P0 | pending |

---

## 阶段 4: 测试验证

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-4.1 | 测试页面加载和基本布局显示 | TASK-1.7, TASK-2.6, TASK-3.7 | P0 | pending |
| TASK-4.2 | 测试标签筛选功能（点击标签切换） | TASK-3.4 | P0 | pending |
| TASK-4.3 | 测试标签编辑功能（双击编辑） | TASK-3.5 | P0 | pending |
| TASK-4.4 | 测试标签删除功能 | TASK-3.4 | P0 | pending |
| TASK-4.5 | 测试侧边栏折叠/展开功能 | TASK-3.3 | P0 | pending |
| TASK-4.6 | 测试折叠状态动画（300ms 过渡） | TASK-2.5 | P0 | pending |
| TASK-4.7 | 测试大量标签时的垂直滚动 | TASK-2.3 | P0 | pending |
| TASK-4.8 | 测试"全部"选项功能 | TASK-3.4 | P0 | pending |
| TASK-4.9 | 测试选中标签的高亮反馈 | TASK-3.4 | P0 | pending |
| TASK-4.10 | 测试标签悬停的视觉反馈 | TASK-3.4 | P0 | pending |
| TASK-4.11 | 测试添加标签功能 | TASK-1.7 | P0 | pending |
| TASK-4.12 | 测试删除标签前的确认对话框 | TASK-3.4 | P0 | pending |
| TASK-4.13 | 测试折叠状态下宽度为 60px | TASK-2.4 | P0 | pending |
| TASK-4.14 | 测试折叠/展开有清晰的视觉反馈 | TASK-2.6 | P0 | pending |
| TASK-4.15 | 测试常用页面功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.16 | 测试分组功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.17 | 测试搜索功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.18 | 测试添加/编辑/删除页面功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.19 | 测试添加/编辑/删除分组功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.20 | 测试导入/导出功能正常 | TASK-1.6 | P0 | pending |
| TASK-4.21 | 测试响应式布局（不同屏幕尺寸） | TASK-2.2 | P1 | pending |
| TASK-4.22 | 测试键盘操作完整支持 | TASK-3.7 | P1 | pending |
| TASK-4.23 | 验证所有现有功能正常工作 | TASK-4.15 到 TASK-4.20 | P0 | pending |

---

## 执行顺序说明

### 并行任务组 [P]
以下任务可以并行执行：
- 阶段 1 的所有 HTML 重构任务（TASK-1.1 到 TASK-1.7）
- 阶段 2 的所有 CSS 样式任务（TASK-2.1 到 TASK-2.6）

### 依赖关系图
```
阶段 1 (HTML)
  ↓
阶段 2 (CSS) [可与阶段 1 部分并行]
  ↓
阶段 3 (JavaScript)
  ↓
阶段 4 (测试)
```

### 详细执行顺序
1. 首先执行 TASK-1.1（创建 flex 容器）
2. 然后并行执行：
   - TASK-1.2 到 TASK-1.7（HTML 结构完善）
   - TASK-2.1 到 TASK-2.6（CSS 样式）
3. HTML 和 CSS 完成后，执行阶段 3（JavaScript）
4. JavaScript 完成后，执行阶段 4（测试验证）

---

## 验收检查清单

- [ ] newtab.html 已重构为左右布局
- [ ] 左侧标签栏宽度 300px
- [ ] 标签以垂直列表形式展示
- [ ] "全部"选项在标签列表顶部
- [ ] 选中的标签有高亮反馈
- [ ] 标签悬停有视觉反馈
- [ ] 点击标签可以切换筛选状态
- [ ] 双击标签进入内联编辑模式
- [ ] 编辑模式下可以保存和取消
- [ ] 每个标签旁有删除按钮
- [ ] 删除标签前显示确认对话框
- [ ] 标签栏顶部有"添加标签"按钮
- [ ] 可以折叠左侧标签栏
- [ ] 折叠状态下宽度为 60px
- [ ] 点击按钮可以切换折叠/展开状态
- [ ] 折叠/展开有清晰的视觉反馈
- [ ] 标签数量多时支持垂直滚动
- [ ] 交互流畅，无明显卡顿
- [ ] 布局清晰美观
- [ ] 折叠/展开动画流畅（&lt; 300ms）
- [ ] 设计保持一致性
- [ ] 键盘操作完整支持
- [ ] 响应式布局正常
- [ ] 所有现有功能正常工作
