/**
 * 分页常量配置
 * 统一前端分页参数，与后端对齐
 */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/**
 * 标准化分页参数
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 标准化后的分页参数
 */
export function normalizePagination(page?: number, pageSize?: number) {
  const normalizedPage = Math.max(page || PAGINATION.DEFAULT_PAGE, PAGINATION.DEFAULT_PAGE)
  const normalizedPageSize = Math.max(
    Math.min(pageSize || PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE),
    PAGINATION.MIN_PAGE_SIZE
  )
  
  return {
    page: normalizedPage,
    page_size: normalizedPageSize,
  }
}
