# 快速开始优化 - 千川SDK管理平台

> 30分钟快速实施指南

## 🚀 第一步：安装核心依赖（5分钟）

```bash
cd frontend

# 安装样式工具
pnpm add clsx tailwind-merge class-variance-authority

# 安装 Radix UI 核心组件
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-popover
pnpm add @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-alert-dialog
```

## 📁 第二步：创建工具函数（5分钟）

### 1. 创建 `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名，自动去重冲突的类
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 2. 更新 `tsconfig.json` 添加路径别名

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. 更新 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 🎨 第三步：优化设计系统（10分钟）

### 更新 `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 背景和前景色 */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    /* 卡片 */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    /* 主色 - 蓝色 */
    --primary: 14 165 233;
    --primary-foreground: 210 40% 98%;

    /* 次要色 */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    /* 柔和色 */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* 强调色 */
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    /* 危险色 */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    /* 边框和输入框 */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    /* 圆角 */
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 更新 `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
```

## 🧩 第四步：添加核心 UI 组件（10分钟）

### 1. 创建 Card 组件

**文件**：`src/components/ui/card.tsx`

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### 2. 升级 Button 组件

**文件**：`src/components/ui/Button.tsx`

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### 3. 创建 Title 通用组件

**文件**：`src/components/common/Title.tsx`

```tsx
export function Title({ 
  title, 
  description 
}: { 
  title: string
  description: string 
}) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
```

## ✨ 第五步：优化登录页面（立即见效）

**更新**：`src/pages/Login.tsx`

```tsx
import { LogIn, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const handleOAuthLogin = () => {
    const appId = import.meta.env.VITE_OAUTH_APP_ID
    const redirectUri = encodeURIComponent(import.meta.env.VITE_OAUTH_REDIRECT_URI)
    const scope = encodeURIComponent('[20120000,22000000]')
    const state = Math.random().toString(36).substring(7)
    
    sessionStorage.setItem('oauth_state', state)
    
    const oauthUrl = `https://open.oceanengine.com/oauth/connect?app_id=${appId}&state=${state}&scope=${scope}&redirect_uri=${redirectUri}`
    window.location.href = oauthUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          
          <div>
            <CardTitle className="text-2xl">千川SDK管理平台</CardTitle>
            <CardDescription>广告投放全流程管理系统</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 功能列表 */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 安全的OAuth2.0授权登录</p>
            <p>• 账户/广告组/计划全面管理</p>
            <p>• 实时数据报表与分析</p>
          </div>
          
          {/* 登录按钮 */}
          <Button onClick={handleOAuthLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            使用千川账号登录
          </Button>
        </CardContent>
        
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            首次使用需要授权访问千川广告账户
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

## 🎯 验证效果

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173/login
# 你应该看到：
# ✅ 更协调的图标大小
# ✅ 统一的卡片样式
# ✅ 更好的间距和排版
# ✅ 语义化的颜色使用
```

## 📊 对比效果

### 优化前
- ❌ 图标过大（占据大量空间）
- ❌ 手动拼接 className，容易出错
- ❌ 硬编码颜色值（如 `bg-primary-600`）
- ❌ 间距不统一

### 优化后
- ✅ 图标大小合理（h-6 w-6 = 24px）
- ✅ 使用 `cn()` 函数，类型安全
- ✅ 语义化颜色（`bg-primary`, `text-muted-foreground`）
- ✅ 统一的间距系统（space-y-4）
- ✅ 使用 Card 组件，样式一致

## 🚀 下一步

完成以上步骤后，你可以继续：

1. **添加更多 shadcn/ui 组件**
   ```bash
   npx shadcn@latest add dialog
   npx shadcn@latest add select
   npx shadcn@latest add toast
   ```

2. **优化其他页面**
   - Dashboard 页面使用 Card 组件
   - 表单页面使用新的 Input、Select 组件
   - 添加 Dialog 替代原生 alert

3. **建立组件库文档**
   - 创建 Storybook（可选）
   - 编写组件使用示例

## 📚 参考资源

- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [OBA 项目源码](file:///Users/wushaobing911/Desktop/oba)

---

**预计时间**：30 分钟  
**难度**：⭐⭐☆☆☆（简单）  
**收益**：⭐⭐⭐⭐⭐（显著提升）

