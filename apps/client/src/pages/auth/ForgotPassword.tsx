import { Box, Link, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { FiArrowRight, FiMail } from 'react-icons/fi'
import { MdPassword } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import CustomIconLoadingButton from '../../components/UI/button/CustomLoadingButton'
import CustomInput from '../../components/UI/inputs/CustomInput'
import { toast } from '../../components/UI/Toast'
import { useAuth } from '../../context/auth/AuthContext'
import { useRequestPasswordReset, useResetPassword } from '../../hooks/usePasswordReset'
import { getPostAuthRedirect } from '../../utils/authRedirect'
import { getAuthErrorMessage } from '../../components/auth/getAuthErrorMessage'
import { brand } from '../../theme/brand'

const RESET_NAVY = '#0D1B4D'
const RESET_ORANGE = '#E86F00'

type AuthUser = {
  id?: string
  onboardingComplete?: boolean | null
}

type AuthResponse = Record<string, unknown> & {
  token?: string
  refreshToken?: string
  user?: AuthUser
  message?: string
  resetToken?: string
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokens, setUserId } = useAuth()
  const { mutate: requestReset, isPending: requesting } = useRequestPasswordReset()
  const { mutate: submitReset, isPending: resetting } = useResetPassword()

  const initialEmail = searchParams.get('email')?.trim().toLowerCase() ?? ''
  const initialToken = searchParams.get('token')?.trim().toUpperCase() ?? ''

  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState(initialToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setEmail(initialEmail)
    setToken(initialToken)
  }, [initialEmail, initialToken])

  const emailError = useMemo(() => {
    if (!email) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.'
    return ''
  }, [email])

  const tokenError = useMemo(() => {
    if (!token) return 'Reset code is required.'
    if (token.length !== 8) return 'Reset code must be 8 characters.'
    return ''
  }, [token])

  const passwordError = useMemo(() => {
    if (!newPassword) return 'New password is required.'
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}/.test(newPassword)) {
      return 'Use at least 8 characters with upper, lower, and a number.'
    }
    return ''
  }, [newPassword])

  const confirmError = useMemo(() => {
    if (!confirmPassword) return 'Please confirm your password.'
    if (confirmPassword !== newPassword) return 'Passwords do not match.'
    return ''
  }, [confirmPassword, newPassword])

  const isResetMode = Boolean(token)

  const handleRequestReset = (event?: React.FormEvent) => {
    event?.preventDefault()

    if (emailError) {
      setError(emailError)
      return
    }

    setError('')
    setStatusMessage('')

    requestReset(email.trim().toLowerCase(), {
      onSuccess: (response: AuthResponse) => {
        const resetCode = response?.resetToken
        if (resetCode) {
          setToken(resetCode)
          setStatusMessage('Reset code generated. You can set the new password now.')
        } else {
          setStatusMessage(
            response?.message ||
              'If an account exists for this email, a password reset message has been sent.',
          )
        }

        toast.open({
          message:
            response?.message ||
            'If an account exists for this email, a password reset message has been sent.',
          severity: 'success',
        })
      },
      onError: (err: unknown) => {
        setError(getAuthErrorMessage(err, 'Unable to request a password reset'))
      },
    })
  }

  const handleResetPassword = (event?: React.FormEvent) => {
    event?.preventDefault()

    if (emailError || tokenError || passwordError || confirmError) {
      setError(emailError || tokenError || passwordError || confirmError)
      return
    }

    setError('')
    setStatusMessage('')

    submitReset(
      {
        email: email.trim().toLowerCase(),
        token,
        newPassword,
      },
      {
        onSuccess: (response: AuthResponse) => {
          if (response?.token && response?.refreshToken) {
            setUserId(response?.user?.id ?? '')
            setTokens(response.token, response.refreshToken, true)
            sessionStorage.setItem('activeEmail', email.trim().toLowerCase())
            toast.open({
              message: 'Password reset successfully.',
              severity: 'success',
            })
            navigate(getPostAuthRedirect(response?.user), { replace: true })
            return
          }

          setStatusMessage(response?.message || 'Password reset successfully.')
        },
        onError: (err: unknown) => {
          setError(getAuthErrorMessage(err, 'Unable to reset password'))
        },
      },
    )
  }

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title={'Reset your password\nand get back in.'}
      subtitle="We will send a secure reset link to your inbox. Use it to set a new password and keep old sessions out."
      helperTitle="Forgot your password?"
      helperText="Start with your email address. If you already opened the reset email, finish from here."
      showChrome
      showNavbar={false}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            border: `1px solid ${alpha(RESET_NAVY, 0.1)}`,
            background: `linear-gradient(180deg, ${alpha(RESET_NAVY, 0.04)} 0%, ${alpha(
              RESET_ORANGE,
              0.04,
            )} 100%)`,
          }}
        >
          <Typography variant="body2" sx={{ color: brand.inkSoft, lineHeight: 1.7, fontWeight: 500 }}>
            Use the same email you sign in with. We will send a reset code and link to the inbox on file.
          </Typography>
        </Box>

        {statusMessage ? (
          <Box
            sx={{
              p: 1.35,
              borderRadius: '10px',
              bgcolor: alpha('#2E7D32', 0.08),
              border: '1px solid rgba(46,125,50,0.18)',
            }}
          >
            <Typography sx={{ color: '#2E7D32', fontSize: '0.9rem', fontWeight: 700 }}>
              {statusMessage}
            </Typography>
          </Box>
        ) : null}

        {isResetMode ? (
          <Stack component="form" spacing={1.2} onSubmit={handleResetPassword}>
            <CustomInput
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              helperText={email ? emailError : ''}
              error={Boolean(email) && Boolean(emailError)}
              prefix={<FiMail color={brand.ink} size={15} />}
              required
            />

            <CustomInput
              label="Reset Code"
              value={token}
              onChange={(event) => {
                setToken(event.target.value.toUpperCase())
                setError('')
              }}
              helperText={token ? tokenError : ''}
              error={Boolean(token) && Boolean(tokenError)}
              required
              maxLength={8}
            />

            <CustomInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value)
                setError('')
              }}
              helperText={newPassword ? passwordError : ''}
              error={Boolean(newPassword) && Boolean(passwordError)}
              prefix={<MdPassword color={brand.ink} size={16} />}
              required
            />

            <CustomInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setError('')
              }}
              helperText={confirmPassword ? confirmError : ''}
              error={Boolean(confirmPassword) && Boolean(confirmError)}
              required
            />

            {error ? (
              <Typography sx={{ color: brand.danger, fontSize: '0.82rem', fontWeight: 700 }}>
                {error}
              </Typography>
            ) : null}

            <CustomIconLoadingButton
              type="submit"
              text="Set new password"
              loading={resetting}
              loadingText="Updating..."
              styles={{
                width: '100%',
                borderRadius: '8px',
                background: RESET_NAVY,
                color: '#FFFFFF',
                boxShadow: `0 10px 20px ${alpha(RESET_NAVY, 0.25)}`,
                '&:hover': { background: '#071643' },
              }}
              textColor="#FFFFFF"
              endIconNode={<FiArrowRight size={20} />}
            />
          </Stack>
        ) : (
          <Stack component="form" spacing={1.2} onSubmit={handleRequestReset}>
            <CustomInput
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError('')
              }}
              helperText={email ? emailError : ''}
              error={Boolean(email) && Boolean(emailError)}
              prefix={<FiMail color={brand.ink} size={15} />}
              required
              autoFocus
            />

            {error ? (
              <Typography sx={{ color: brand.danger, fontSize: '0.82rem', fontWeight: 700 }}>
                {error}
              </Typography>
            ) : null}

            <CustomIconLoadingButton
              type="submit"
              text="Send reset email"
              loading={requesting}
              loadingText="Sending..."
              styles={{
                width: '100%',
                borderRadius: '8px',
                background: RESET_NAVY,
                color: '#FFFFFF',
                boxShadow: `0 10px 20px ${alpha(RESET_NAVY, 0.25)}`,
                '&:hover': { background: '#071643' },
              }}
              textColor="#FFFFFF"
              endIconNode={<FiArrowRight size={20} />}
            />

            <Typography sx={{ color: brand.inkSoft, fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
              Already have a reset link?{' '}
              <Link
                href="/reset-password"
                underline="always"
                onClick={(event) => {
                  event.preventDefault()
                  navigate('/reset-password')
                }}
                sx={{ color: RESET_ORANGE, fontWeight: 800 }}
              >
                Open reset page
              </Link>
            </Typography>
          </Stack>
        )}

        <Typography sx={{ color: brand.inkSoft, fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
          Remembered your password?{' '}
          <Link
            href="/login"
            underline="always"
            onClick={(event) => {
              event.preventDefault()
              navigate('/login')
            }}
            sx={{ color: RESET_ORANGE, fontWeight: 800 }}
          >
            Back to sign in
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  )
}
