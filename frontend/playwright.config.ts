import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* 并行运行测试 */
  fullyParallel: true,
  
  /* 失败时重试 */
  retries: process.env.CI ? 2 : 0,
  
  /* CI环境中禁用并行 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 测试报告 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  
  /* 共享设置 */
  use: {
    /* 基础URL */
    baseURL: 'http://localhost:3000',
    
    /* 失败时截图 */
    screenshot: 'only-on-failure',
    
    /* 失败时录制视频 */
    video: 'retain-on-failure',
    
    /* 追踪模式 */
    trace: 'on-first-retry',
  },

  /* 配置项目浏览器 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 启动本地开发服务器 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
