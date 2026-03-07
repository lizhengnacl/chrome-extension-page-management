# 左侧标签栏技术实现方案
# Version: 1.0, Created: 2026-03-07

---

## 1. 技术上下文总结

### 1.1 现有技术栈
- **语言**: JavaScript (ES6+)
- **样式**: Tailwind CSS
- **存储**: chrome.storage.sync
- **结构**: Chrome 插件标准结构

### 1.2 现有文件
- `newtab/newtab.html` - 新标签页 HTML 结构
- `newtab/newtab.js` - 新标签页逻辑
- `lib/storage.js` - 数据存储
- `lib/utils.js` - 工具函数
- `lib/constants.js` - 常量定义

### 1.3 技术决策
1. **保持现有架构**：不引入新依赖，继续使用原生 JavaScript 和 Tailwind CSS
2. **复用现有逻辑**：标签筛选、编辑、删除等逻辑保持不变
3. **渐进式重构**：只修改与布局和标签渲染相关的代码
4. **保持功能完整**：确保所有现有功能在新布局下正常工作

---

## 2. "合宪性"审查

### 2.1 简单性原则 (Simplicity First)
✅ **符合**
- 不引入新框架或库
- 复用现有标签操作逻辑
- 只修改必要的 HTML 结构和 CSS 样式
- 不进行过度抽象

### 2.2 用户体验铁律 (User Experience Imperative)
✅ **符合**
- 标签始终可见，降低切换成本
- 折叠/展开功能提供灵活的空间管理
- 滚动支持处理大量标签场景
- 保持即时反馈和直观操作

### 2.3 明确性原则 (Clarity and Explicitness)
✅ **符合**
- 所有异步操作都使用 try-catch
- 状态变更清晰可追踪
- 关键逻辑有注释说明

### 2.4 Chrome API 优先原则 (Chrome API First)
✅ **符合**
- 继续使用 chrome.storage.sync 存储数据
- 不引入 localStorage
- 继续使用 chrome.tabs 打开页面

### 2.5 单一职责原则 (Single Responsibility)
✅ **符合**
- storage.js 继续只负责数据存储
- newtab.js 保持内聚，只处理新标签页逻辑
- UI 组件按功能划分

### 2.6 可访问性原则 (Accessibility)
✅ **符合**
- 使用语义化 HTML 结构
- 保持键盘操作完整支持
- 必要时使用 ARIA 标签

---

## 3. 项目结构细化

### 3.1 修改文件清单
```
chrome-extension-page-management/
├── newtab/
│   ├── newtab.html    ← 修改
│   └── newtab.js      ← 修改
└── specs/
    └── 004-left-sidebar-tags/
        ├── spec.md
        └── plan.md    ← 新增
```

### 3.2 newtab.html 结构变更
**当前结构：**
```
<body>
  <div class="max-w-6xl mx-auto">
    <header>...</header>
    <section id="favoritesSection">...</section>
    <section id="tagsSection">...</section>  ← 移除
    <section id="groupsSection">...</section>
  </div>
</body>
```

**新结构：**
```
<body>
  <div class="flex h-screen">
    <aside id="sidebar" class="w-[300px] bg-white border-r flex flex-col">  ← 新增
      <div class="p-4 border-b">
        <h2>标签</h2>
        <button id="collapseBtn">...</button>
        <button id="addTagBtn">+ 添加标签</button>
      </div>
      <div id="tagsList" class="flex-1 overflow-y-auto p-4"></div>
    </aside>
    <main class="flex-1 overflow-y-auto bg-gray-100">  ← 新增
      <div class="max-w-4xl mx-auto py-10 px-5">
        <header>...</header>
        <section id="favoritesSection">...</section>
        <section id="groupsSection">...</section>
      </div>
    </main>
  </div>
  <div id="modalOverlay">...</div>
  <div id="modal">...</div>
</body>
```

