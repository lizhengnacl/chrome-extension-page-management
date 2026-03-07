# 使用 Lucide Icons 优化 Icon 表达 - 任务列表

## 阶段 1：引入 Lucide Icons CDN

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T1.1 | 在 newtab.html 的 head 中添加 Lucide Icons CDN 脚本 | - | 高 |
| T1.2 | 在 popup.html 的 head 中添加 Lucide Icons CDN 脚本 | - | 高 |

---

## 阶段 2：替换 newtab.html 中的静态图标

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T2.1 | 替换 newtab.html 中侧边栏折叠按钮的 SVG 图标为 Lucide 的 chevron-left | T1.1 | 高 |
| T2.2 | 替换 newtab.html 中常用页面标题的 ⭐ 为 Lucide 的 star | T1.1 | 高 |
| T2.3 | 替换 newtab.html 中分组标题的 📁 为 Lucide 的 folder | T1.1 | 高 |
| T2.4 | 为搜索输入框添加 Lucide 的 search 图标前缀 | T1.1 | 中 |
| T2.5 | 替换 newtab.html 中添加页面按钮文字为图标+文字（plus） | T1.1 | 高 |
| T2.6 | 替换 newtab.html 中导出按钮文字为图标+文字（download） | T1.1 | 高 |
| T2.7 | 替换 newtab.html 中导入按钮文字为图标+文字（upload） | T1.1 | 高 |
| T2.8 | 替换 newtab.html 中添加分组按钮文字为图标+文字（plus） | T1.1 | 高 |
| T2.9 | 替换 newtab.html 中侧边栏添加标签按钮文字为图标+文字（plus） | T1.1 | 高 |

---

## 阶段 3：替换 newtab.js 中的动态图标

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T3.1 | 在 newtab.js 中添加 initLucideIcons() 函数 | T1.1 | 高 |
| T3.2 | 在 initNewtab() 函数末尾调用 initLucideIcons() | T3.1 | 高 |
| T3.3 | 在 renderAll() 函数末尾调用 initLucideIcons() | T3.1 | 高 |
| T3.4 | 替换 renderPageItem() 中的 ⭐ 为 Lucide 的 star | T3.3 | 高 |
| T3.5 | 替换 renderPageItem() 中的 ✏️ 为 Lucide 的 pencil | T3.3 | 高 |
| T3.6 | 替换 renderPageItem() 中的 🗑️ 为 Lucide 的 trash-2 | T3.3 | 高 |
| T3.7 | 替换 renderTags() 中的删除按钮 SVG 为 Lucide 的 trash-2 | T3.3 | 高 |
| T3.8 | 替换 renderEditingTag() 中的 ✓ 为 Lucide 的 check | T3.3 | 高 |
| T3.9 | 替换 renderEditingTag() 中的 ✕ 为 Lucide 的 x | T3.3 | 高 |
| T3.10 | 替换 renderGroups() 中的"打开全部"按钮为图标+文字（external-link） | T3.3 | 高 |
| T3.11 | 替换 renderGroups() 中的"编辑"按钮为图标+文字（pencil） | T3.3 | 高 |
| T3.12 | 替换 renderGroups() 中的"删除"按钮为图标+文字（trash-2） | T3.3 | 高 |
| T3.13 | 替换所有模态框中的"取消"按钮为图标+文字（x） | T3.3 | 中 |
| T3.14 | 替换所有模态框中的"保存"按钮为图标+文字（check） | T3.3 | 中 |

---

## 阶段 4：替换 popup.html 中的静态图标

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T4.1 | 替换 popup.html 中添加标签按钮文字为图标+文字（plus） | T1.2 | 高 |
| T4.2 | 替换 popup.html 中添加分组按钮文字为图标+文字（plus） | T1.2 | 高 |
| T4.3 | 替换 popup.html 中添加页面按钮文字为图标+文字（plus） | T1.2 | 高 |

---

## 阶段 5：替换 popup.js 中的动态图标

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T5.1 | 在 popup.js 中添加 initLucideIcons() 函数 | T1.2 | 高 |
| T5.2 | 在 initPopup() 函数末尾调用 initLucideIcons() | T5.1 | 高 |
| T5.3 | 在 renderTags() 函数末尾调用 initLucideIcons() | T5.1 | 高 |
| T5.4 | 在 renderGroups() 函数末尾调用 initLucideIcons() | T5.1 | 高 |

---

## 阶段 6：测试与验证

| 任务 ID | 任务描述 | 依赖 | 优先级 |
|---------|---------|------|--------|
| T6.1 | 验证 newtab.html 中所有静态图标正确显示 | T2.1-T2.9 | 高 |
| T6.2 | 验证 newtab.js 中所有动态图标正确显示 | T3.1-T3.14 | 高 |
| T6.3 | 验证 popup.html 中所有静态图标正确显示 | T4.1-T4.3 | 高 |
| T6.4 | 验证 popup.js 中所有动态图标正确显示 | T5.1-T5.4 | 高 |
| T6.5 | 验证所有按钮功能正常工作 | T6.1-T6.4 | 高 |
| T6.6 | 验证侧边栏折叠功能正常 | T6.1-T6.4 | 高 |
| T6.7 | 验证动态渲染后图标正确显示（添加/编辑/删除操作后） | T6.1-T6.4 | 高 |

---

## 执行顺序

### 第一波（并行）
- [P] T1.1, T1.2

### 第二波（并行，依赖 T1）
- [P] T2.1, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8, T2.9
- [P] T4.1, T4.2, T4.3

### 第三波（串行，依赖 T1）
- T3.1 → T3.2 → T3.3 → T3.4 → T3.5 → T3.6 → T3.7 → T3.8 → T3.9 → T3.10 → T3.11 → T3.12 → T3.13 → T3.14

### 第四波（串行，依赖 T1）
- T5.1 → T5.2 → T5.3 → T5.4

### 第五波（串行，依赖前面所有）
- T6.1 → T6.2 → T6.3 → T6.4 → T6.5 → T6.6 → T6.7
