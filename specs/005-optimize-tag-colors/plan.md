# 标签颜色优化技术实现方案
# Version: 1.0, Created: 2026-03-07

---

## 1. 技术上下文总结

### 1.1 项目现状
- 当前项目使用简单的字符哈希算法从 6 种预设颜色中选择标签颜色
- 颜色逻辑分散在 newtab.js 的 `getColorForTagName` 函数中
- 使用 `DEFAULT_TAG_COLORS` 常量数组存储预设颜色
- 标签数据存储在 chrome.storage.sync 中

### 1.2 技术选型
- **编程语言**: 原生 JavaScript (ES6+)
- **色彩空间**: HSL (Hue-Saturation-Lightness)
- **存储方案**: 保持现有 chrome.storage.sync
- **架构**: 保持现有模块化架构

### 1.3 核心技术点
1. 字符串哈希算法生成 HSL 参数
2. HSL 到 RGB 再到 hex 的颜色转换
3. 相对亮度和对比度计算
4. 现有标签数据的自动迁移

---

## 2. "合宪性"审查

### 2.1 简单性原则 (Simplicity First) ✓
- **YAGNI**: 只实现需求中明确的功能，不引入额外功能
- **原生优先**: 使用原生 JavaScript，不引入任何第三方库
- **反过度工程**: 使用简单的函数实现，避免复杂设计模式
- **结论**: 符合要求

### 2.2 用户体验铁律 (User Experience Imperative) ✓
- **即时反馈**: 颜色生成是即时的，无需等待
- **快速访问**: 算法优化确保 < 1ms 的颜色生成时间
- **直观操作**: 迁移对用户透明，无需额外操作
- **结论**: 符合要求

### 2.3 明确性原则 (Clarity and Explicitness) ✓
- **错误处理**: 所有颜色生成函数都有 try-catch 和回退机制
- **状态管理**: 使用简单的函数调用，无复杂状态管理
- **注释**: 关键算法逻辑有清晰注释
- **结论**: 符合要求

### 2.4 Chrome API 优先原则 (Chrome API First) ✓
- **数据持久化**: 继续使用 chrome.storage.sync
- **插件管理**: 无需新增 Chrome API 调用
- **结论**: 符合要求

### 2.5 单一职责原则 (Single Responsibility) ✓
- **文件内聚**: 颜色逻辑封装在独立模块中
- **组件化**: 每个颜色函数负责单一职责
- **结论**: 符合要求

### 2.6 可访问性原则 (Accessibility) ✓
- **语义化 HTML**: 无需修改 HTML 结构
- **键盘导航**: 无需修改键盘操作
- **ARIA 标签**: 无需修改 ARIA 标签
- **对比度**: 专门实现对比度计算，符合 WCAG 标准
- **结论**: 符合要求

---

## 3. 项目结构细化

### 3.1 文件结构变更
```
/Users/bytedance/code/chrome-extension-page-management/
├── lib/
│   ├── constants.js          (修改: 移除 DEFAULT_TAG_COLORS)
│   ├── storage.js            (修改: 添加迁移逻辑)
│   └── colors.js             (新增: 颜色工具模块)
├── newtab/
│   └── newtab.js             (修改: 使用新颜色逻辑)
└── specs/005-optimize-tag-colors/
    ├── spec.md
    ├── plan.md
    └── tasks.md
```

### 3.2 新增模块: lib/colors.js
独立封装所有颜色相关逻辑，便于测试和维护。

---

## 4. 核心数据结构

### 4.1 标签数据结构 (保持不变)
```javascript
interface Tag {
  id: string;
  name: string;
  color: string;  // hex 格式，如 "#3b82f6"
}
```

### 4.2 HSL 颜色结构 (内部使用)
```javascript
interface HSLColor {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}
```

### 4.3 RGB 颜色结构 (内部使用)
```javascript
interface RGBColor {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}
```

---

## 5. 接口设计

### 5.1 公共 API (lib/colors.js)

#### 5.1.1 generateColorFromTagName(tagName: string): string
基于标签名称生成唯一的 hex 颜色。

**参数:**
- `tagName`: 标签名称字符串

**返回值:**
- hex 颜色字符串，如 "#3b82f6"

**实现细节:**
1. 标准化标签名称（去空格、转小写）
2. 计算字符串哈希值
3. 基于哈希生成 HSL 参数
4. 转换 HSL 为 RGB，再转换为 hex
5. 异常时返回默认颜色 "#3b82f6"

