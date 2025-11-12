import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { showError, showSuccess, showInfo } from './useToast'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, clearAuth, fetchUser } = useAuthStore()

  // Check auth status on mount
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser().catch(() => {
        clearAuth()
        navigate('/login')
      })
    }
  }, [isAuthenticated, user, fetchUser, clearAuth, navigate])

  const login = async () => {
    try {
      await fetchUser()
      showSuccess('登录成功，欢迎使用千川SDK管理平台')
      navigate('/dashboard')
      return true
    } catch (error) {
      showError(error instanceof Error ? `登录失败: ${error.message}` : '登录失败，请重试')
      return false
    }
  }

  const logout = () => {
    clearAuth()
    showInfo('已退出登录')
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
}

export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return { isAuthenticated }
}
