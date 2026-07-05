import { useQuery } from '@tanstack/react-query'
import { getAdminDashboardStats } from 'services/dashboard.service'

export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: ['admin-dashboard-stats', filters],
    queryFn: () => getAdminDashboardStats(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

