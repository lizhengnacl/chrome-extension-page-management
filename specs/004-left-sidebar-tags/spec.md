# 左侧标签栏产品规格说明书
# Version: 1.0, Created: 2026-03-07

---

## 1. 用户故事 (User Stories)

### 1.1 标签展示优化
- **作为**一个拥有大量标签的用户，**我希望**标签以左侧菜单导航的形式展示，**以便**在标签数量多时能更高效地查看所有标签
- **作为**一个频繁切换标签的用户，**我希望**标签始终可见，**以便**降低标签切换的成本

### 1.2 标签栏交互
- **作为**一个希望界面简洁的用户，**我希望**标签栏可以折叠，**以便**在不需要时节省空间
- **作为**一个拥有大量标签的用户，**我希望**标签栏支持滚动，**以便**能查看所有标签

### 1.3 整体体验
- **作为**一个日常使用本插件的用户，**我希望**标签栏布局清晰美观，**以便**提升整体使用体验

---

## 2. 功能性需求 (Functional Requirements)

### 2.1 左侧标签栏布局
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-SIDEBAR-LAYOUT-001 | 在 newtab 页面添加左侧标签栏 | P0 |
| FR-SIDEBAR-LAYOUT-002 | 左侧标签栏宽度为 280-320px（适中宽度） | P0 |
| FR-SIDEBAR-LAYOUT-003 | 移除原页面顶部的标签筛选区域 | P0 |
| FR-SIDEBAR-LAYOUT-004 | 右侧主内容区域展示常用页面和分组 | P0 |

### 2.2 标签展示
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-SIDEBAR-TAG-001 | 左侧标签栏以垂直列表形式展示所有标签 | P0 |
| FR-SIDEBAR-TAG-002 | 每个标签显示名称和颜色 | P0 |
| FR-SIDEBAR-TAG-003 | "全部"选项始终显示在标签列表顶部 | P0 |
| FR-SIDEBAR-TAG-004 | 选中的标签有高亮视觉反馈 | P0 |
| FR-SIDEBAR-TAG-005 | 标签悬停时有视觉反馈 | P0 |

### 2.3 标签操作
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-SIDEBAR-OP-001 | 点击标签切换筛选状态 | P0 |
| FR-SIDEBAR-OP-002 | 双击标签进入内联编辑模式 | P0 |
| FR-SIDEBAR-OP-003 | 内联编辑模式下支持保存和取消 | P0 |
| FR-SIDEBAR-OP-004 | 每个标签旁显示删除按钮 | P0 |
| FR-SIDEBAR-OP-005 | 删除标签前显示确认对话框 | P0 |
| FR-SIDEBAR-OP-006 | 在标签栏顶部提供"添加标签"按钮 | P0 |

### 2.4 标签栏折叠/展开
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-SIDEBAR-COLLAPSE-001 | 支持折叠左侧标签栏 | P0 |
| FR-SIDEBAR-COLLAPSE-002 | 折叠状态下只显示图标或窄条 | P0 |
| FR-SIDEBAR-COLLAPSE-003 | 点击折叠/展开按钮切换状态 | P0 |
| FR-SIDEBAR-COLLAPSE-004 | 折叠/展开状态有清晰的视觉反馈 | P0 |

### 2.5 标签栏滚动
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-SIDEBAR-SCROLL-001 | 标签数量超出时支持垂直滚动 | P0 |
| FR-SIDEBAR-SCROLL-002 | 滚动条样式与整体设计一致 | P1 |

---

## 3. 非功能性需求 (Non-Functional Requirements)

| ID | 需求描述 | 验收标准 |
|----|----------|----------|
| NFR-UX-001 | 标签栏交互流畅，无明显卡顿 | 标签切换响应时间 < 200ms |
| NFR-UX-002 | 布局清晰美观 | 视觉层次分明，易于理解 |
| NFR-UX-003 | 折叠/展开动画流畅 | 动画过渡自然，不超过 300ms |
| NFR-DES-001 | 保持设计一致性 | 标签栏样式与整体风格统一 |
| NFR-ACC-001 | 保持可访问性 | 键盘操作完整支持 |
| NFR-RESP-001 | 响应式布局 | 在不同屏幕尺寸下都能正常显示 |

---

## 4. 验收标准 (Acceptance Criteria)

### 4.1 左侧标签栏布局验收
- [ ] newtab 页面左侧显示标签栏
- [ ] 左侧标签栏宽度为 280-320px
- [ ] 原页面顶部的标签筛选区域已移除
- [ ] 右侧主内容区域正常展示常用页面和分组

### 4.2 标签展示验收
- [ ] 标签以垂直列表形式展示
- [ ] 每个标签显示名称和颜色
- [ ] "全部"选项在标签列表顶部
- [ ] 选中的标签有高亮反馈
- [ ] 标签悬停有视觉反馈

