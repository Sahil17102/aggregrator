import axiosInstance from './axiosInstance'

export interface ClientNotification {
  id: string
  title: string
  message: string
  read?: boolean
  isRead?: boolean
  type?: string | null
  targetRole?: string | null
  createdAt?: string | null
}

export const getMyNotifications = async () => {
  const { data } = await axiosInstance.get<{ notifications: ClientNotification[] }>('/notifications')
  return data.notifications || []
}

export const markNotificationAsRead = async (id: string) => {
  const { data } = await axiosInstance.patch<{ success: boolean }>(`/notifications/${id}/read`)
  return data
}

export const markAllNotificationsAsRead = async () => {
  const { data } = await axiosInstance.patch<{ success: boolean; count?: number }>('/notifications/read-all')
  return data
}
