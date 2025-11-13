/**
 * 时间格式转换工具
 * 用于前端和SDK之间的时间格式互转
 */

/**
 * SDK时间格式: YYYY-MM-DD HH:mm:ss
 * ISO 8601格式: YYYY-MM-DDTHH:mm:ss.sssZ
 */

/**
 * 将ISO 8601时间字符串或Date对象转换为SDK格式 (YYYY-MM-DD HH:mm:ss)
 * @param date - ISO字符串或Date对象
 * @returns SDK格式时间字符串，如 "2025-11-12 15:30:00"
 * @example
 * formatTimeForSDK('2025-11-12T15:30:00.000Z') // "2025-11-12 15:30:00"
 * formatTimeForSDK(new Date()) // "2025-11-12 15:30:00"
 */
export function formatTimeForSDK(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`)
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 将SDK格式时间字符串 (YYYY-MM-DD HH:mm:ss) 转换为ISO 8601格式
 * @param sdkTime - SDK格式时间字符串
 * @returns ISO 8601格式字符串
 * @example
 * parseSDKTime('2025-11-12 15:30:00') // "2025-11-12T15:30:00.000Z"
 */
export function parseSDKTime(sdkTime: string): string {
  // SDK时间格式: YYYY-MM-DD HH:mm:ss
  const match = /^(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})$/.exec(sdkTime)
  
  if (!match) {
    throw new Error(`Invalid SDK time format: ${sdkTime}. Expected: YYYY-MM-DD HH:mm:ss`)
  }

  const [, year, month, day, hours, minutes, seconds] = match
  const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date components in: ${sdkTime}`)
  }

  return date.toISOString()
}

/**
 * 将Date对象转换为日期格式 (YYYY-MM-DD)
 * @param date - Date对象或ISO字符串
 * @returns 日期字符串，如 "2025-11-12"
 * @example
 * formatDateOnly(new Date()) // "2025-11-12"
 */
export function formatDateOnly(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`)
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 获取当前时间的SDK格式字符串
 * @returns 当前时间的SDK格式，如 "2025-11-12 15:30:00"
 */
export function getCurrentSDKTime(): string {
  return formatTimeForSDK(new Date())
}

/**
 * 校验时间字符串是否符合SDK格式
 * @param timeStr - 时间字符串
 * @returns 是否符合 YYYY-MM-DD HH:mm:ss 格式
 */
export function isValidSDKTimeFormat(timeStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(timeStr)
}

/**
 * 校验时间字符串是否符合日期格式
 * @param dateStr - 日期字符串
 * @returns 是否符合 YYYY-MM-DD 格式
 */
export function isValidDateFormat(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
}
