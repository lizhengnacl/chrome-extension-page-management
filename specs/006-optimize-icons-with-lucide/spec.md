# 使用 Lucide Icons 优化 Icon 表达

## 用户故事

作为 Chrome 页面管理插件的用户，我希望看到专业、一致、美观的图标，以便更直观地理解界面功能，提升整体使用体验。

---

## 背景与目标

### 当前状态分析
项目目前使用了三种图标表达方式：
1. 原生 SVG 图标（手动编写的简单 SVG）
2. Emoji 图标（⭐、📁、✏️、🗑️ 等）
3. 文字按钮（"添加"、"编辑"、"删除"、"打开全部"等）

### 优化目标
- 使用成熟的 Lucide Icons 库替代现有的混合图标方案
- 保持界面简洁性，不引入不必要的复杂性
- 提升视觉一致性和专业感
- 改善用户对功能的直观识别

---

## 功能性需求

### 1. 引入 Lucide Icons 库
- 通过 CDN 引入 Lucide Icons，避免额外的构建依赖
- 确保图标库加载快速且稳定
- 支持通过 CSS 类名或 data 属性使用图标

### 2. 替换操作按钮图标
将以下操作按钮的图标/文字替换为 Lucide Icons：

| 当前 | Lucide 图标 | 使用位置 |
|------|------------|---------|
| ⭐ | `star`/`star-off` | 收藏/取消收藏按钮 |
| ✏️ | `pencil` | 编辑按钮 |
| 🗑️ | `trash-2` | 删除按钮 |
| "+ 添加" | `plus` | 添加按钮（标签、分组、页面） |
| "打开全部" | `external-link` | 打开分组全部按钮 |
| "编辑" | `pencil` | 编辑分组按钮 |
| "删除" | `trash-2` | 删除分组按钮 |
| "保存" | `check` | 保存按钮 |
| "取消" | `x` | 取消按钮 |
| "导出" | `download` | 导出按钮 |
| "导入" | `upload` | 导入按钮 |
| 侧边栏折叠 | `chevron-left`/`chevron-right` | 侧边栏折叠/展开按钮 |
| 搜索 | `search` | 搜索输入框前缀 |

### 3. 替换导航和分类图标
将以下分类和导航图标替换为 Lucide Icons：

| 当前 | Lucide 图标 | 使用位置 |
|------|------------|---------|
| ⭐ | `star` | 常用页面标题 |
| 📁 | `folder` | 分组标题 |
| 标签 | `tag` | 侧边栏标签区域 |

### 4. 图标样式一致性
- 所有图标使用统一的尺寸（w-4 h-4 或 w-5 h-5，根据上下文调整）
- 图标颜色与文字颜色保持一致（currentColor）
- 图标的 hover/active 状态与按钮样式协调
- 图标与文字之间保持适当间距（1-2个单位）

---

## 非功能性需求

### 1. 性能要求
- 图标库加载时间 < 100ms
- 图标渲染不影响页面响应速度
- 使用 CDN 缓存机制

### 2. 可访问性要求
- 所有图标按钮都有适当的 aria-label 或 title 属性
- 保持键盘可访问性
- 图标颜色有足够的对比度

### 3. 兼容性要求
- 与 Chrome 浏览器版本兼容（Chrome 88+）
- 在不同屏幕尺寸下图标显示正常

### 4. 简单性原则
- 不引入不必要的依赖
- 保持代码简洁，易于维护
- 遵循项目现有的代码风格

---

## 验收标准

### 必须满足
- [ ] Lucide Icons 库成功引入并可正常使用
- [ ] 所有操作按钮图标替换为 Lucide Icons
- [ ] 导航和分类图标替换为 Lucide Icons
- [ ] 图标样式保持一致（尺寸、颜色、间距）
- [ ] 所有功能正常工作，无 regressions
- [ ] 页面加载和响应速度不受影响

### 期望达到
- [ ] 用户能够直观识别所有图标的功能
- [ ] 整体视觉效果更加专业和美观
- [ ] 代码更易于维护和扩展

---

## 输出格式示例

### 图标使用示例

```html
<!-- 添加按钮 -->
<button class="flex items-center gap-2">
  <i data-lucide="plus" class="w-4 h-4"></i>
  <span>添加</span>
</button>

<!-- 编辑按钮（仅图标） -->
<button class="p-2" title="编辑">
  <i data-lucide="pencil" class="w-4 h-4"></i>
</button>

<!-- 收藏按钮 -->
<button class="favorite-btn">
  <i data-lucide="star" class="w-4 h-4 ${page.isFavorite ? 'fill-amber-500' : ''}"></i>
</button>
```

### JavaScript 初始化示例

```javascript
// 初始化 Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// 动态渲染后重新初始化
function renderSomething() {
  // ... 渲染逻辑 ...
  lucide.createIcons();
}
```
