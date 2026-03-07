# Chrome 页面管理插件 React + NextUI 重构任务列表
# Version: 1.0, Created: 2026-03-07

## 任务执行说明
- [P] 标记的任务可以并行执行
- 任务按阶段执行，前一阶段完成后才能进入下一阶段

---

## 阶段 1：项目初始化与配置

| ID | 任务描述 | 优先级 | 依赖 | 状态 |
|----|----------|--------|------|------|
| T1-01 | 更新 constitution.md，修改相关条款 | P0 | - | pending |
| T1-02 | 创建 legacy/ 目录，移动原有代码 | P0 | T1-01 | pending |
| T1-03 | 更新 package.json，添加 React、NextUI、Vite 等依赖 | P0 | T1-02 | pending |
| T1-04 | 创建 src/ 目录结构 | P0 | T1-03 | pending |
| T1-05 | 创建 vite.config.ts 配置文件 | P0 | T1-04 | pending |
| T1-06 | 更新 tailwind.config.js，配置 NextUI 主题 | P0 | T1-05 | pending |
| T1-07 | 创建 postcss.config.js 配置文件 | P0 | T1-06 | pending |
| T1-08 | 创建 public/ 目录，移动图标文件 | P0 | T1-07 | pending |
| T1-09 | 创建 src/styles/globals.css 全局样式文件 | P0 | T1-08 | pending |
| T1-10 | 创建 src/providers/AppProvider.tsx | P0 | T1-09 | pending |
| T1-11 | 创建 src/popup.html 入口文件 | P0 | T1-10 | pending |
| T1-12 | 创建 src/newtab.html 入口文件 | P0 | T1-11 | pending |
| T1-13 | 创建 src/popup.tsx React 入口 | P0 | T1-12 | pending |
| T1-14 | 创建 src/newtab.tsx React 入口 | P0 | T1-13 | pending |
| T1-15 | 更新 manifest.json，指向 dist/ 目录 | P0 | T1-14 | pending |

---

## 阶段 2：基础设施迁移

| ID | 任务描述 | 优先级 | 依赖 | 状态 |
|----|----------|--------|------|------|
| T2-01 | 创建 src/types/index.ts 类型定义文件 | P0 | T1-15 | pending |
| T2-02 | 迁移 lib/constants.js → src/utils/constants.ts | P0 | T2-01 | pending |
| T2-03 | 迁移 lib/colors.js → src/utils/colors.ts | P0 | T2-02 | pending |
| T2-04 | 迁移 lib/icons.js → src/utils/icons.ts | P0 | T2-03 | pending |
| T2-05 | 迁移 lib/utils.js → src/utils/utils.ts | P0 | T2-04 | pending |
| T2-06 | 迁移 lib/storage.js → src/utils/storage.ts | P0 | T2-05 | pending |
| T2-07 | 创建 src/hooks/useStorage.ts | P0 | T2-06 | pending |
| T2-08 | 创建 src/hooks/usePages.ts | P0 | T2-07 | pending |
| T2-09 | 创建 src/hooks/useGroups.ts | P0 | T2-08 | pending |
| T2-10 | 创建 src/hooks/useTags.ts | P0 | T2-09 | pending |
| T2-11 | 创建 src/components/common/Button.tsx | P0 | T2-10 | pending |
| T2-12 | 创建 src/components/common/Input.tsx | P0 | T2-11 | pending |
| T2-13 | 创建 src/components/common/Modal.tsx | P0 | T2-12 | pending |
| T2-14 | 创建 src/components/common/Card.tsx | P0 | T2-13 | pending |
| T2-15 | 创建 src/components/common/Tag.tsx | P0 | T2-14 | pending |

---

## 阶段 3：Popup 页面重构

| ID | 任务描述 | 优先级 | 依赖 | 状态 |
|----|----------|--------|------|------|
| T3-01 | 创建 src/components/popup/PageInfo.tsx | P0 | T2-15 | pending |
| T3-02 | 创建 src/components/popup/TagSelector.tsx | P0 | T3-01 | pending |
| T3-03 | 创建 src/components/popup/GroupSelector.tsx | P0 | T3-02 | pending |
| T3-04 | 创建 src/pages/Popup.tsx | P0 | T3-03 | pending |
| T3-05 | 集成 Popup 页面所有功能 | P0 | T3-04 | pending |
| T3-06 | 测试 Popup 页面功能完整性 | P0 | T3-05 | pending |

---

## 阶段 4：Newtab 页面重构

| ID | 任务描述 | 优先级 | 依赖 | 状态 |
|----|----------|--------|------|------|
| T4-01 | 创建 src/components/newtab/Sidebar.tsx | P0 | T2-15 | pending |
| T4-02 | 创建 src/components/newtab/TagList.tsx | P0 | T4-01 | pending |
| T4-03 | 创建 src/components/newtab/PageItem.tsx | P0 | T4-02 | pending |
| T4-04 | 创建 src/components/newtab/PageList.tsx | P0 | T4-03 | pending |
| T4-05 | 创建 src/components/newtab/FavoritesSection.tsx | P0 | T4-04 | pending |
| T4-06 | 创建 src/components/newtab/GroupsSection.tsx | P0 | T4-05 | pending |
| T4-07 | 创建 src/pages/Newtab.tsx | P0 | T4-06 | pending |
| T4-08 | 集成 Newtab 页面所有功能 | P0 | T4-07 | pending |
| T4-09 | 测试 Newtab 页面功能完整性 | P0 | T4-08 | pending |

---

## 阶段 5：优化与测试

| ID | 任务描述 | 优先级 | 依赖 | 状态 |
|----|----------|--------|------|------|
| T5-01 | 配置 Vite 代码分割优化 | P1 | T4-09 | pending |
| T5-02 | 优化组件渲染性能（React.memo） | P1 | T5-01 | pending |
| T5-03 | 完整功能回归测试 | P0 | T5-02 | pending |
| T5-04 | 检查构建产物大小 | P0 | T5-03 | pending |
| T5-05 | 测试页面加载时间 | P0 | T5-04 | pending |
| T5-06 | 完善代码注释和文档 | P2 | T5-05 | pending |

---

## 任务依赖关系图

```
阶段 1 → 阶段 2 → 阶段 3 → 阶段 4 → 阶段 5
          ↓
    (并行任务)
```

## 关键里程碑

| 里程碑 | 描述 | 完成任务 |
|--------|------|----------|
| M1 | 项目初始化完成 | T1-01 至 T1-15 |
| M2 | 基础设施迁移完成 | T2-01 至 T2-15 |
| M3 | Popup 页面重构完成 | T3-01 至 T3-06 |
| M4 | Newtab 页面重构完成 | T4-01 至 T4-09 |
| M5 | 项目重构完成 | T5-01 至 T5-06 |
