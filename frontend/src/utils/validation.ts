/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号（中国大陆）
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证身份证号（简单验证）
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return idCardRegex.test(idCard)
}

/**
 * 验证正整数
 */
export function isPositiveInteger(value: string | number): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return Number.isInteger(num) && num > 0
}

/**
 * 验证数字范围
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 验证字符串长度
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max
}

/**
 * 验证密码强度（至少8位，包含大小写字母和数字）
 */
export function isStrongPassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * 验证中文字符
 */
export function isChineseChar(str: string): boolean {
  const chineseRegex = /^[\u4e00-\u9fa5]+$/
  return chineseRegex.test(str)
}

/**
 * 验证文件扩展名
 */
export function hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? allowedExtensions.includes(ext) : false
}
