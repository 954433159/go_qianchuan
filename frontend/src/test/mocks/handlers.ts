import { http, HttpResponse } from 'msw'

// Match actual API requests
// Use wildcard to match any host (handles both relative and absolute URLs)
const API_BASE_URL = '*/api'

/**
 * MSW Request Handlers for API Mocking
 * 用于前端集成测试的 API Mock
 */
export const handlers = [
  // ==================== Auth ====================
  http.post(`${API_BASE_URL}/oauth/exchange`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: 86400,
      },
    })
  }),

  http.get(`${API_BASE_URL}/user/info`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: '123',
        name: 'Test User',
        advertiserId: '1000001',
        email: 'test@example.com',
      },
    })
  }),

  // ==================== UniPromotion ====================
  http.get(`${API_BASE_URL}/qianchuan/uni-promotion/list`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        list: [
        {
          ad_id: 1001,
          advertiser_id: 1000001,
          ad_name: '测试全域推广计划',
          status: 'ACTIVE',
          opt_status: 'ENABLE',
          marketing_goal: 'LIVE',
          marketing_scene: ['FEED', 'SEARCH'],
          budget: 500,
          budget_mode: 'BUDGET_MODE_DAY',
          roi_goal: 2.5,
          create_time: '2024-01-01T00:00:00Z',
          modify_time: '2024-01-02T00:00:00Z',
        },
        ],
        total: 1,
      },
    })
  }),

  http.get(`${API_BASE_URL}/qianchuan/uni-promotion/detail`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
      ad_id: 1001,
      advertiser_id: 1000001,
      ad_name: '测试全域推广计划',
      status: 'ACTIVE',
      opt_status: 'ENABLE',
      marketing_goal: 'LIVE',
      marketing_scene: ['FEED', 'SEARCH'],
      budget: 500,
      budget_mode: 'BUDGET_MODE_DAY',
      roi_goal: 2.5,
      create_time: '2024-01-01T00:00:00Z',
      modify_time: '2024-01-02T00:00:00Z',
        delivery_setting: {
          start_time: '2024-01-01T00:00:00Z',
        },
      },
    })
  }),

  http.post(`${API_BASE_URL}/qianchuan/uni-promotion/create`, async () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        ad_id: 1002,
      },
    })
  }),

  http.post(`${API_BASE_URL}/qianchuan/uni-promotion/update`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        ad_id: 1001,
      },
    })
  }),

  http.post(`${API_BASE_URL}/qianchuan/uni-promotion/status/update`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        ad_ids: [1001],
      },
    })
  }),

  http.get(`${API_BASE_URL}/qianchuan/uni-promotion/material/get`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [
        {
          material_id: 'm001',
          material_type: 'IMAGE',
          url: 'https://example.com/image1.jpg',
          status: 'ACTIVE',
          create_time: '2024-01-01T00:00:00Z',
        },
      ],
    })
  }),

  // ==================== Reports ====================
  http.get(`${API_BASE_URL}/qianchuan/report/advertiser`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        list: [
          {
            date: '2024-01-01',
            cost: 100,
            show: 10000,
            click: 500,
            convert: 50,
            ctr: 0.05,
            cpc: 0.2,
            cpm: 10,
            convert_cost: 2,
            convert_rate: 0.1,
          },
          {
            date: '2024-01-02',
            cost: 120,
            show: 12000,
            click: 600,
            convert: 60,
            ctr: 0.05,
            cpc: 0.2,
            cpm: 10,
            convert_cost: 2,
            convert_rate: 0.1,
          },
        ],
        total: 2,
      },
    })
  }),

  // ==================== Finance & Aweme Orders ====================
  http.get(`${API_BASE_URL}/qianchuan/finance/wallet`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        balance: 10000,
        cash: 5000,
        credit: 5000,
      },
    })
  }),

  http.get(`${API_BASE_URL}/qianchuan/aweme-order/list`, () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        list: [
          {
            order_id: 'order001',
            aweme_id: 'aweme001',
            aweme_name: '测试抖音号',
            product_id: 'prod001',
            product_name: '测试商品',
            status: 'ACTIVE',
            budget: 300,
            create_time: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      },
    })
  }),

  // ==================== Error Handlers ====================
  http.get(`${API_BASE_URL}/qianchuan/test/501`, () => {
    return HttpResponse.json(
      {
        code: 501,
        message: '功能暂未实现',
        hint: '请使用其他已实现的接口',
      },
      { status: 501 }
    )
  }),

  // Catch-all handler for unmocked endpoints
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { code: 404, message: 'Endpoint not mocked' },
      { status: 404 }
    )
  }),
]
