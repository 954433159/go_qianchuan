# 前端重构方案 01 - 设计系统迁移与统一

> **目标**: 将静态页面的千川品牌设计系统完整迁移到 React 前端项目，确保视觉一致性和用户体验统一

## 📋 目录

1. [现状分析](#现状分析)
2. [设计系统对比](#设计系统对比)
3. [迁移方案](#迁移方案)
4. [实施步骤](#实施步骤)
5. [验收标准](#验收标准)

---

## 现状分析

### 静态页面设计系统 (html/qianchuan/design-system.css)

静态页面使用了完整的千川品牌设计系统，包含：

**核心特点:**
- ✅ 完整的千川品牌色彩系统（红橙渐变）
- ✅ 标准化的间距、圆角、阴影系统
- ✅ 科学的动画过渡系统
- ✅ 统一的组件样式类（.qc-*）
- ✅ 语义化的颜色变量（GMV、ROI等）

### 当前前端实现 (frontend/)

**当前技术栈:**
- Tailwind CSS 3.x
- Radix UI 组件库
- CSS Variables (HSL色彩空间)
- Tremor React (图表库)

**存在问题:**
- ❌ 品牌色偏蓝色系（primary-500: #0ea5e9），与千川红橙渐变不符
- ❌ 缺少千川特色的渐变色定义
- ❌ 缺少业务语义化颜色（GMV高亮、ROI分级）
- ❌ 动画系统简单，缺少品牌特色动画
- ❌ 组件样式不统一，没有标准化的类名规范

---

## 设计系统对比

### 1. 色彩系统对比

#### 静态页面色彩定义

```css
/* 千川品牌渐变 */
--qc-primary-gradient: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
--qc-primary-red: #EF4444;
--qc-primary-orange: #F97316;

/* 语义色 - GMV */
--qc-gmv-gradient: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);

/* 语义色 - ROI分级 */
--qc-roi-excellent: #10B981;  /* ROI > 5 */
--qc-roi-good: #F59E0B;       /* ROI 3-5 */
--qc-roi-poor: #EF4444;       /* ROI < 3 */
```

#### 当前前端色彩定义

```javascript
// tailwind.config.js
primary: {
  500: '#0ea5e9', // ❌ 蓝色，不符合千川品牌
  600: '#0284c7',
}
```

**差异分析:**
- 品牌主色调差异大：静态页面 红橙渐变 vs 当前 蓝色
- 缺少千川特色的渐变色支持
- 缺少业务语义化颜色定义

### 2. 组件样式对比

#### 静态页面组件类

```css
/* 按钮 */
.qc-btn-primary {
  background: var(--qc-primary-gradient);
  color: white;
  box-shadow: var(--qc-shadow-sm);
}

/* 卡片 */
.qc-card {
  background: white;
  border-radius: var(--qc-radius-lg);
  box-shadow: var(--qc-shadow-md);
}

/* 徽章 */
.qc-badge-success {
  background: var(--qc-success-light);
  color: var(--qc-success-dark);
}

/* 直播状态点 */
.qc-live-dot {
  animation: live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### 当前前端组件实现

```tsx
// 使用 Tailwind 原子类，缺少统一的品牌组件类
<button className="bg-primary text-white rounded-lg px-4 py-2">
```

**差异分析:**
- 静态页面有完整的组件类系统（.qc-*）
- 当前使用原子类，缺少封装和复用
- 缺少品牌特色的动画效果（如直播脉冲动画）

### 3. 间距与圆角对比

#### 静态页面系统

```css
/* 间距 - 基于4px */
--qc-space-1: 0.25rem;  /* 4px */
--qc-space-2: 0.5rem;   /* 8px */
--qc-space-4: 1rem;     /* 16px */
--qc-space-6: 1.5rem;   /* 24px */

/* 圆角 */
--qc-radius-sm: 0.25rem;   /* 4px - 小按钮、标签 */
--qc-radius-md: 0.5rem;    /* 8px - 卡片、输入框 */
--qc-radius-lg: 0.75rem;   /* 12px - 大卡片 */
--qc-radius-xl: 1rem;      /* 16px - 模态框 */
```

#### 当前前端系统

```javascript
// Tailwind 默认配置
borderRadius: {
  lg: 'var(--radius)', // 使用CSS变量，但值未明确定义
}
```

**差异分析:**
- 静态页面间距系统更精细
- 圆角使用场景定义清晰（小按钮4px、卡片8px等）
- 当前实现缺少明确的使用规范

---

## 迁移方案

### 方案架构

```
frontend/
├── src/
│   ├── styles/
│   │   ├── qianchuan-design-system.css   # 新增：千川设计系统
│   │   ├── qianchuan-components.css      # 新增：千川组件样式
│   │   └── qianchuan-animations.css      # 新增：千川动画
│   ├── lib/
│   │   └── design-tokens.ts              # 新增：设计令牌
│   └── ...
├── tailwind.config.js                     # 修改：扩展千川设计系统
└── ...
```

### 1. CSS 变量层 - qianchuan-design-system.css

创建完整的千川设计系统CSS变量：

```css
/**
 * 千川平台设计系统 - React 版本
 * 基于官方静态页面设计规范
 */

:root {
  /* ========================================
     千川品牌色彩系统
     ======================================== */
  
  /* 主色调 - 千川品牌渐变 */
  --qc-primary-gradient: linear-gradient(135deg, #EF4444 0%, #F97316 100%);
  --qc-primary-gradient-hover: linear-gradient(135deg, #DC2626 0%, #EA580C 100%);
  --qc-primary-red: #EF4444;
  --qc-primary-red-dark: #DC2626;
  --qc-primary-orange: #F97316;
  --qc-primary-orange-dark: #EA580C;
  
  /* 功能色 */
  --qc-success: #10B981;
  --qc-success-light: #D1FAE5;
  --qc-success-dark: #059669;
  
  --qc-warning: #F59E0B;
  --qc-warning-light: #FEF3C7;
  --qc-warning-dark: #D97706;
  
  --qc-danger: #EF4444;
  --qc-danger-light: #FEE2E2;
  --qc-danger-dark: #DC2626;
  
  --qc-info: #3B82F6;
  --qc-info-light: #DBEAFE;
  --qc-info-dark: #2563EB;
  
  /* 中性色系统 */
  --qc-gray-50: #F9FAFB;
  --qc-gray-100: #F3F4F6;
  --qc-gray-200: #E5E7EB;
  --qc-gray-300: #D1D5DB;
  --qc-gray-400: #9CA3AF;
  --qc-gray-500: #6B7280;
  --qc-gray-600: #4B5563;
  --qc-gray-700: #374151;
  --qc-gray-800: #1F2937;
  --qc-gray-900: #111827;
  
  /* 语义色 - 数据展示 */
  --qc-gmv-gradient: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  --qc-roi-excellent: #10B981;  /* ROI > 5 */
  --qc-roi-good: #F59E0B;       /* ROI 3-5 */
  --qc-roi-poor: #EF4444;       /* ROI < 3 */
  
  /* 背景色 */
  --qc-bg-primary: #FFFFFF;
  --qc-bg-secondary: #F9FAFB;
  --qc-bg-tertiary: #F3F4F6;
  
  /* ========================================
     间距系统 (基于 4px)
     ======================================== */
  
  --qc-space-0: 0;
  --qc-space-1: 0.25rem;    /* 4px */
  --qc-space-2: 0.5rem;     /* 8px */
  --qc-space-3: 0.75rem;    /* 12px */
  --qc-space-4: 1rem;       /* 16px */
  --qc-space-5: 1.25rem;    /* 20px */
  --qc-space-6: 1.5rem;     /* 24px */
  --qc-space-8: 2rem;       /* 32px */
  --qc-space-10: 2.5rem;    /* 40px */
  --qc-space-12: 3rem;      /* 48px */
  
  /* ========================================
     圆角系统
     ======================================== */
  
  --qc-radius-sm: 0.25rem;   /* 4px - 小按钮、标签 */
  --qc-radius-md: 0.5rem;    /* 8px - 卡片、输入框 */
  --qc-radius-lg: 0.75rem;   /* 12px - 大卡片 */
  --qc-radius-xl: 1rem;      /* 16px - 模态框 */
  --qc-radius-2xl: 1.5rem;   /* 24px - 特殊容器 */
  --qc-radius-full: 9999px;  /* 圆形 */
  
  /* ========================================
     阴影系统
     ======================================== */
  
  --qc-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --qc-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                  0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --qc-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
                  0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --qc-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                  0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* 品牌色阴影 */
  --qc-shadow-primary: 0 10px 25px -5px rgba(239, 68, 68, 0.2);
  --qc-shadow-success: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
  
  /* ========================================
     动画系统
     ======================================== */
  
  --qc-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --qc-transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --qc-transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ========================================
     Z-Index 层级
     ======================================== */
  
  --qc-z-dropdown: 1000;
  --qc-z-sticky: 1020;
  --qc-z-fixed: 1030;
  --qc-z-modal-backdrop: 1040;
  --qc-z-modal: 1050;
  --qc-z-popover: 1060;
  --qc-z-tooltip: 1070;
}

/* 暗色模式 */
.dark {
  --qc-bg-primary: #111827;
  --qc-bg-secondary: #1F2937;
  --qc-bg-tertiary: #374151;
}
```

### 2. 组件样式层 - qianchuan-components.css

```css
/**
 * 千川平台组件样式
 */

/* ========================================
   按钮组件
   ======================================== */

.qc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--qc-space-2) var(--qc-space-4);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  border-radius: var(--qc-radius-lg);
  transition: all var(--qc-transition-base);
  cursor: pointer;
  border: none;
  outline: none;
}

.qc-btn-primary {
  background: var(--qc-primary-gradient);
  color: white;
  box-shadow: var(--qc-shadow-sm);
}

.qc-btn-primary:hover {
  background: var(--qc-primary-gradient-hover);
  box-shadow: var(--qc-shadow-primary);
  transform: translateY(-1px);
}

.qc-btn-primary:active {
  transform: translateY(0);
}

.qc-btn-secondary {
  background: white;
  color: var(--qc-gray-700);
  border: 1px solid var(--qc-gray-300);
}

.qc-btn-secondary:hover {
  background: var(--qc-gray-50);
  border-color: var(--qc-gray-400);
}

/* ========================================
   卡片组件
   ======================================== */

.qc-card {
  background: var(--qc-bg-primary);
  border-radius: var(--qc-radius-lg);
  border: 1px solid var(--qc-gray-200);
  padding: var(--qc-space-6);
  transition: all var(--qc-transition-base);
}

.qc-card-interactive {
  cursor: pointer;
}

.qc-card-interactive:hover {
  box-shadow: var(--qc-shadow-lg);
  transform: translateY(-2px);
}

.qc-stat-card {
  background: var(--qc-bg-primary);
  border-radius: var(--qc-radius-lg);
  border: 1px solid var(--qc-gray-200);
  padding: var(--qc-space-5);
  transition: all var(--qc-transition-base);
}

.qc-stat-card:hover {
  box-shadow: var(--qc-shadow-md);
}

/* ========================================
   徽章组件
   ======================================== */

.qc-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--qc-space-1) var(--qc-space-3);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--qc-radius-full);
}

.qc-badge-success {
  background: var(--qc-success-light);
  color: var(--qc-success-dark);
}

.qc-badge-warning {
  background: var(--qc-warning-light);
  color: var(--qc-warning-dark);
}

.qc-badge-danger {
  background: var(--qc-danger-light);
  color: var(--qc-danger-dark);
}

.qc-badge-info {
  background: var(--qc-info-light);
  color: var(--qc-info-dark);
}

/* ========================================
   输入框组件
   ======================================== */

.qc-input {
  width: 100%;
  padding: var(--qc-space-2) var(--qc-space-3);
  font-size: 0.875rem;
  border: 1px solid var(--qc-gray-300);
  border-radius: var(--qc-radius-md);
  transition: all var(--qc-transition-fast);
  background: var(--qc-bg-primary);
  color: var(--qc-gray-900);
}

.qc-input:focus {
  outline: none;
  border-color: var(--qc-primary-orange);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.qc-input::placeholder {
  color: var(--qc-gray-400);
}

/* ========================================
   进度条组件
   ======================================== */

.qc-progress {
  width: 100%;
  height: 0.5rem;
  background: var(--qc-gray-200);
  border-radius: var(--qc-radius-full);
  overflow: hidden;
}

.qc-progress-bar {
  height: 100%;
  background: var(--qc-primary-gradient);
  border-radius: var(--qc-radius-full);
  transition: width var(--qc-transition-base);
}

/* ========================================
   业务语义化样式
   ======================================== */

/* GMV 高亮 */
.qc-gmv-highlight {
  background: var(--qc-gmv-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

/* ROI 分级颜色 */
.qc-roi-excellent {
  color: var(--qc-roi-excellent);
}

.qc-roi-good {
  color: var(--qc-roi-good);
}

.qc-roi-poor {
  color: var(--qc-roi-poor);
}

/* 文本渐变 */
.qc-text-gradient {
  background: var(--qc-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 3. 动画层 - qianchuan-animations.css

```css
/**
 * 千川平台动画系统
 */

/* ========================================
   直播相关动画
   ======================================== */

/* 直播状态点 - 脉冲动画 */
@keyframes live-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.95);
  }
}

.qc-live-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--qc-danger);
  border-radius: 50%;
  margin-right: var(--qc-space-2);
  animation: live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ========================================
   加载动画
   ======================================== */

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.qc-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* ========================================
   渐入动画
   ======================================== */

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.qc-fade-in {
  animation: fade-in var(--qc-transition-base) ease-out;
}

/* ========================================
   滑入动画
   ======================================== */

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qc-slide-in-up {
  animation: slide-in-up var(--qc-transition-base) ease-out;
}

/* ========================================
   缩放动画
   ======================================== */

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.qc-scale-in {
  animation: scale-in var(--qc-transition-fast) ease-out;
}

/* ========================================
   数字滚动动画
   ======================================== */

@keyframes number-roll {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.qc-number-roll {
  animation: number-roll var(--qc-transition-base) ease-out;
}
```

### 4. Tailwind 配置扩展

修改 `tailwind.config.js`：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 保留 Radix UI 的颜色变量
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // 千川品牌色
        qc: {
          red: {
            DEFAULT: '#EF4444',
            dark: '#DC2626',
          },
          orange: {
            DEFAULT: '#F97316',
            dark: '#EA580C',
          },
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        },
        
        // 语义色
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#2563EB',
        },
        
        // ROI 分级
        roi: {
          excellent: '#10B981',
          good: '#F59E0B',
          poor: '#EF4444',
        },
        
        // 覆盖 Radix primary 为千川红橙色
        primary: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... 其他颜色保持不变
      },
      
      borderRadius: {
        lg: 'var(--qc-radius-lg)',
        md: 'var(--qc-radius-md)',
        sm: 'var(--qc-radius-sm)',
        xl: 'var(--qc-radius-xl)',
        '2xl': 'var(--qc-radius-2xl)',
        full: 'var(--qc-radius-full)',
      },
      
      boxShadow: {
        sm: 'var(--qc-shadow-sm)',
        md: 'var(--qc-shadow-md)',
        lg: 'var(--qc-shadow-lg)',
        xl: 'var(--qc-shadow-xl)',
        primary: 'var(--qc-shadow-primary)',
        success: 'var(--qc-shadow-success)',
      },
      
      spacing: {
        // 扩展千川间距系统
        'qc-1': 'var(--qc-space-1)',
        'qc-2': 'var(--qc-space-2)',
        'qc-3': 'var(--qc-space-3)',
        'qc-4': 'var(--qc-space-4)',
        'qc-5': 'var(--qc-space-5)',
        'qc-6': 'var(--qc-space-6)',
        'qc-8': 'var(--qc-space-8)',
        'qc-10': 'var(--qc-space-10)',
        'qc-12': 'var(--qc-space-12)',
      },
      
      animation: {
        'live-pulse': 'live-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'fade-in': 'fade-in 300ms ease-out',
        'slide-in-up': 'slide-in-up 300ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
      },
      
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.95)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(1rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
      },
      
      transitionTimingFunction: {
        'qc': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
```

### 5. TypeScript 设计令牌

创建 `src/lib/design-tokens.ts`：

```typescript
/**
 * 千川设计系统 - TypeScript 设计令牌
 * 提供类型安全的设计系统访问
 */

export const QCColors = {
  // 品牌色
  brand: {
    red: '#EF4444',
    redDark: '#DC2626',
    orange: '#F97316',
    orangeDark: '#EA580C',
  },
  
  // 语义色
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',
  
  // 中性色
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 业务语义色
  roi: {
    excellent: '#10B981', // ROI > 5
    good: '#F59E0B',      // ROI 3-5
    poor: '#EF4444',      // ROI < 3
  },
} as const

export const QCGradients = {
  primary: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
  primaryHover: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
  gmv: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
} as const

export const QCSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
} as const

export const QCBorderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

export const QCShadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  primary: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
  success: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
} as const

export const QCTransition = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const QCZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// 工具函数：根据 ROI 值获取对应颜色
export function getROIColor(roi: number): string {
  if (roi > 5) return QCColors.roi.excellent
  if (roi >= 3) return QCColors.roi.good
  return QCColors.roi.poor
}

// 工具函数：根据 ROI 值获取对应的 Tailwind 类名
export function getROIClassName(roi: number): string {
  if (roi > 5) return 'text-roi-excellent'
  if (roi >= 3) return 'text-roi-good'
  return 'text-roi-poor'
}
```

---

## 实施步骤

### 阶段 1: 准备阶段（1天）

1. **创建设计系统目录结构**
   ```bash
   mkdir -p frontend/src/styles
   mkdir -p frontend/src/lib
   ```

2. **创建CSS文件**
   - `qianchuan-design-system.css`
   - `qianchuan-components.css`
   - `qianchuan-animations.css`

3. **创建TypeScript文件**
   - `design-tokens.ts`

### 阶段 2: 核心迁移（2-3天）

1. **导入CSS文件**
   
   在 `src/main.tsx` 或 `src/App.tsx` 中导入：
   ```typescript
   import './styles/qianchuan-design-system.css'
   import './styles/qianchuan-components.css'
   import './styles/qianchuan-animations.css'
   ```

2. **更新 Tailwind 配置**
   - 按照上述方案修改 `tailwind.config.js`
   - 运行 `npm run build:css` 重新生成样式

3. **测试设计令牌**
   ```typescript
   import { QCColors, QCGradients, getROIColor } from '@/lib/design-tokens'
   
   // 使用示例
   const primaryColor = QCColors.brand.red
   const roiColor = getROIColor(6.8)
   ```

### 阶段 3: 组件迁移（3-5天）

按优先级迁移组件：

**高优先级（核心组件）:**
1. Button - 使用千川品牌渐变
2. Card - 统一卡片样式
3. Badge - 状态徽章
4. Input - 输入框焦点样式

**中优先级:**
5. Table - 数据表格
6. Modal/Dialog - 模态框
7. Tabs - 标签页
8. Select/Dropdown - 下拉选择

**低优先级:**
9. Tooltip
10. Popover
11. 其他辅助组件

**迁移示例 - Button 组件:**

```tsx
// src/components/ui/Button.tsx (修改后)
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 使用千川设计系统类
          'qc-btn',
          {
            'qc-btn-primary': variant === 'primary',
            'qc-btn-secondary': variant === 'secondary',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
```

### 阶段 4: 页面迁移（5-7天）

按照重要性迁移页面：

1. **Dashboard** - 应用 GMV 高亮、ROI 分级颜色
2. **Campaigns** - 使用千川卡片样式
3. **Ads** - 统一按钮和状态徽章
4. **Reports** - 数据可视化色彩统一
5. 其他页面

**迁移示例 - Dashboard GMV 卡片:**

```tsx
// Dashboard.tsx (修改后)
<div className="qc-card qc-stat-card border-2 border-qc-orange/20">
  <div className="flex items-center justify-between mb-4">
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">今日GMV</p>
      <p className="text-xs text-gray-500">成交总额</p>
    </div>
    <div className="p-3 rounded-lg bg-gradient-to-br from-qc-orange to-qc-red">
      <DollarSign className="h-6 w-6 text-white" />
    </div>
  </div>
  <p className="text-4xl font-bold qc-gmv-highlight mb-2">¥128,456.78</p>
  <div className="flex items-center gap-2 text-sm">
    <span className="flex items-center gap-1 text-success font-medium">
      <ArrowUpRight className="h-4 w-4" />
      +15.3%
    </span>
    <span className="text-gray-600">vs 昨日</span>
  </div>
</div>
```

### 阶段 5: 验证与优化（2-3天）

1. **视觉一致性检查**
   - 对比静态页面截图
   - 检查色彩、间距、圆角是否一致

2. **响应式测试**
   - 桌面端 (1920x1080, 1440x900)
   - 平板端 (768x1024)
   - 手机端 (375x667)

3. **性能优化**
   - CSS文件大小检查
   - 动画性能测试
   - 首屏渲染时间

4. **无障碍性检查**
   - 对比度检查 (WCAG AA)
   - 键盘导航测试
   - 屏幕阅读器测试

---

## 验收标准

### 1. 设计一致性

- [ ] 品牌色与静态页面完全一致（红橙渐变）
- [ ] 所有按钮使用千川品牌渐变
- [ ] GMV数据使用专用渐变高亮
- [ ] ROI指标根据数值自动分级着色
- [ ] 卡片圆角统一为12px
- [ ] 阴影效果与静态页面一致

### 2. 组件完整性

- [ ] 核心组件全部迁移完成
- [ ] 组件支持 `.qc-*` 类名体系
- [ ] 所有组件支持暗色模式
- [ ] 动画效果流畅（60fps）
- [ ] 直播状态点正确显示脉冲动画

### 3. 代码质量

- [ ] CSS变量命名规范（--qc-*）
- [ ] TypeScript类型定义完整
- [ ] 无CSS冲突和覆盖问题
- [ ] 浏览器兼容性良好（Chrome, Safari, Firefox）
- [ ] 代码通过 ESLint 和 Prettier 检查

### 4. 性能指标

- [ ] CSS文件总大小 < 50KB
- [ ] 首屏渲染时间 < 1.5s
- [ ] 动画帧率稳定在 60fps
- [ ] 无内存泄漏

### 5. 文档完整性

- [ ] 设计系统使用文档
- [ ] 组件 Storybook 示例
- [ ] CSS类名速查表
- [ ] 迁移前后对比截图

---

## 风险与应对

### 风险 1: CSS 冲突

**描述**: 新的千川样式可能与现有 Tailwind/Radix 样式冲突

**应对措施**:
- 使用 `.qc-*` 命名空间隔离
- 通过 CSS Module 或 CSS-in-JS 封装
- 使用 `!important` 标记关键样式（谨慎使用）
- 建立优先级规则文档

### 风险 2: 组件库兼容性

**描述**: Radix UI 组件可能不完全支持千川设计

**应对措施**:
- 通过 `className` prop 覆盖样式
- 使用 CSS Variables 注入千川色彩
- 必要时重新封装组件
- 保留 Radix 功能层，只修改视觉层

### 风险 3: 迁移工作量大

**描述**: 52个组件 + 18个页面迁移耗时

**应对措施**:
- 分阶段迁移，优先核心模块
- 建立组件迁移模板和脚本
- 多人并行迁移不同模块
- 使用 codemod 自动化部分工作

### 风险 4: 视觉回归

**描述**: 迁移过程可能引入视觉问题

**应对措施**:
- 使用 Percy/Chromatic 进行视觉回归测试
- 建立迁移前后对比截图
- 设立视觉验收关卡
- 保留旧样式作为回退方案

---

## 时间估算

| 阶段 | 工作内容 | 预计时间 | 人力 |
|------|---------|---------|------|
| 阶段1 | 准备工作 | 1天 | 1人 |
| 阶段2 | 核心迁移 | 2-3天 | 1人 |
| 阶段3 | 组件迁移 | 3-5天 | 2人 |
| 阶段4 | 页面迁移 | 5-7天 | 2-3人 |
| 阶段5 | 验证优化 | 2-3天 | 1-2人 |
| **总计** | - | **13-19天** | **2-3人** |

---

## 参考资源

- 静态页面设计系统: `html/qianchuan/design-system.css`
- 静态页面组件: `html/qianchuan/*.html`
- Tailwind CSS 文档: https://tailwindcss.com
- Radix UI 文档: https://www.radix-ui.com
- 设计令牌规范: https://tr.designtokens.org/

---

**文档版本**: v1.0  
**创建日期**: 2025-11-11  
**最后更新**: 2025-11-11  
**负责人**: 前端团队
