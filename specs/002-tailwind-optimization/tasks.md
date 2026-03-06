# 使用 Tailwind 优化用户界面 - 任务列表
# Version: 1.0, Created: 2026-03-06

---

## 阶段 1: Tailwind 集成

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T1-1 | 在 popup.html 中引入 Tailwind CDN | - | pending |
| T1-2 | 在 newtab.html 中引入 Tailwind CDN | - | pending |
| T1-3 | 删除 popup.css 文件 | T1-1 | pending |
| T1-4 | 删除 newtab.css 文件 | T1-2 | pending |

---

## 阶段 2: Popup 页面重写

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T2-1 | 用 Tailwind 类重写 popup.html 容器和整体布局 | T1-1 | pending |
| T2-2 | 用 Tailwind 类重写 popup.html 页面信息展示区域 | T2-1 | pending |
| T2-3 | 用 Tailwind 类重写 popup.html 标签区域 | T2-2 | pending |
| T2-4 | 用 Tailwind 类重写 popup.html 分组选择区域 | T2-3 | pending |
| T2-5 | 用 Tailwind 类重写 popup.html 按钮样式 | T2-4 | pending |
| T2-6 | 测试 popup 页面显示正常 | T2-5 | pending |
| T2-7 | 验证交互反馈（hover/active 状态） | T2-6 | pending |

---

## 阶段 3: Newtab 页面 - 基础结构

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T3-1 | 用 Tailwind 类重写 newtab.html 头部容器 | T1-2 | pending |
| T3-2 | 用 Tailwind 类重写 newtab.html 标题和搜索框 | T3-1 | pending |
| T3-3 | 用 Tailwind 类重写 newtab.html 头部按钮样式 | T3-2 | pending |
| T3-4 | 用 Tailwind 类重写常用页面区域 | T3-3 | pending |
| T3-5 | 用 Tailwind 类重写标签筛选区域 | T3-4 | pending |

---

## 阶段 4: Newtab 页面 - 分组和列表

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T4-1 | 用 Tailwind 类重写分组区域头部 | T3-5 | pending |
| T4-2 | 用 Tailwind 类重写分组卡片样式 | T4-1 | pending |
| T4-3 | 用 Tailwind 类重写页面列表项样式 | T4-2 | pending |
| T4-4 | 用 Tailwind 类重写模态框样式 | T4-3 | pending |
| T4-5 | 检查 newtab.js 中动态创建的元素样式 | T4-4 | pending |

---

## 阶段 5: 设计系统统一

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T5-1 | 确保 popup 和 newtab 中所有主按钮样式统一 | T2-5, T3-3 | pending |
| T5-2 | 确保 popup 和 newtab 中所有次按钮样式统一 | T5-1 | pending |
| T5-3 | 确保 popup 和 newtab 中所有小按钮样式统一 | T5-2 | pending |
| T5-4 | 确保 popup 和 newtab 中所有危险按钮样式统一 | T5-3 | pending |
| T5-5 | 确保所有输入框样式统一 | T5-4 | pending |
| T5-6 | 确保所有下拉选择样式统一 | T5-5 | pending |
| T5-7 | 确保所有卡片样式统一 | T5-6 | pending |
| T5-8 | 确保所有过渡动画一致 | T5-7 | pending |

---

## 阶段 6: 测试和验证

| ID | 任务描述 | 依赖 | 状态 |
|----|----------|------|------|
| T6-1 | 测试 popup 页面加载时间（< 150ms） | T2-7, T5-8 | pending |
| T6-2 | 测试 newtab 页面加载时间（< 350ms） | T4-5, T5-8 | pending |
| T6-3 | 验证 popup 所有交互反馈正常 | T2-7 | pending |
| T6-4 | 验证 newtab 所有交互反馈正常 | T4-5 | pending |
| T6-5 | 验证响应式布局在不同屏幕尺寸下正常 | T6-4 | pending |
| T6-6 | 验证可访问性（对比度符合 WCAG AA） | T6-5 | pending |
| T6-7 | 完整功能回归测试 | T6-6 | pending |

---

## 任务依赖关系图

```
阶段 1
├─ T1-1 [P]
├─ T1-2 [P]
├─ T1-3 (依赖 T1-1)
└─ T1-4 (依赖 T1-2)

阶段 2 (依赖 T1-1)
├─ T2-1
├─ T2-2
├─ T2-3
├─ T2-4
├─ T2-5
├─ T2-6
└─ T2-7

阶段 3 (依赖 T1-2)
├─ T3-1
├─ T3-2
├─ T3-3
├─ T3-4
└─ T3-5

阶段 4 (依赖 T3-5)
├─ T4-1
├─ T4-2
├─ T4-3
├─ T4-4
└─ T4-5

阶段 5 (依赖 T2-5, T3-3, T4-5)
├─ T5-1
├─ T5-2
├─ T5-3
├─ T5-4
├─ T5-5
├─ T5-6
├─ T5-7
└─ T5-8

阶段 6 (依赖 T2-7, T4-5, T5-8)
├─ T6-1
├─ T6-2
├─ T6-3
├─ T6-4
├─ T6-5
├─ T6-6
└─ T6-7
```

---

## 并行任务说明

- **[P]** 标记表示该任务可以与其他任务并行执行
- 阶段 1 中的 T1-1 和 T1-2 可以并行执行
- 阶段 2 和阶段 3 可以部分并行（分别依赖 T1-1 和 T1-2）

---

## 验收检查清单

完成所有任务后，请验证以下项目：

- [ ] 所有 CSS 文件已删除
- [ ] 所有 HTML 文件已引入 Tailwind CDN
- [ ] 所有样式使用 Tailwind 类实现
- [ ] 设计系统统一（色彩、间距、圆角、阴影）
- [ ] 所有按钮有四种变体（主、次、小、危险）
- [ ] 所有可交互元素有 hover/active 状态
- [ ] 所有过渡动画一致（0.2s）
- [ ] 页面加载时间符合要求
- [ ] 响应式布局正常
- [ ] 可访问性符合要求
- [ ] 所有功能正常工作
