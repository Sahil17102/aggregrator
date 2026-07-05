import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api/notification.api'

export const CLIENT_NOTIFICATIONS_QUERY_KEY = ['client-notifications']

export const useClientNotifications = (enabled: boolean) => {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: CLIENT_NOTIFICATIONS_QUERY_KEY,
    queryFn: getMyNotifications,
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 60_000 : false,
    refetchOnWindowFocus: true,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENT_NOTIFICATIONS_QUERY_KEY }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLIENT_NOTIFICATIONS_QUERY_KEY }),
  })

  return {
    ...notificationsQuery,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    markingRead: markReadMutation.isPending,
    markingAllRead: markAllReadMutation.isPending,
  }
}
