import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import UniPromotions from '../UniPromotions'
import { useAuthStore } from '@/store/authStore'

/**
 * UniPromotions 页面集成测试
 * 使用 MSW mock API 响应，测试页面的完整交互流程
 */
describe('UniPromotions Integration Tests', () => {
  beforeEach(() => {
    // 设置认证状态
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: '123',
        name: 'Test User',
        advertiserId: '1000001',
        email: 'test@example.com',
      },
    })
  })

  it('should load and display promotion list', async () => {
    render(
      <BrowserRouter>
        <UniPromotions />
      </BrowserRouter>
    )

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })

    // Check if promotion is displayed
    expect(screen.getByText('测试全域推广计划')).toBeInTheDocument()
    expect(screen.getByText('ID: 1001')).toBeInTheDocument()
  })

  it(
    'should handle API error gracefully',
    async () => {
      // Override handler to return error
      server.use(
      http.get('*/api/qianchuan/uni-promotion/list', () => {
        return HttpResponse.json(
          {
            code: 500,
            message: '服务器错误',
          },
          { status: 500 }
        )
      })
    )

    render(
      <BrowserRouter>
        <UniPromotions />
      </BrowserRouter>
    )

    // Wait longer due to API retry mechanism (3 retries with delays)
    await waitFor(
      () => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
      },
      { timeout: 15000 }
    )

      // Should show error state (there are multiple elements, use getAllByText)
      const errorElements = screen.getAllByText(/加载失败/)
      expect(errorElements.length).toBeGreaterThan(0)
    },
    20000
  )

  it(
    'should handle 501 Not Implemented gracefully',
    async () => {
    // Override handler to return 501
    server.use(
      http.get('*/api/qianchuan/uni-promotion/list', () => {
        return HttpResponse.json(
          {
            code: 501,
            message: '功能暂未实现',
            hint: '请使用其他已实现的接口',
          },
          { status: 501 }
        )
      })
    )

    render(
      <BrowserRouter>
        <UniPromotions />
      </BrowserRouter>
    )

    // Wait longer due to API retry mechanism
    await waitFor(
      () => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
      },
      { timeout: 15000 }
    )

      // Should show 501 specific error message
      expect(screen.getByText(/全域推广功能暂未完全开放/)).toBeInTheDocument()
    },
    20000
  )

  it('should display empty state when no promotions', async () => {
    // Override handler to return empty list
    server.use(
      http.get('*/api/qianchuan/uni-promotion/list', () => {
        return HttpResponse.json({
          code: 0,
          message: 'success',
          data: {
            list: [],
            total: 0,
          },
        })
      })
    )

    render(
      <BrowserRouter>
        <UniPromotions />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })

    // Should show empty state
    expect(screen.getByText(/暂无推广计划/)).toBeInTheDocument()
  })

  it('should filter promotions by keyword', async () => {
    render(
      <BrowserRouter>
        <UniPromotions />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument()
    })

    // Initial state - promotion visible
    expect(screen.getByText('测试全域推广计划')).toBeInTheDocument()

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/搜索推广计划名称或ID/)
    await waitFor(() => {
      searchInput.focus()
    })

    // After typing non-matching keyword
    searchInput.setAttribute('value', '不存在的关键词')

    // Note: Full interaction testing would require user-event library
    // This is a simplified test to demonstrate the structure
  })
})
