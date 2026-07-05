import api from './axios'

export const getAdminDashboardStats = async (filters = {}) => {
  const { data } = await api.get('/admin/dashboard/stats', { params: filters })
  return data
}
