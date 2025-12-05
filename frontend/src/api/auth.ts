/**
 * 认证API服务
 * 
 * 提供OAuth2.0认证、用户信息获取、会话管理等功能
 * 
 * @module api/auth
 */

import apiClient from './client'

/**
 * 用户信息接口
 */
export interface User {
  /** 用户ID */
  id: number
  /** 用户名称 */
  name: string
  /** 邮箱地址 */
  email?: string
  /** 广告主ID */
  advertiserId?: number
}

/**
 * OAuth授权码换取Session
 * 
 * 该接口将OAuth授权码发送给后端，后端调用千川SDK换取access_token，
 * 并将token存储在服务端的Session中，返回HttpOnly Cookie。
 * 
 * @param code - 千川 OAuth授权码（参数名为 auth_code 或 code）
 * @param state - OAuth state参数，用于CSRF防护审计
 * @returns Promise<{ success: boolean }> - 成功返回 success: true
 * 
 * @throws {Error} 当OAuth交换失败或服务器错误时抛出
 * 
 * @example
 * ```typescript
 * // 在/auth/callback页面中使用
 * const code = params.get('code') || params.get('auth_code')
 * const state = params.get('state')
 * await exchangeOAuthCode(code, state)
 * // Session Cookie已设置，后续请求自动携带
 * ```
 */
export const exchangeOAuthCode = (code: string, state?: string): Promise<{ success: boolean }> => {
  return apiClient.post('/oauth/exchange', { code, state })
}

/**
 * 获取当前登录用户信息
 * 
 * 使用Session Cookie进行认证，获取已登录用户的详细信息。
 * 此接口用于冷启动鉴权（刷新页面时恢复登录状态）。
 * 
 * @returns Promise<User> - 用户信息对象
 * 
 * @throws {Error} 当未登录或Session过期时抛出401错误
 * 
 * @example
 * ```typescript
 * // 在App.tsx的useEffect中使用
 * try {
 *   const user = await getCurrentUser()
 *   setAuth(user)
 * } catch (error) {
 *   // Session过期，跳转到登录页
 * }
 * ```
 */
export const getCurrentUser = (): Promise<User> => {
  return apiClient.get('/user/info')
}

/**
 * 用户登出
 * 
 * 清除服务端的Session数据，登出当前用户。
 * 
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await logout()
 * window.location.href = '/login'
 * ```
 */
export const logout = (): Promise<void> => {
  return apiClient.post('/auth/logout')
}

/**
 * 刷新会话
 * 
 * 使用refresh_token刷新access_token，延长Session有效期。
 * 当access_token快过期时，可主动调用此接口刷新。
 * 
 * @returns Promise<{ access_token: string, expires_at: number }>
 * 
 * @throws {Error} 当refresh_token过期或刷新失败时抛出401
 * 
 * @example
 * ```typescript
 * // 在Axios拦截器中自动刷新
 * if (error.response.status === 401) {
 *   await refreshSession()
 *   // 重试原请求
 * }
 * ```
 */
export const refreshSession = (): Promise<{ access_token: string; expires_at: number }> => {
  return apiClient.post('/auth/refresh')
}
