import {
  Box,
  Chip,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import { FiMail, FiShield } from 'react-icons/fi'
import { useRequestOtp } from '../../hooks/useOTP'
import { TEXT } from '../../theme/theme'
import CustomIconLoadingButton from '../UI/button/CustomLoadingButton'
import CustomCheckbox from '../UI/inputs/CustomCheckbox'
import CustomInput from '../UI/inputs/CustomInput'
import CustomModal from '../UI/modal/CustomModal'
import TermsAndConditionsText from '../terms/TermsAndConditionsText'
import { toast } from '../UI/Toast'
import OtpForm from './OtpForm'
import PasswordLoginForm from './PasswordLoginForm'
import { getAuthErrorMessage } from './getAuthErrorMessage'

const DE_BLUE = '#171310'

const primaryButtonStyles = {
  width: '100%',
  borderRadius: 1,
  bgcolor: DE_BLUE,
  boxShadow: `0 8px 24px ${alpha(DE_BLUE, 0.3)}`,
  '&:hover': { bgcolor: '#0D0A08' },
}

const secondaryButtonStyles = {
  width: '100%',
  border: `1px solid ${alpha(DE_BLUE, 0.2)}`,
  backgroundColor: alpha(DE_BLUE, 0.04),
  color: DE_BLUE,
  borderRadius: 1,
}

export default function PhoneForm() {
  const activeEmail = sessionStorage.getItem('activeEmail')
  const [step, setStep] = useState<number>(0)
  const [preferredLoginMethod, setPreferredLoginMethod] = useState<'phone' | 'password'>('phone')
  const [email, setEmail] = useState('')
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false)
  const [openTerms, setOpenTerms] = useState(false)

  const { mutate: sendOtpRequest, isPending } = useRequestOtp()

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setEmail(value)
  }, [])

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = email.length > 0 && emailRegex.test(email)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      setPreferredLoginMethod('phone')
      sessionStorage.setItem('preferredMethod', 'phone')

      sendOtpRequest(email.toLowerCase().trim(), {
        onSuccess: () => {
          toast.open({
            message: 'Verification code sent to your email.',
            severity: 'success',
            position: { vertical: 'top', horizontal: 'center' },
          })
          setStep(1)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          const msg = getAuthErrorMessage(err, 'OTP request failed')
          toast.open({
            message: msg,
            severity: 'error',
            position: { vertical: 'top', horizontal: 'center' },
          })
        },
      })
    },
    [email, sendOtpRequest],
  )

  useEffect(() => {
    if (activeEmail) setEmail(activeEmail)
  }, [activeEmail])

  const renderOtpEntry = () =>
    step === 0 ? (
      <Box component="form" noValidate onSubmit={handleSubmit} width="100%">
        <CustomInput
          type="email"
          label="Work Email"
          value={email}
          name="email"
          id="email"
          onChange={handleEmailChange}
          required
          error={email.length > 0 && !isValidEmail}
          helperText={email.length > 0 && !isValidEmail ? 'Enter a valid email address.' : ''}
          autoFocus
          prefix={<FiMail color={DE_BLUE} size={15} />}
        />

        <FormControlLabel
          sx={{ mt: 1.2, mb: 2.3, alignItems: 'flex-start' }}
          control={
            <CustomCheckbox
              checked={keepMeSignedIn}
              onChange={(e) => setKeepMeSignedIn(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography mt={0.5} variant="body2" color="#6A616A">
              Keep me signed in on this device
            </Typography>
          }
        />

        <CustomIconLoadingButton
          type="submit"
          styles={primaryButtonStyles}
          textColor="#ffffff"
          disabled={!email || isPending || !isValidEmail}
          text="Send verification code"
          loading={isPending}
          loadingText="Sending..."
        />
      </Box>
    ) : (
      <OtpForm
        email={email}
        keepMeSignedIn={keepMeSignedIn}
        onEditEmail={() => {
          setStep(0)
        }}
      />
    )

  return (
    <Stack spacing={2.2} alignItems="stretch">
      <Stack spacing={1.2}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: DE_BLUE }}>
          Secure Authentication
        </Typography>
        <Typography variant="body2" sx={{ color: '#6A616A', lineHeight: 1.6, fontWeight: 500 }}>
          Access your logistics dashboard using your registered work email. Verification codes
          are sent through the actual login flow to your email.
        </Typography>

        <Chip
          icon={<FiShield size={14} />}
          label="Enterprise-grade security"
          size="small"
          sx={{
            alignSelf: 'flex-start',
            mt: 0.2,
            backgroundColor: alpha('#36B37E', 0.1),
            color: '#00875A',
            fontWeight: 700,
            borderRadius: 1,
            '& .MuiChip-icon': { color: '#00875A' },
          }}
        />
      </Stack>

      <ToggleButtonGroup
        value={preferredLoginMethod}
        exclusive
        onChange={(_, value) => {
          if (!value) return
          setPreferredLoginMethod(value)
          setStep(0)
        }}
        fullWidth
        sx={{
          p: 0.5,
          borderRadius: 1,
          backgroundColor: alpha(DE_BLUE, 0.04),
          border: `1px solid ${alpha(DE_BLUE, 0.08)}`,
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontWeight: 800,
            border: 'none',
            borderRadius: 0.5,
            color: alpha(TEXT, 0.6),
            '&.Mui-selected': {
              backgroundColor: '#FFFFFF',
              color: DE_BLUE,
              boxShadow: '0 4px 12px rgba(138, 31, 67, 0.12)',
              '&:hover': {
                backgroundColor: '#FFFFFF',
              },
            },
          },
        }}
      >
        <ToggleButton value="phone">One-Time Passcode</ToggleButton>
        <ToggleButton value="password">Email + Password</ToggleButton>
      </ToggleButtonGroup>

      {preferredLoginMethod === 'phone' ? (
        renderOtpEntry()
      ) : (
        <PasswordLoginForm step={step} setStep={setStep} />
      )}

      <CustomIconLoadingButton
        styles={secondaryButtonStyles}
        onClick={() => setOpenTerms(true)}
        variant="text"
        text="View terms and policies"
      />

      <CustomModal
        open={openTerms}
        onClose={() => setOpenTerms(false)}
        title="Terms and Conditions"
      >
        <TermsAndConditionsText />
      </CustomModal>
    </Stack>
  )
}
