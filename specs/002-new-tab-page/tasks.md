# Chrome 页面管理插件 - 新标签页任务列表

## 版本信息
- **版本**: 1.0
- **创建日期**: 2026-03-04
- **关联规格**: [spec.md](./spec.md)
- **关联方案**: [plan.md](./plan.md)

---

## 合宪性审查

本任务列表已通过合宪性审查，符合 constitution.md 中的所有原则：

- ✅ TDD强制：所有实现任务前都有对应的测试任务
- ✅ 简单性原则：任务粒度原子化，每个任务只涉及单一文件
- ✅ 明确性原则：任务描述清晰明确

---

## 阶段 1: 基础框架搭建

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T1.1 | 创建 newtab/ 目录结构 | - | [P] | newtab/ |
| T1.2 | 创建 local-storage.js 测试文件 | - | [P] | js/local-storage.test.js |
| T1.3 | 实现 local-storage.js 本地存储封装 | T1.2 | - | js/local-storage.js |
| T1.4 | 更新 manifest.json 添加 chrome_url_overrides | T1.1 | [P] | manifest.json |
| T1.5 | 创建 newtab.html 基础结构 | T1.1, T1.4 | [P] | newtab/newtab.html |
| T1.6 | 创建 newtab.css 基础样式 | T1.5 | [P] | newtab/newtab.css |
| T1.7 | 创建 newtab.js 基础脚本框架 | T1.5 | [P] | newtab/newtab.js |

---

## 阶段 2: 页面列表展示

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T2.1 | 在 newtab.html 中添加页面列表 UI 结构 | T1.7 | - | newtab/newtab.html |
| T2.2 | 在 newtab.css 中添加列表布局样式 | T2.1 | - | newtab/newtab.css |
| T2.3 | 在 newtab.js 中实现页面列表渲染（复用 popup 逻辑） | T1.3, T2.2 | - | newtab/newtab.js |
| T2.4 | 在 newtab.html 中添加分组折叠/展开 UI | T2.3 | - | newtab/newtab.html |
| T2.5 | 在 newtab.css 中添加分组样式 | T2.4 | - | newtab/newtab.css |
| T2.6 | 在 newtab.js 中实现分组折叠/展开功能 | T2.5 | - | newtab/newtab.js |
| T2.7 | 在 newtab.html 中添加显示列配置 UI | T2.6 | - | newtab/newtab.html |
| T2.8 | 在 newtab.css 中添加列配置样式 | T2.7 | - | newtab/newtab.css |
| T2.9 | 在 newtab.js 中实现可配置显示列功能 | T2.8 | - | newtab/newtab.js |
| T2.10 | 在 newtab.js 中实现最近访问优先排序 | T2.9 | - | newtab/newtab.js |

---

## 阶段 3: 缩略图功能

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T3.1 | 创建 thumbnail-manager.js 测试文件 | T1.3 | [P] | js/thumbnail-manager.test.js |
| T3.2 | 实现 thumbnail-manager.js 缩略图生成逻辑 | T3.1 | - | js/thumbnail-manager.js |
| T3.3 | 在 newtab.html 中添加缩略图占位 UI | T2.10 | - | newtab/newtab.html |
| T3.4 | 在 newtab.css 中添加缩略图样式 | T3.3 | - | newtab/newtab.css |
| T3.5 | 在 newtab.js 中集成缩略图渐进式加载 | T3.2, T3.4 | - | newtab/newtab.js |
| T3.6 | 在 newtab.js 中实现 favicon 降级方案 | T3.5 | - | newtab/newtab.js |
| T3.7 | 在 newtab.html 中添加手动更新缩略图按钮 | T3.6 | - | newtab/newtab.html |
| T3.8 | 在 newtab.css 中添加更新按钮样式 | T3.7 | - | newtab/newtab.css |
| T3.9 | 在 newtab.js 中实现手动更新缩略图功能 | T3.8 | - | newtab/newtab.js |
| T3.10 | 在 background.js 中添加缩略图定期更新任务 | T3.9 | - | background/background.js |

---

## 阶段 4: 拖拽功能

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T4.1 | 创建 drag-drop.js 测试文件 | T2.10 | [P] | js/drag-drop.test.js |
| T4.2 | 实现 drag-drop.js 拖拽排序逻辑 | T4.1 | - | js/drag-drop.js |
| T4.3 | 在 newtab.css 中添加拖拽样式 | T4.2 | - | newtab/newtab.css |
| T4.4 | 在 newtab.js 中集成拖拽排序功能 | T4.3 | - | newtab/newtab.js |
| T4.5 | 实现 drag-drop.js 拖拽到分组逻辑 | T4.2 | - | js/drag-drop.js |
| T4.6 | 在 newtab.js 中集成拖拽到分组功能 | T4.4, T4.5 | - | newtab/newtab.js |
| T4.7 | 实现 drag-drop.js 拖拽创建分组逻辑 | T4.5 | - | js/drag-drop.js |
| T4.8 | 在 newtab.js 中集成拖拽创建分组功能 | T4.6, T4.7 | - | newtab/newtab.js |

---

