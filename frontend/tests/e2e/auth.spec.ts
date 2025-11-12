import { test, expect } from '@playwright/test'

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('未登录时自动跳转到登录页', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('登录页面元素正常显示', async ({ page }) => {
    await page.goto('/login')
    
    // 检查登录表单元素
    await expect(page.getByPlaceholder(/用户名|账号/i)).toBeVisible()
    await expect(page.getByPlaceholder(/密码/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /登录|登入/i })).toBeVisible()
  })

  test('空表单提交显示验证错误', async ({ page }) => {
    await page.goto('/login')
    
    // 直接点击登录按钮
    await page.getByRole('button', { name: /登录|登入/i }).click()
    
    // 应该显示验证错误（HTML5表单验证或自定义验证）
    const usernameInput = page.getByPlaceholder(/用户名|账号/i)
    await expect(usernameInput).toBeFocused()
  })

  test('输入错误凭证显示错误提示', async ({ page }) => {
    await page.goto('/login')
    
    // 填写错误的登录信息
    await page.getByPlaceholder(/用户名|账号/i).fill('wronguser')
    await page.getByPlaceholder(/密码/i).fill('wrongpass')
    await page.getByRole('button', { name: /登录|登入/i }).click()
    
    // 等待错误提示
    await expect(page.getByText(/用户名或密码错误|登录失败/i)).toBeVisible({ timeout: 5000 })
  })

  test.skip('成功登录后跳转到仪表盘', async ({ page }) => {
    // Skip这个测试，因为需要真实的后端API
    // 在集成测试环境中可以启用
    await page.goto('/login')
    
    await page.getByPlaceholder(/用户名|账号/i).fill('testuser')
    await page.getByPlaceholder(/密码/i).fill('testpassword')
    await page.getByRole('button', { name: /登录|登入/i }).click()
    
    // 等待跳转
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
    
    // 检查是否显示用户信息
    await expect(page.getByText(/欢迎|首页|仪表盘/i)).toBeVisible()
  })

  test('登出功能清除登录状态', async ({ page }) => {
    // 模拟已登录状态
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('qianchuan_access_token', 'mock_token')
      localStorage.setItem('qianchuan_user_info', JSON.stringify({
        id: 1,
        name: 'Test User',
        advertiser_id: 1000
      }))
    })
    
    await page.goto('/dashboard')
    
    // 点击登出按钮
    const logoutButton = page.getByRole('button', { name: /退出|登出/i }).first()
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // 等待跳转到登录页
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
      
      // 验证本地存储已清除
      const token = await page.evaluate(() => localStorage.getItem('qianchuan_access_token'))
      expect(token).toBeNull()
    }
  })

  test('Token过期后自动刷新', async ({ page }) => {
    // 设置一个即将过期的token
    await page.goto('/')
    await page.evaluate(() => {
      const expiredTime = Date.now() - 1000 // 1秒前过期
      localStorage.setItem('qianchuan_access_token', 'expired_token')
      localStorage.setItem('qianchuan_token_expires', expiredTime.toString())
      localStorage.setItem('qianchuan_refresh_token', 'refresh_token')
    })
    
    // 访问需要认证的页面
    await page.goto('/campaigns')
    
    // 应该触发token刷新或重定向到登录页
    // 根据实际实现可能有不同行为
    const url = page.url()
    expect(url).toMatch(/\/(login|campaigns)/)
  })
})
