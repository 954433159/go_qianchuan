/**
 * 千川设计系统 - Design Tokens & Utilities
 * 提供类型安全的设计token访问和工具函数
 */

// 颜色类型定义
export const QCColors = {
  // 主色调
  primaryRed: '#EF4444',
  primaryRedDark: '#DC2626',
  primaryOrange: '#F97316',
  primaryOrangeDark: '#EA580C',
  
  // 功能色
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
  
  // ROI 指示色
  roiExcellent: '#10B981',
  roiGood: '#F59E0B',
  roiPoor: '#EF4444',
} as const

// 间距系统 (基于 4px)
export const QCSpacing = {
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '5': '1.25rem',   // 20px
  '6': '1.5rem',    // 24px
  '8': '2rem',      // 32px
  '10': '2.5rem',   // 40px
  '12': '3rem',     // 48px
} as const

// 圆角系统
export const QCRadius = {
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
} as const

/**
 * 根据 ROI 值获取对应的颜色类名
 */
export function getROIClassName(roi: number): string {
  if (roi > 5) return 'qc-roi-excellent'
  if (roi >= 3) return 'qc-roi-good'
  return 'qc-roi-poor'
}

/**
 * 根据 ROI 值获取对应的颜色值
 */
export function getROIColor(roi: number): string {
  if (roi > 5) return QCColors.roiExcellent
  if (roi >= 3) return QCColors.roiGood
  return QCColors.roiPoor
}

/**
 * 获取状态对应的徽章样式
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'qc-badge-success',
    'enabled': 'qc-badge-success',
    'learning': 'qc-badge-info',
    'paused': 'qc-badge-warning',
    'disabled': 'qc-badge-danger',
    'deleted': 'qc-badge-danger',
    'completed': 'qc-badge-success',
    'pending': 'qc-badge-warning',
  }
  return statusMap[status.toLowerCase()] || 'qc-badge-info'
}

/**
 * 格式化 GMV 数值显示
 */
export function formatGMV(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`
  }
  return `¥${value.toLocaleString()}`
}

/**
 * 格式化 ROI 显示
 */
export function formatROI(value: number): string {
  return value.toFixed(2)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * 格式化数量（大于10000显示为万）
 */
export function formatNumber(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString()
}

/**
 * 获取推广计划学习期状态的显示文本和样式
 */
export function getLearningStatusConfig(status: string) {
  const configs: Record<string, { text: string; className: string; color: string }> = {
    'LEARNING': {
      text: '学习中',
      className: 'qc-badge-info',
      color: QCColors.info,
    },
    'LEARNED': {
      text: '学习成功',
      className: 'qc-badge-success',
      color: QCColors.success,
    },
    'FAILED': {
      text: '学习失败',
      className: 'qc-badge-danger',
      color: QCColors.danger,
    },
    'NONE': {
      text: '未学习',
      className: 'qc-badge-warning',
      color: QCColors.warning,
    },
  }
  return configs[status] || configs['NONE']
}

/**
 * 获取投放状态的显示文本和样式
 */
export function getDeliveryStatusConfig(status: string) {
  const configs: Record<string, { text: string; className: string; color: string }> = {
    'ACTIVE': {
      text: '投放中',
      className: 'qc-badge-success',
      color: QCColors.success,
    },
    'PAUSED': {
      text: '已暂停',
      className: 'qc-badge-warning',
      color: QCColors.warning,
    },
    'DELETED': {
      text: '已删除',
      className: 'qc-badge-danger',
      color: QCColors.danger,
    },
    'COMPLETED': {
      text: '已完成',
      className: 'qc-badge-info',
      color: QCColors.info,
    },
  }
  return configs[status] || { text: status, className: 'qc-badge-info', color: QCColors.info }
}