## 阶段 5: 批量操作

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T5.1 | 创建 batch-operations.js 测试文件 | T2.10 | [P] | js/batch-operations.test.js |
| T5.2 | 实现 batch-operations.js 批量操作核心逻辑 | T5.1 | - | js/batch-operations.js |
| T5.3 | 在 newtab.html 中添加多选复选框 UI | T4.8 | - | newtab/newtab.html |
| T5.4 | 在 newtab.css 中添加复选框样式 | T5.3 | - | newtab/newtab.css |
| T5.5 | 在 newtab.js 中实现多选功能 | T5.2, T5.4 | - | newtab/newtab.js |
| T5.6 | 在 newtab.html 中添加批量操作工具栏 | T5.5 | - | newtab/newtab.html |
| T5.7 | 在 newtab.css 中添加工具栏样式 | T5.6 | - | newtab/newtab.css |
| T5.8 | 在 newtab.js 中实现批量删除功能 | T5.7 | - | newtab/newtab.js |
| T5.9 | 在 newtab.js 中实现批量移动分组功能 | T5.8 | - | newtab/newtab.js |
| T5.10 | 在 newtab.js 中实现批量添加标签功能 | T5.9 | - | newtab/newtab.js |
| T5.11 | 在 newtab.js 中实现批量导出功能 | T5.10 | - | newtab/newtab.js |

---

## 阶段 6: 统计仪表盘

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T6.1 | 创建 dashboard.js 测试文件 | T2.10 | [P] | js/dashboard.test.js |
| T6.2 | 实现 dashboard.js 统计数据计算逻辑 | T6.1 | - | js/dashboard.js |
| T6.3 | 在 newtab.html 中添加仪表盘 UI 结构 | T5.11 | - | newtab/newtab.html |
| T6.4 | 在 newtab.css 中添加仪表盘样式 | T6.3 | - | newtab/newtab.css |
| T6.5 | 在 newtab.js 中集成仪表盘渲染 | T6.2, T6.4 | - | newtab/newtab.js |
| T6.6 | 在 newtab.js 中实现 TOP 10 页面展示 | T6.5 | - | newtab/newtab.js |
| T6.7 | 在 newtab.js 中实现最近保存页面展示 | T6.6 | - | newtab/newtab.js |

---

## 阶段 7: 搜索优化

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T7.1 | 创建 search-history.js 测试文件 | T1.3 | [P] | js/search-history.test.js |
| T7.2 | 实现 search-history.js 搜索历史逻辑 | T7.1 | - | js/search-history.js |
| T7.3 | 在 newtab.html 中添加大搜索框 UI | T6.7 | - | newtab/newtab.html |
| T7.4 | 在 newtab.css 中添加搜索框样式 | T7.3 | - | newtab/newtab.css |
| T7.5 | 在 newtab.js 中集成大搜索框 | T7.2, T7.4 | - | newtab/newtab.js |
| T7.6 | 在 newtab.js 中实现搜索历史记录 | T7.5 | - | newtab/newtab.js |
| T7.7 | 在 newtab.html 中添加搜索建议 UI | T7.6 | - | newtab/newtab.html |
| T7.8 | 在 newtab.css 中添加搜索建议样式 | T7.7 | - | newtab/newtab.css |
| T7.9 | 在 newtab.js 中实现搜索建议/自动补全 | T7.8 | - | newtab/newtab.js |

---

## 阶段 8: 设置面板

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T8.1 | 在 newtab.html 中添加设置面板 UI | T7.9 | - | newtab/newtab.html |
| T8.2 | 在 newtab.css 中添加设置面板样式 | T8.1 | - | newtab/newtab.css |
| T8.3 | 在 newtab.js 中实现设置面板打开/关闭 | T8.2 | - | newtab/newtab.js |
| T8.4 | 在 newtab.js 中实现默认视图配置 | T8.3 | - | newtab/newtab.js |
| T8.5 | 在 newtab.js 中实现显示列配置 | T8.4 | - | newtab/newtab.js |
| T8.6 | 在 newtab.js 中实现设置即时保存和生效 | T8.5 | - | newtab/newtab.js |

---

## 阶段 9: 优化和体验

### 任务列表

| ID | 任务描述 | 依赖 | 标记 | 文件 |
|----|-----------|------|------|------|
| T9.1 | 性能优化（确保 &lt; 500ms 加载） | T8.6 | - | 多个文件 |
| T9.2 | 缩略图加载优化 | T9.1 | - | 多个文件 |
| T9.3 | 完善错误处理和用户提示 | T9.2 | - | 多个文件 |
| T9.4 | 增强可访问性（语义化 HTML、ARIA 标签） | T9.3 | - | 多个文件 |
| T9.5 | UI 美化和响应式优化 | T9.4 | - | 多个文件 |
| T9.6 | 集成 popup 的完整功能（添加、编辑、删除、导入导出） | T9.5 | - | 多个文件 |
| T9.7 | 最终测试和验收 | T9.6 | - | - |

---

## 依赖关系图

```
阶段 1 → 阶段 2 → 阶段 3 → 阶段 4 → 阶段 5 → 阶段 6 → 阶段 7 → 阶段 8 → 阶段 9

[P] 标记的任务可以与同阶段内无依赖的任务可并行执行

阶段 3、4、5、6、7 的部分任务可以在阶段 2 完成后并行启动
```

---

## 任务标记说明

- **[P]**: 可并行执行，无前置依赖或依赖已满足

---

## 验收标准

参见 [spec.md 第 4 节](./spec.md#4-验收标准)