### 4.3 标签操作验收
- [ ] 点击标签可以切换筛选状态
- [ ] 双击标签进入内联编辑模式
- [ ] 编辑模式下可以保存和取消
- [ ] 每个标签旁有删除按钮
- [ ] 删除标签前显示确认对话框
- [ ] 标签栏顶部有"添加标签"按钮

### 4.4 折叠/展开验收
- [ ] 可以折叠左侧标签栏
- [ ] 折叠状态下只显示窄条
- [ ] 点击按钮可以切换折叠/展开状态
- [ ] 折叠/展开有清晰的视觉反馈

### 4.5 滚动验收
- [ ] 标签数量多时支持垂直滚动
- [ ] 滚动条样式美观

### 4.6 用户体验验收
- [ ] 交互流畅，无明显卡顿
- [ ] 布局清晰美观
- [ ] 折叠/展开动画流畅
- [ ] 设计保持一致性
- [ ] 键盘操作完整支持
- [ ] 响应式布局正常

---

## 5. 输出格式示例 (Implementation Examples)

### 5.1 页面布局结构
```html
<div class="flex h-screen">
  &lt;!-- 左侧标签栏 --&gt;
  &lt;aside id="sidebar" class="w-[300px] bg-white border-r border-gray-200 flex flex-col"&gt;
    &lt;div class="p-4 border-b border-gray-200"&gt;
      &lt;div class="flex justify-between items-center"&gt;
        &lt;h2 class="text-lg font-semibold text-gray-900"&gt;标签&lt;/h2&gt;
        &lt;button id="collapseBtn" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"&gt;
          &lt;svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
            &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"&gt;&lt;/path&gt;
          &lt;/svg&gt;
        &lt;/button&gt;
      &lt;/div&gt;
      &lt;button id="addTagBtn" class="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"&gt;
        + 添加标签
      &lt;/button&gt;
    &lt;/div&gt;
    &lt;div id="tagsList" class="flex-1 overflow-y-auto p-4"&gt;&lt;/div&gt;
  &lt;/aside&gt;

  &lt;!-- 右侧主内容 --&gt;
  &lt;main class="flex-1 overflow-y-auto bg-gray-100"&gt;
    &lt;div class="max-w-4xl mx-auto py-10 px-5"&gt;
      &lt;header class="flex justify-between items-center mb-10 flex-wrap gap-5"&gt;
        &lt;h1 class="text-3xl font-bold text-gray-900"&gt;Chrome 页面管理&lt;/h1&gt;
        &lt;div class="flex gap-3 items-center flex-wrap"&gt;
          &lt;input type="text" id="searchInput" placeholder="搜索页面..." class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"&gt;
          &lt;button id="addPageBtn" class="px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"&gt;添加页面&lt;/button&gt;
          &lt;button id="exportBtn" class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"&gt;导出&lt;/button&gt;
          &lt;button id="importBtn" class="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"&gt;导入&lt;/button&gt;
        &lt;/div&gt;
      &lt;/header&gt;

      &lt;section class="mb-8" id="favoritesSection"&gt;
        &lt;h2 class="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2"&gt;
          &lt;span class="text-2xl"&gt;⭐&lt;/span&gt;
          常用页面
        &lt;/h2&gt;
        &lt;div id="favoritesList" class="flex flex-col gap-2"&gt;&lt;/div&gt;
      &lt;/section&gt;

      &lt;section class="mb-8" id="groupsSection"&gt;
        &lt;div class="flex justify-between items-center mb-4"&gt;
          &lt;h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2"&gt;
            &lt;span class="text-2xl"&gt;📁&lt;/span&gt;
            分组
          &lt;/h2&gt;
          &lt;button id="addGroupBtn" class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"&gt;+ 添加分组&lt;/button&gt;
        &lt;/div&gt;
        &lt;div id="groupsList" class="flex flex-col gap-6"&gt;&lt;/div&gt;
      &lt;/section&gt;
    &lt;/div&gt;
  &lt;/main&gt;
&lt;/div&gt;
```

### 5.2 标签项渲染
```html
&lt;div class="flex items-center gap-2 mb-2" data-tag-id="tag1"&gt;
  &lt;span class="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${selected ? 'bg-gray-100 ring-2 ring-blue-500' : ''}" 
        style="border-left: 4px solid ${tag.color};"
        data-tag-id="tag1"
        title="双击编辑"&gt;
    ${tag.name}
  &lt;/span&gt;
  &lt;button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors delete-tag-btn" data-tag-id="tag1" title="删除标签"&gt;
    &lt;svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
      &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"&gt;&lt;/path&gt;
    &lt;/svg&gt;
  &lt;/button&gt;
&lt;/div&gt;
```

### 5.3 折叠状态样式
```css
#sidebar.collapsed {
  width: 60px;
}

#sidebar.collapsed .sidebar-title,
#sidebar.collapsed .tag-name,
#sidebar.collapsed #addTagBtn {
  display: none;
}

#sidebar.collapsed #collapseBtn svg {
  transform: rotate(180deg);
}
```
