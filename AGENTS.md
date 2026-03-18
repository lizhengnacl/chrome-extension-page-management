# AGENTS.md

## 项目概览

**项目名称**: 页集 (TabStack)  
**项目类型**: Chrome 浏览器扩展程序  
**技术栈**: React 18 + TypeScript + Tailwind CSS + NextUI + Rsbuild

## 项目简介

「页集」是一个轻量级、支持多维度组织的网页收藏与管理工具，旨在替代浏览器原生书签。其核心价值在于通过"多级标签"进行细致的内容管理，并通过"分组"实现一键打开特定场景下的所有相关页面。

## 开发规范

### 文件结构
```
specs/
└── {编号}-{功能描述}/
    ├── spec.md      # 需求规格
    ├── plan.md      # 技术方案
    └── tasks.md     # 任务列表
```

### 核心原则
1. **TDD 优先**: 测试先行，红灯-绿灯-重构
2. **包内聚**: 模块设计遵循高内聚低耦合
3. **错误处理**: 完善的异常捕获和用户友好的错误提示
4. **渐进式开发**: 分阶段交付，每个阶段都有可验证的成果

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建项目
pnpm build

# 预览构建结果
pnpm preview

# 生成图标
pnpm generate-icons
```

## 技术栈详情

- **UI 框架**: React 18
- **类型安全**: TypeScript
- **样式方案**: Tailwind CSS
- **组件库**: NextUI
- **构建工具**: Rsbuild
- **拖拽功能**: @dnd-kit
- **图标库**: lucide-react
- **动画**: framer-motion

## Chrome 扩展权限

- `storage`: 数据存储与同步
- `tabs`: 标签页管理
- `bookmarks`: 书签导入导出

## 快捷键

- `Ctrl+Shift+S` (Windows) / `Command+Shift+S` (Mac): 快速打开收藏面板

## 项目维护者

本项目使用 AI 辅助开发，遵循上述工作流程进行功能迭代和维护。
