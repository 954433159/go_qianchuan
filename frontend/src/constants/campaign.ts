/**
 * 预算模式
 */
export const BUDGET_MODE = {
  DAY: 'BUDGET_MODE_DAY',
  INFINITE: 'BUDGET_MODE_INFINITE',
  TOTAL: 'BUDGET_MODE_TOTAL',
} as const

export const BUDGET_MODE_LABELS: Record<string, string> = {
  BUDGET_MODE_DAY: '日预算',
  BUDGET_MODE_INFINITE: '不限',
  BUDGET_MODE_TOTAL: '总预算',
}

/**
 * 推广目的（落地页类型）
 */
export const LANDING_TYPE = {
  LINK: 'LINK',
  APP: 'APP',
  MICRO_GAME: 'MICRO_GAME',
  DPA: 'DPA',
} as const

export const LANDING_TYPE_LABELS: Record<string, string> = {
  LINK: '销售线索收集',
  APP: 'APP推广',
  MICRO_GAME: '小游戏推广',
  DPA: '商品目录推广',
}

/**
 * 操作状态
 */
export const OPT_STATUS = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
  DELETE: 'DELETE',
} as const

export const OPT_STATUS_LABELS: Record<string, string> = {
  ENABLE: '启用',
  DISABLE: '暂停',
  DELETE: '删除',
}

/**
 * 广告状态
 */
export const CAMPAIGN_STATUS = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
  DELETE: 'DELETE',
  AUDIT: 'AUDIT',
  DELIVERY_OK: 'DELIVERY_OK',
  DELIVERY_NO_BUDGET: 'DELIVERY_NO_BUDGET',
} as const

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  ENABLE: '启用中',
  DISABLE: '已暂停',
  DELETE: '已删除',
  AUDIT: '审核中',
  DELIVERY_OK: '投放中',
  DELIVERY_NO_BUDGET: '预算不足',
}

/**
 * 预算范围限制
 */
export const BUDGET_LIMITS = {
  MIN_DAY_BUDGET: 30000, // 300元（分）
  MIN_TOTAL_BUDGET: 30000,
  MAX_BUDGET: 9999999999, // 约1亿元（分）
} as const