### 3.3 newtab.js 变更点
1. **状态管理**：新增 `isSidebarCollapsed` 状态
2. **renderTags()**：重写为渲染垂直列表
3. **新增函数**：
   - `renderSidebar()` - 渲染侧边栏
   - `toggleSidebarCollapse()` - 切换折叠状态
4. **事件绑定**：新增折叠按钮事件
5. **事件移动**：将"添加标签"按钮事件从顶部移到侧边栏

---

## 4. 核心数据结构

### 4.1 状态对象扩展
```javascript
let state = {
  pages: [],
  groups: [],
  tags: [],
  searchKeyword: '',
  selectedTagId: null,
  editingPageId: null,
  editingGroupId: null,
  editingTagId: null,
  draggedPageId: null,
  isSidebarCollapsed: false  // 新增：侧边栏折叠状态
};
```

### 4.2 侧边栏折叠状态持久化（可选）
考虑到用户体验，建议将折叠状态持久化到 chrome.storage.local：
```javascript
// 存储键名
const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

// 保存状态
async function saveSidebarState() {
  await chrome.storage.local.set({ [SIDEBAR_COLLAPSED_KEY]: state.isSidebarCollapsed });
}

// 加载状态
async function loadSidebarState() {
  const result = await chrome.storage.local.get(SIDEBAR_COLLAPSED_KEY);
  state.isSidebarCollapsed = result[SIDEBAR_COLLAPSED_KEY] || false;
}
```

---

## 5. 接口设计

### 5.1 新增函数签名

#### 5.1.1 renderSidebar()
```javascript
/**
 * 渲染侧边栏
 * 包括：标签标题、折叠按钮、添加标签按钮、标签列表
 */
function renderSidebar() {
  // 更新折叠状态的样式
  const sidebar = document.getElementById('sidebar');
  if (state.isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
  
  // 渲染标签列表（复用 renderTags）
  renderTags();
}
```

#### 5.1.2 toggleSidebarCollapse()
```javascript
/**
 * 切换侧边栏折叠状态
 */
function toggleSidebarCollapse() {
  state.isSidebarCollapsed = !state.isSidebarCollapsed;
  renderSidebar();
  // 可选：持久化状态
  // saveSidebarState();
}
```

### 5.2 修改函数签名

#### 5.2.1 renderTags() - 重写
```javascript
/**
 * 渲染标签列表（垂直列表样式）
 */
function renderTags() {
  const container = document.getElementById('tagsList');
  
  if (state.tags.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">暂无标签</p>';
    return;
  }
  
  let html = '';
  
  // "全部"选项
  html += `
    &lt;div class="flex items-center gap-2 mb-2"&gt;
      &lt;span class="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${!state.selectedTagId ? 'bg-gray-100 ring-2 ring-blue-500' : ''}" 
            style="border-left: 4px solid #9ca3af;"
            data-tag-id=""
            title="显示全部"&gt;全部&lt;/span&gt;
    &lt;/div&gt;
  `;
  
  // 标签列表
  html += state.tags.map(tag =&gt; {
    if (state.editingTagId === tag.id) {
      return renderEditingTag(tag);
    }
    return `
      &lt;div class="flex items-center gap-2 mb-2" data-tag-id="${tag.id}"&gt;
        &lt;span class="flex-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-gray-100 ${state.selectedTagId === tag.id ? 'bg-gray-100 ring-2 ring-blue-500' : ''}" 
              style="border-left: 4px solid ${tag.color};"
              data-tag-id="${tag.id}"
              title="双击编辑"&gt;${tag.name}&lt;/span&gt;
        &lt;button class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors delete-tag-btn" data-tag-id="${tag.id}" title="删除标签"&gt;
          &lt;svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
            &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"&gt;&lt;/path&gt;
          &lt;/svg&gt;
        &lt;/button&gt;
      &lt;/div&gt;
    `;
  }).join('');
  
  container.innerHTML = html;
  
  // 绑定事件
  container.querySelectorAll('[data-tag-id]').forEach(el =&gt; {
    if (el.tagName === 'SPAN') {
      el.addEventListener('click', (e) =&gt; handleTagClick(el.dataset.tagId, e));
    }
  });
  
  container.querySelectorAll('.delete-tag-btn').forEach(el =&gt; {
    el.addEventListener('click', () =&gt; handleDeleteTag(el.dataset.tagId));
  });
}
```

