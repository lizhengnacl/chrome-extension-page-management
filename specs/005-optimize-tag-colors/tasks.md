# 标签颜色优化任务执行清单
# Version: 1.0, Created: 2026-03-07

---

## 阶段 1: 基础设施搭建 - 测试先行

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-1.1 | 创建 lib/colors.js 模块文件 | 无 | P0 | pending |
| TASK-1.2 | 实现 hashString() 函数测试用例 | TASK-1.1 | P0 | pending |
| TASK-1.3 | 实现 hexToRgb() 函数测试用例 | TASK-1.1 | P0 | pending |
| TASK-1.4 | 实现 rgbToHex() 函数测试用例 | TASK-1.1 | P0 | pending |
| TASK-1.5 | 实现 hslToRgb() 函数测试用例 | TASK-1.1 | P0 | pending |

---

## 阶段 2: 基础设施搭建 - 实现

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-2.1 | 实现 hashString() 函数 | TASK-1.2 | P0 | pending |
| TASK-2.2 | 实现 hexToRgb() 函数 | TASK-1.3 | P0 | pending |
| TASK-2.3 | 实现 rgbToHex() 函数 | TASK-1.4 | P0 | pending |
| TASK-2.4 | 实现 hslToRgb() 函数 | TASK-1.5 | P0 | pending |

---

## 阶段 3: 核心颜色算法 - 测试先行

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-3.1 | 实现 generateColorFromTagName() 函数测试用例 | TASK-2.4 | P0 | pending |
| TASK-3.2 | 实现 getRelativeLuminance() 函数测试用例 | TASK-2.2 | P0 | pending |
| TASK-3.3 | 实现 getContrastRatio() 函数测试用例 | TASK-3.2 | P0 | pending |
| TASK-3.4 | 实现 getAccessibleTextColor() 函数测试用例 | TASK-3.2 | P0 | pending |

---

## 阶段 4: 核心颜色算法 - 实现

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-4.1 | 实现 generateColorFromTagName() 函数 | TASK-3.1 | P0 | pending |
| TASK-4.2 | 实现 getRelativeLuminance() 函数 | TASK-3.2 | P0 | pending |
| TASK-4.3 | 实现 getContrastRatio() 函数 | TASK-3.3 | P0 | pending |
| TASK-4.4 | 实现 getAccessibleTextColor() 函数 | TASK-3.4 | P0 | pending |
| TASK-4.5 | 导出 lib/colors.js 的公共 API | TASK-4.1, TASK-4.2, TASK-4.3, TASK-4.4 | P0 | pending |

---

## 阶段 5: 集成与迁移

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-5.1 | 在 lib/storage.js 中添加 migrateTagColors() 函数 | TASK-4.5 | P0 | pending |
| TASK-5.2 | 在 lib/storage.js 中添加迁移版本标记 | TASK-5.1 | P0 | pending |
| TASK-5.3 | 修改 lib/storage.js 的 initStorage()，添加迁移调用 | TASK-5.2 | P0 | pending |
| TASK-5.4 | 修改 newtab.js，替换 getColorForTagName() 使用新 API | TASK-4.5 | P0 | pending |
| TASK-5.5 | 更新 newtab.js 的导入语句，从 colors.js 导入 | TASK-5.4 | P0 | pending |
| TASK-5.6 | 修改 lib/constants.js，保留 DEFAULT_TAG_COLORS 用于向后兼容 | TASK-4.5 | P1 | pending |
| TASK-5.7 | 导出 lib/storage.js 的新函数 | TASK-5.3 | P0 | pending |

---

## 阶段 6: 测试验证

| ID | 任务描述 | 依赖 | 优先级 | 状态 |
|----|----------|------|--------|------|
| TASK-6.1 | 测试颜色生成的一致性（相同名称生成相同颜色） | TASK-4.1 | P0 | pending |
| TASK-6.2 | 测试不同名称生成不同颜色 | TASK-4.1 | P0 | pending |
| TASK-6.3 | 测试对比度计算准确性 | TASK-4.3 | P0 | pending |
| TASK-6.4 | 测试文字颜色选择正确性 | TASK-4.4 | P0 | pending |
| TASK-6.5 | 测试迁移功能的正确性 | TASK-5.3 | P0 | pending |
| TASK-6.6 | 性能测试：单个颜色生成 < 1ms | TASK-4.1 | P0 | pending |
| TASK-6.7 | 性能测试：批量迁移 100 个标签 < 100ms | TASK-5.3 | P0 | pending |
| TASK-6.8 | 验证所有现有功能继续正常工作 | TASK-5.5 | P0 | pending |
| TASK-6.9 | 验证新标签创建使用新算法 | TASK-5.4 | P0 | pending |
| TASK-6.10 | 验证代码有清晰注释 | TASK-4.5 | P0 | pending |
| TASK-6.11 | 验证错误处理完善 | TASK-4.5 | P0 | pending |

---

## 执行顺序说明

### 并行任务组 [P]
以下任务可以并行执行：
- 阶段 1 的所有测试用例编写任务（TASK-1.2 到 TASK-1.5）
- 阶段 2 的所有基础函数实现任务（TASK-2.1 到 TASK-2.4）
- 阶段 3 的所有核心算法测试用例编写任务（TASK-3.1 到 TASK-3.4）
- 阶段 4 的所有核心算法实现任务（TASK-4.1 到 TASK-4.4）

### 依赖关系图
```
阶段 1 (测试先行 - 基础设施)
  ↓
阶段 2 (实现 - 基础设施)
  ↓
阶段 3 (测试先行 - 核心算法)
  ↓
阶段 4 (实现 - 核心算法)
  ↓
阶段 5 (集成与迁移)
  ↓
阶段 6 (测试验证)
```

### 详细执行顺序
1. 首先执行 TASK-1.1（创建 colors.js 模块）
2. 然后并行执行阶段 1 的测试用例编写（TASK-1.2 到 TASK-1.5）
3. 测试用例完成后，并行执行阶段 2 的基础函数实现（TASK-2.1 到 TASK-2.4）
4. 基础函数完成后，并行执行阶段 3 的核心算法测试用例（TASK-3.1 到 TASK-3.4）
5. 核心算法测试用例完成后，并行执行阶段 4 的核心算法实现（TASK-4.1 到 TASK-4.4）
6. 核心算法完成后，顺序执行阶段 5 的集成与迁移任务
7. 集成完成后，顺序执行阶段 6 的测试验证任务

---

## 验收检查清单

- [x] lib/colors.js 模块创建完成
- [x] hashString() 函数实现并测试
- [x] hexToRgb() 函数实现并测试
- [x] rgbToHex() 函数实现并测试
- [x] hslToRgb() 函数实现并测试
- [x] generateColorFromTagName() 函数正确工作
- [x] getRelativeLuminance() 函数正确工作
- [x] getContrastRatio() 函数符合 WCAG 标准
- [x] getAccessibleTextColor() 函数正确工作
- [x] lib/colors.js 公共 API 导出完成
- [x] lib/storage.js 迁移逻辑添加完成
- [x] newtab.js 使用新颜色 API
- [x] DEFAULT_TAG_COLORS 保留向后兼容
- [x] 现有标签迁移功能正常
- [x] 新标签创建使用新算法
- [x] 单个颜色生成时间 < 1ms
- [x] 批量迁移 100 个标签 < 100ms
- [x] 所有现有功能继续正常工作
- [x] 代码有清晰的注释
- [x] 错误处理完善

