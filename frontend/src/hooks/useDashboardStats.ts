import { useState, useEffect } from 'react'
import { getAdvertiserReport } from '@/api/report'
import { useAdvertiserStore } from '@/store/advertiserStore'

export interface DashboardStats {
  todayCost: number
  todayShow: number
  todayClick: number
  todayConvert: number
  costChange: number
  showChange: number
  clickChange: number
  convertChange: number
}

export interface TrendDataPoint {
  date: string
  消耗: number
  展示: number
  点击: number
}

export function useDashboardStats() {
  const { currentAdvertiser } = useAdvertiserStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    if (!currentAdvertiser) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 获取今日数据
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]!
      
      const todayData = await getAdvertiserReport({
        advertiser_id: currentAdvertiser.id,
        start_date: todayStr,
        end_date: todayStr,
        fields: ['stat_cost', 'show_cnt', 'click_cnt', 'convert_cnt'],
      })

      // 获取昨日数据用于计算变化率
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]!

      const yesterdayData = await getAdvertiserReport({
        advertiser_id: currentAdvertiser.id,
        start_date: yesterdayStr,
        end_date: yesterdayStr,
        fields: ['stat_cost', 'show_cnt', 'click_cnt', 'convert_cnt'],
      })

      // 获取近7天趋势数据
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]!

      const trendResponse = await getAdvertiserReport({
        advertiser_id: currentAdvertiser.id,
        start_date: sevenDaysAgoStr,
        end_date: todayStr,
        fields: ['stat_datetime', 'stat_cost', 'show_cnt', 'click_cnt'],
      })

      // 处理今日数据 (API 直接返回数组)
      const todayStats = (Array.isArray(todayData) && todayData[0] ? todayData[0] : {
        stat_cost: 0,
        show_cnt: 0,
        click_cnt: 0,
        convert_cnt: 0,
      }) as { stat_cost: number; show_cnt: number; click_cnt: number; convert_cnt: number }

      const yesterdayStats = (Array.isArray(yesterdayData) && yesterdayData[0] ? yesterdayData[0] : {
        stat_cost: 0,
        show_cnt: 0,
        click_cnt: 0,
        convert_cnt: 0,
      }) as { stat_cost: number; show_cnt: number; click_cnt: number; convert_cnt: number }

      // 计算变化率
      const calculateChange = (today: number, yesterday: number) => {
        if (yesterday === 0) return 0
        return ((today - yesterday) / yesterday) * 100
      }

      setStats({
        todayCost: todayStats.stat_cost / 100, // 转换为元
        todayShow: todayStats.show_cnt,
        todayClick: todayStats.click_cnt,
        todayConvert: todayStats.convert_cnt,
        costChange: calculateChange(todayStats.stat_cost, yesterdayStats.stat_cost),
        showChange: calculateChange(todayStats.show_cnt, yesterdayStats.show_cnt),
        clickChange: calculateChange(todayStats.click_cnt, yesterdayStats.click_cnt),
        convertChange: calculateChange(todayStats.convert_cnt, yesterdayStats.convert_cnt),
      })

      // 处理趋势数据 (API 直接返回数组)
      const trend = Array.isArray(trendResponse) ? trendResponse.map((item: any) => ({
        date: item.stat_datetime?.substring(5, 10) || '',
        消耗: item.stat_cost / 100,
        展示: item.show_cnt,
        点击: item.click_cnt,
      })) : []

      setTrendData(trend)
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
      setError(err as Error)
      
      // 设置默认值避免页面空白
      setStats({
        todayCost: 0,
        todayShow: 0,
        todayClick: 0,
        todayConvert: 0,
        costChange: 0,
        showChange: 0,
        clickChange: 0,
        convertChange: 0,
      })
      setTrendData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [currentAdvertiser])

  return {
    stats,
    trendData,
    loading,
    error,
    refetch: fetchStats,
  }
}