#### 5.2.2 renderEditingTag() - 适配新布局
```javascript
/**
 * 渲染编辑状态的标签（适配垂直列表）
 */
function renderEditingTag(tag) {
  return `
    &lt;div class="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded-lg" data-tag-id="${tag.id}"&gt;
      &lt;div class="flex items-center gap-2 flex-1"&gt;
        &lt;input type="text" 
               value="${tag.name}" 
               class="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none border-2 border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
               data-tag-id="${tag.id}"
               id="editTagInput"
               tabindex="0"
               autofocus&gt;
        &lt;div class="flex gap-1"&gt;
          &lt;button class="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-green-600 transition-all duration-200 shadow-sm save-edit-btn" 
                  data-tag-id="${tag.id}" 
                  title="保存 (Enter)"
                  tabindex="1"&gt;✓ 保存&lt;/button&gt;
          &lt;button class="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-600 transition-all duration-200 shadow-sm cancel-edit-btn" 
                  data-tag-id="${tag.id}" 
                  title="取消 (Esc)"
                  tabindex="2"&gt;✕ 取消&lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  `;
}
```

#### 5.2.3 renderAll() - 更新
```javascript
/**
 * 渲染所有内容
 */
function renderAll() {
  renderSidebar();  // 新增：渲染侧边栏
  renderFavorites();
  renderGroups();
}
```

#### 5.2.4 bindEvents() - 更新
```javascript
/**
 * 绑定事件
 */
function bindEvents() {
  // ... 现有事件绑定 ...
  
  // 新增：折叠按钮事件
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', toggleSidebarCollapse);
  }
  
  // 注意：addTagBtn 现在在侧边栏，保持原有绑定即可
}
```

---

## 6. 实现步骤

### 阶段 1: HTML 结构重构
1. 修改 `newtab.html`，添加左侧标签栏结构
2. 移除原顶部的 `tagsSection`
3. 将主内容区域包裹在 `&lt;main&gt;` 标签中
4. 添加折叠按钮和"添加标签"按钮到侧边栏

### 阶段 2: CSS 样式适配
1. 添加侧边栏基础样式（宽度 300px、白色背景、边框）
2. 添加折叠状态样式（宽度 60px、隐藏文字）
3. 添加过渡动画（300ms 流畅过渡）
4. 适配标签列表的垂直滚动
5. 适配右侧主内容区域的布局

### 阶段 3: JavaScript 逻辑更新
1. 扩展 state 对象，添加 `isSidebarCollapsed`
2. 重写 `renderTags()` 函数，适配垂直列表样式
3. 修改 `renderEditingTag()` 函数，适配新布局
4. 新增 `renderSidebar()` 函数
5. 新增 `toggleSidebarCollapse()` 函数
6. 更新 `renderAll()` 函数
7. 更新 `bindEvents()` 函数，添加折叠按钮事件

### 阶段 4: 测试验证
1. 测试标签筛选功能
2. 测试标签编辑功能
3. 测试标签删除功能
4. 测试侧边栏折叠/展开功能
5. 测试大量标签时的滚动
6. 测试响应式布局
7. 测试键盘操作
8. 验证所有现有功能正常工作

---

## 7. 风险与注意事项

### 7.1 风险点
1. **布局兼容性**：确保在不同屏幕尺寸下都能正常显示
2. **折叠状态持久化**：如果需要持久化，需要考虑初始化加载顺序
3. **事件绑定**：确保所有事件在新布局下正常绑定

### 7.2 注意事项
1. 保持所有现有功能完整性，不做功能删减
2. 保持与现有代码风格一致
3. 确保所有异步操作都有 try-catch 错误处理
4. 保持用户体验流畅，响应时间 &lt; 200ms

---

## 8. 验收检查清单

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
