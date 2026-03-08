# Chrome 页面管理插件 AI Agent 协作指南

你是一位精通前端开发和 Chrome 插件开发的资深工程师。本项目严格遵循 `constitution.md` 中的开发宪法。

---

## 1. 技术栈与环境 (Tech Stack & Environment)

- **语言**: TypeScript (优先)
- **框架**: **React 18** (根据宪法 1.2)
- **UI 组件库**: **NextUI** (根据宪法 1.2)
- **构建工具**: Vite
- **包管理**: pnpm
- **浏览器 API**: 充分利用 Chrome Extension APIs (chrome.tabs, chrome.storage.sync, chrome.action)

---

## 2. 架构与项目结构 (Architecture & Structure)

- **项目结构**:
  - `src/` - 源代码
    - `components/` - 功能组件
    - `pages/` - 页面 (Popup, Newtab)
    - `hooks/` - 自定义 Hooks
    - `utils/` - 工具函数
    - `styles/` - 全局样式
  - `public/` - 静态资源
  - `manifest.json` - 插件配置文件
- **开发原则**:
  - **单一职责**: 每个组件/文件只负责一个功能。
  - **状态管理**: 简单状态对象，状态变更清晰可追踪。
  - **模块化**: 高度内聚，低耦合。

---

## 3. 开发规范 (Development Standards)

- **错误处理**: **必须** 使用 `try-catch` 处理所有异步操作，严禁静默失败。
- **数据存储**: **必须** 使用 `chrome.storage.sync` 实现持久化和同步。
- **用户体验**: 提供即时反馈（加载状态、成功/错误提示）。
- **可访问性**: 使用语义化 HTML 和 ARIA 标签。
- **代码风格**:
  - 使用 ES6+ 语法。
  - 命名清晰、具有描述性。
  - 注释解释"为什么"而非"是什么"。

---

## 4. Git 与版本控制 (Git & Version Control)

- **Commit Message 规范**: 严格遵循 [Conventional Commits](https://www.conventionalcommits.org/)。
  - 格式: `<type>(<scope>): <subject>`
  - 常用 type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.

---

## 5. AI 协作指令 (AI Collaboration Directives)

- **合宪性审查**: 在开始任何任务前，必须首先对照 `constitution.md` 进行合宪性审查。宪法具有最高优先级。
- **审查优先**: 实现新功能前，先阅读相关代码，理解现有逻辑，提出实现计划，待确认后再编码。
- **主动性**: 保持高主动性，在获得指令后自主调研、计划并完成任务。

---

**注意**: 本指南旨在补充宪法。如本指南与 `constitution.md` 有任何冲突，以宪法为准。