---

#### 5.1.2 getRelativeLuminance(hexColor: string): number
计算颜色的相对亮度（用于对比度计算）。

**参数:**
- `hexColor`: hex 颜色字符串

**返回值:**
- 相对亮度值（0-1）

**实现细节:**
- 遵循 WCAG G17 标准
- 使用 sRGB 色彩空间的 gamma 校正

---

#### 5.1.3 getContrastRatio(color1: string, color2: string): number
计算两个颜色的对比度比值。

**参数:**
- `color1`: 第一个 hex 颜色
- `color2`: 第二个 hex 颜色

**返回值:**
- 对比度比值（1-21）

**实现细节:**
- 基于相对亮度计算
- 对比度 = (L1 + 0.05) / (L2 + 0.05)，其中 L1 > L2

---

#### 5.1.4 getAccessibleTextColor(bgColor: string): string
根据背景色返回合适的文字颜色（白色或黑色）。

**参数:**
- `bgColor`: 背景色 hex 字符串

**返回值:**
- "#ffffff" 或 "#000000"

**实现细节:**
- 计算背景色的相对亮度
- 亮度 > 0.5 使用黑色，否则使用白色

---

### 5.2 内部辅助函数 (lib/colors.js)

#### 5.2.1 hashString(str: string): number
字符串哈希函数。

**参数:**
- `str`: 输入字符串

**返回值:**
- 32 位整数哈希值

**实现细节:**
- 使用简单但稳定的哈希算法
- 确保相同输入总是产生相同输出

---

#### 5.2.2 hslToRgb(h: number, s: number, l: number): RGBColor
HSL 到 RGB 颜色转换。

**参数:**
- `h`: 色相 (0-360)
- `s`: 饱和度 (0-100)
- `l`: 亮度 (0-100)

**返回值:**
- RGBColor 对象

---

#### 5.2.3 rgbToHex(r: number, g: number, b: number): string
RGB 到 hex 颜色转换。

**参数:**
- `r`: 红色分量 (0-255)
- `g`: 绿色分量 (0-255)
- `b`: 蓝色分量 (0-255)

**返回值:**
- hex 颜色字符串

---

#### 5.2.4 hexToRgb(hex: string): RGBColor | null
hex 到 RGB 颜色转换。

**参数:**
- `hex`: hex 颜色字符串

**返回值:**
- RGBColor 对象，失败时返回 null

---

### 5.3 存储层接口 (lib/storage.js)

#### 5.3.1 migrateTagColors(): Promise<void>
迁移现有标签颜色到新系统。

**实现细节:**
1. 获取所有现有标签
2. 为每个标签使用新算法重新生成颜色
3. 批量更新存储
4. 记录迁移日志

---

### 5.4 初始化流程修改

在 `initStorage()` 中添加迁移检查：
```javascript
async function initStorage() {
  // ... 现有代码 ...
  await migrateTagColorsIfNeeded();
}
```

---

## 6. 实现步骤

### 阶段 1: 基础设施搭建
1. 创建 lib/colors.js 模块
2. 实现基础颜色转换函数（hex ↔ RGB ↔ HSL）
3. 实现字符串哈希函数

### 阶段 2: 核心颜色算法
1. 实现 generateColorFromTagName 函数
2. 实现相对亮度计算函数
3. 实现对比度计算函数
4. 实现文字颜色选择函数

### 阶段 3: 集成与迁移
1. 修改 lib/storage.js，添加迁移逻辑
2. 修改 newtab.js，替换旧的颜色逻辑
3. 修改 lib/constants.js，移除 DEFAULT_TAG_COLORS（保留向后兼容）
4. 在初始化时自动执行迁移

### 阶段 4: 测试验证
1. 测试颜色生成的一致性
2. 测试对比度计算的准确性
3. 测试迁移功能的正确性
4. 性能测试（< 1ms 单个颜色生成）

---

## 7. 验收检查清单

- [ ] lib/colors.js 模块创建完成
- [ ] 所有颜色转换函数实现并测试
- [ ] generateColorFromTagName 函数正确工作
- [ ] 对比度计算符合 WCAG 标准
- [ ] 现有标签迁移功能正常
- [ ] 新标签创建使用新算法
- [ ] 单个颜色生成时间 < 1ms
- [ ] 批量迁移 100 个标签 < 100ms
- [ ] 所有现有功能继续正常工作
- [ ] 代码有清晰的注释
- [ ] 错误处理完善

