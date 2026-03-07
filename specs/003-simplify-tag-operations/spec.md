# 简化标签操作产品规格说明书
# Version: 1.0, Created: 2026-03-06

---

## 1. 用户故事 (User Stories)

### 1.1 标签新建相关
- **作为**一个频繁使用标签的用户，**我希望**新建标签时无需手动选择颜色，**以便**更快速地创建标签
- **作为**一个对标签颜色有要求的用户，**我希望**在需要时可以修改标签颜色，**以便**标签符合我的偏好

### 1.2 标签编辑相关
- **作为**一个需要频繁修改标签的用户，**我希望**双击标签就能直接编辑，**以便**更高效地修改标签名称
- **作为**一个喜欢流畅交互的用户，**我希望**编辑标签时不需要打开弹窗，**以便**获得更流畅的体验

### 1.3 标签删除相关
- **作为**一个谨慎的用户，**我希望**删除标签前有确认步骤，**以便**避免误删

### 1.4 整体体验相关
- **作为**一个日常使用本插件的用户，**我希望**标签操作流程简化，**以便**提升整体使用效率

---

## 2. 功能性需求 (Functional Requirements)

### 2.1 标签新建简化
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-TAG-NEW-001 | 新建标签时系统自动分配颜色，无需用户选择 | P0 |
| FR-TAG-NEW-002 | 标签颜色分配策略：根据标签名称内容智能分配相近颜色 | P0 |
| FR-TAG-NEW-003 | 保留颜色选择功能，用户可在需要时修改颜色 | P1 |
| FR-TAG-NEW-004 | 在 newtab 页面和 popup 页面都可以新建标签 | P0 |

### 2.2 标签编辑简化
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-TAG-EDIT-001 | 支持双击标签进入内联编辑模式 | P0 |
| FR-TAG-EDIT-002 | 内联编辑模式下，标签变为输入框，光标自动聚焦 | P0 |
| FR-TAG-EDIT-003 | 按 Enter 键或点击外部区域保存编辑 | P0 |
| FR-TAG-EDIT-004 | 按 Esc 键取消编辑 | P0 |
| FR-TAG-EDIT-005 | 内联编辑时仍保留修改颜色的能力 | P1 |
| FR-TAG-EDIT-006 | 移除编辑按钮，改用双击触发编辑 | P0 |

### 2.3 标签删除简化
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-TAG-DEL-001 | 删除标签前显示确认对话框 | P0 |
| FR-TAG-DEL-002 | 确认对话框说明删除标签的影响（该标签将从所有页面中移除） | P0 |
| FR-TAG-DEL-003 | 保留删除按钮 | P0 |

### 2.4 标签展示优化
| ID | 需求描述 | 优先级 |
|----|----------|--------|
| FR-TAG-DISP-001 | 标签悬停时显示编辑提示（如"双击编辑"） | P1 |
| FR-TAG-DISP-002 | 标签在编辑模式下有清晰的视觉反馈 | P0 |

---

## 3. 非功能性需求 (Non-Functional Requirements)

| ID | 需求描述 | 验收标准 |
|----|----------|----------|
| NFR-UX-001 | 标签操作流畅，无明显卡顿 | 新建/编辑/删除操作响应时间 < 200ms |
| NFR-UX-002 | 内联编辑交互自然直观 | 用户无需学习即可使用 |
| NFR-UX-003 | 颜色智能分配合理 | 相似标签名称分配相似颜色 |
| NFR-DES-001 | 保持设计一致性 | 标签样式与整体风格统一 |
| NFR-ACC-001 | 保持可访问性 | 键盘操作完整支持 |

---

## 4. 验收标准 (Acceptance Criteria)

### 4.1 标签新建验收
- [ ] 新建标签时自动分配颜色，无需用户选择
- [ ] 颜色根据标签名称智能分配
- [ ] 用户可以在需要时修改标签颜色
- [ ] newtab 和 popup 页面都可以新建标签

### 4.2 标签编辑验收
- [ ] 双击标签进入内联编辑模式
- [ ] 编辑模式下标签变为输入框，光标自动聚焦
- [ ] 按 Enter 键保存编辑
- [ ] 点击外部区域保存编辑
- [ ] 按 Esc 键取消编辑
- [ ] 编辑模式下可以修改颜色
- [ ] 移除了编辑按钮

### 4.3 标签删除验收
- [ ] 点击删除按钮显示确认对话框
- [ ] 确认对话框说明删除影响
- [ ] 确认后删除标签
- [ ] 取消后不删除标签

### 4.4 用户体验验收
- [ ] 操作流畅，无明显卡顿
- [ ] 标签悬停显示编辑提示
- [ ] 编辑模式有清晰的视觉反馈
- [ ] 键盘操作完整支持

---

## 5. 输出格式示例 (Implementation Examples)

### 5.1 标签展示（可编辑状态）
```html
<div class="flex items-center gap-2 mb-2">
  <span class="px-3.5 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 select-none hover:opacity-80 hover:scale-[1.02] relative group"
        style="background: #3b82f6; color: white;"
        data-tag-id="tag1"
        title="双击编辑">
    工作
    <span class="absolute -top-2 -right-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      双击编辑
    </span>
  </span>
  <button class="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium cursor-pointer hover:bg-red-600 transition-all duration-200 delete-tag-btn" data-tag-id="tag1">删除</button>
</div>
```

### 5.2 标签内联编辑模式
```html
<div class="flex items-center gap-2 mb-2">
  <div class="flex items-center gap-2">
    <input type="text" value="工作" class="px-3 py-1 rounded-full text-sm outline-none border-2 border-blue-500 bg-white text-gray-900" data-tag-id="tag1" autofocus>
    <div class="flex gap-1">
      <button class="p-1.5 bg-green-500 text-white rounded text-xs cursor-pointer hover:bg-green-600 transition-all duration-200 save-edit-btn" data-tag-id="tag1" title="保存">✓</button>
      <button class="p-1.5 bg-gray-500 text-white rounded text-xs cursor-pointer hover:bg-gray-600 transition-all duration-200 cancel-edit-btn" data-tag-id="tag1" title="取消">✕</button>
    </div>
  </div>
</div>
```

### 5.3 新建标签（自动分配颜色）
```javascript
// 颜色智能分配算法示例
function getColorForTagName(tagName) {
  const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % DEFAULT_TAG_COLORS.length;
  return DEFAULT_TAG_COLORS[colorIndex];
}

// 新建标签时自动分配颜色
async function addTagWithAutoColor(name) {
  const color = getColorForTagName(name);
  await addTag({ name, color });
}
```

### 5.4 删除确认对话框
```javascript
async function handleDeleteTag(tagId) {
  const confirmed = await showConfirm('确定要删除这个标签吗？该标签将从所有页面中移除。');
  if (!confirmed) return;
  
  try {
    await deleteTag(tagId);
    await loadData();
    if (state.selectedTagId === tagId) {
      state.selectedTagId = null;
    }
    renderAll();
    showToast('标签已删除', 'success');
  } catch (error) {
    console.error('Failed to delete tag:', error);
    showToast('删除失败', 'error');
  }
}
```
