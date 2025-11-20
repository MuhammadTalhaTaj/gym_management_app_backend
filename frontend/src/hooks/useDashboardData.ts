// src/hooks/useDashboardData.ts
import { useEffect, useState } from 'react'
import { apiRequest } from '../config/api'

export interface DashboardData {
  revenueThisMonth: number
  totalAdmissionsThisMonth: number
  expiringSubscriptions: number
  netDueAmount: number
  expense: number
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiRequest<DashboardData>({
          method: 'GET',
          endpoint: '/auth/dashboard',
        })
        setData(res)
      } catch (err: any) {
        console.error('Dashboard fetch error:', err)
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
