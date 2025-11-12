import apiClient from './client'

interface User {
  id: number
  name: string
  email?: string
  advertiserId?: number
}

// OAuth换取session
export const exchangeOAuthCode = (code: string): Promise<{ success: boolean }> => {
  return apiClient.post('/oauth/exchange', { code })
}

// 获取当前用户信息
export const getCurrentUser = (): Promise<User> => {
  return apiClient.get('/user/info')
}

// 登出
export const logout = () => {
  return apiClient.post('/auth/logout')
}

// 刷新会话
export const refreshSession = () => {
  return apiClient.post('/auth/refresh')
}
