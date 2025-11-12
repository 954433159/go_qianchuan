/**
 * API配置
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  TIMEOUT: 30000, // 30秒
  RETRY_TIMES: 3,
  RETRY_DELAY: 1000, // 1秒
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'qianchuan_access_token',
  REFRESH_TOKEN: 'qianchuan_refresh_token',
  USER_INFO: 'qianchuan_user_info',
  ADVERTISER_ID: 'qianchuan_advertiser_id',
  THEME: 'qianchuan_theme',
} as const

/**
 * 分页配置
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime'],
  ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_VIDEO_EXTENSIONS: ['mp4', 'mov'],
} as const

/**
 * 图表颜色主题
 */
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#6366f1',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  GRADIENT: ['#3b82f6', '#8b5cf6', '#ec4899'],
} as const

/**
 * 日期格式
 */
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
} as const

/**
 * 报表查询时间范围
 */
export const REPORT_DATE_RANGE = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom',
} as const

export const REPORT_DATE_RANGE_LABELS: Record<string, string> = {
  today: '今天',
  yesterday: '昨天',
  last_7_days: '最近7天',
  last_30_days: '最近30天',
  this_month: '本月',
  last_month: '上月',
  custom: '自定义',
}

/**
 * Toast持续时间
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const
