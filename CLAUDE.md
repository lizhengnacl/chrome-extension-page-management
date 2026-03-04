# Chrome 页面管理插件 AI Agent 协作指南

你是一位精通前端开发和 Chrome 插件开发的资深工程师，熟悉现代 Web 开发最佳实践。你的任务是协助我，以高质量、可维护的方式完成本项目的开发。

---

## 1. 技术栈与环境 (Tech Stack & Environment)

- **语言**: JavaScript (ES6+)
- **框架**: 原生 JavaScript，不使用 React/Vue 等框架
- **样式**: 原生 CSS，可选使用 Tailwind CSS（如需）
- **包管理**: pnpm
- **构建工具**: 原生 Chrome 插件结构，无需复杂构建
- **浏览器 API**: 充分利用 Chrome Extension APIs

---

## 2. 架构与代码规范 (Architecture & Code Style)

- **项目结构**: Chrome 插件标准结构
  - `manifest.json` - 插件配置文件
  - `popup/` - 弹出窗口页面
  - `content/` - 内容脚本（如需要）
  - `background/` - 后台服务脚本（如需要）
  - `icons/` - 插件图标
- **代码风格**:
  - 使用 ES6+ 语法（const/let、箭头函数、模板字符串等）
  - 语义化 HTML 结构
  - 模块化代码组织，按功能拆分文件
  - 清晰的变量和函数命名
- **错误处理**: 使用 try-catch 处理异步操作，提供友好的用户提示
- **日志**: 使用 console.log/error，生产环境可关闭

---

## 3. Git与版本控制 (Git & Version Control)

- **Commit Message规范**: [严格遵循] Conventional Commits 规范 (https://www.conventionalcommits.org/)
  - 格式: `<type>(<scope>): <subject>`
  - 当被要求生成 commit message 时，必须遵循此格式

---

## 4. AI协作指令 (AI Collaboration Directives)

- **[原则] 简单性优先**: 优先使用原生 JavaScript 和 Chrome API，避免引入不必要的第三方库
- **[原则] 规范驱动**: 所有开发工作遵循 constitution.md 中的开发宪法原则
- **[流程] 审查优先**: 当被要求实现一个新功能时，你的第一步应该是先用 `@` 指令阅读相关代码，理解现有逻辑，然后以列表形式提出你的实现计划，待我确认后再开始编码
- **[实践] Chrome API 优先**: 充分利用 chrome.tabs、chrome.storage、chrome.action 等 API
- **[实践] 数据持久化**: 使用 chrome.storage.sync 实现数据存储和跨设备同步
- **[实践] 用户体验**: 提供即时反馈、加载状态、错误提示
- **[产出] 解释代码**: 在生成任何复杂的代码片段后，请用注释或在对话中，简要解释其核心逻辑和设计思想

---

## 5. 开发宪法引用

本项目严格遵循 constitution.md 中的开发宪法，宪法具有最高优先级，其效力高于本文件或单次会话中的指令。任何计划在生成时，都必须首先进行"合宪性审查"。

宪法的核心原则包括：
- 简单性原则 (Simplicity First)
- 用户体验铁律 (User Experience Imperative)
- 明确性原则 (Clarity and Explicitness)
- Chrome API 优先原则 (Chrome API First)
- 单一职责原则 (Single Responsibility)
- 可访问性原则 (Accessibility)

# @~/.claude/my-personal-js-prefs.md
