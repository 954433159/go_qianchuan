/**
 * 投放时间类型
 */
export const SCHEDULE_TYPE = {
  FROM_NOW: 'SCHEDULE_FROM_NOW',
  START_END: 'SCHEDULE_START_END',
} as const

export const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  SCHEDULE_FROM_NOW: '从今天起长期投放',
  SCHEDULE_START_END: '设置开始和结束日期',
}

/**
 * 性别定向
 */
export const GENDER = {
  NONE: 'NONE',
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const

export const GENDER_LABELS: Record<string, string> = {
  NONE: '不限',
  MALE: '男',
  FEMALE: '女',
}

/**
 * 年龄段
 */
export const AGE_RANGES = [
  { value: 'AGE_BELOW_18', label: '18岁以下' },
  { value: 'AGE_18_23', label: '18-23岁' },
  { value: 'AGE_24_30', label: '24-30岁' },
  { value: 'AGE_31_40', label: '31-40岁' },
  { value: 'AGE_41_49', label: '41-49岁' },
  { value: 'AGE_ABOVE_50', label: '50岁以上' },
] as const

/**
 * 创意素材模式
 */
export const CREATIVE_MATERIAL_MODE = {
  CUSTOM: 'CUSTOM',
  PROGRAMMATIC: 'PROGRAMMATIC',
} as const

export const CREATIVE_MATERIAL_MODE_LABELS: Record<string, string> = {
  CUSTOM: '自定义创意',
  PROGRAMMATIC: '程序化创意',
}

/**
 * 广告状态
 */
export const AD_STATUS = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
  DELETE: 'DELETE',
  AUDIT: 'AUDIT',
  AUDIT_DENY: 'AUDIT_DENY',
  DELIVERY_OK: 'DELIVERY_OK',
  DELIVERY_NO_BUDGET: 'DELIVERY_NO_BUDGET',
  DELIVERY_TIME_DONE: 'DELIVERY_TIME_DONE',
} as const

export const AD_STATUS_LABELS: Record<string, string> = {
  ENABLE: '启用中',
  DISABLE: '已暂停',
  DELETE: '已删除',
  AUDIT: '审核中',
  AUDIT_DENY: '审核拒绝',
  DELIVERY_OK: '投放中',
  DELIVERY_NO_BUDGET: '预算不足',
  DELIVERY_TIME_DONE: '已到期',
}

/**
 * 出价类型
 */
export const PRICING = {
  PRICING_OCPM: 'PRICING_OCPM',
  PRICING_CPC: 'PRICING_CPC',
  PRICING_CPM: 'PRICING_CPM',
} as const

export const PRICING_LABELS: Record<string, string> = {
  PRICING_OCPM: 'oCPM（按转化出价）',
  PRICING_CPC: 'CPC（按点击出价）',
  PRICING_CPM: 'CPM（按展示出价）',
}

/**
 * 投放场景
 */
export const INVENTORY_TYPE = {
  FEED: 'INVENTORY_FEED',
  SEARCH: 'INVENTORY_SEARCH',
  UNION: 'INVENTORY_UNION',
} as const

export const INVENTORY_TYPE_LABELS: Record<string, string> = {
  INVENTORY_FEED: '抖音推荐',
  INVENTORY_SEARCH: '搜索广告',
  INVENTORY_UNION: '穿山甲',
}
