import { useMutation } from '@tanstack/react-query'
import { requestPasswordResetApi, resetPasswordApi } from '../api/auth'

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (email: string) => requestPasswordResetApi(email),
  })

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({
      email,
      token,
      newPassword,
    }: {
      email: string
      token: string
      newPassword: string
    }) => resetPasswordApi(email, token, newPassword),
  })
