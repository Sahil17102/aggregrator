import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import StepOneForm from '../../components/onboarding/StepOneForm'
import StepThree from '../../components/onboarding/StepThree'
import StepTwoForm from '../../components/onboarding/StepTwoForm'
import SwitchAccountButton from '../../components/onboarding/SwitchAccountButton'
import CustomIconLoadingButton from '../../components/UI/button/CustomLoadingButton'
import FullScreenLoader from '../../components/UI/loader/FullScreenLoader'
import { useAuth } from '../../context/auth/AuthContext'
import { useCompleteUserOnboarding } from '../../hooks/useCompleteUserOnboarding'
import { clearOnboardingPrefill, getOnboardingPrefill } from '../../utils/onboardingPrefill'
import type { UserInfoData } from '../../types/user.types'
import { hasValidationErrors, validateOnboardingFields } from '../../utils/functions'
import { brand, brandGradients } from '../../theme/brand'
import { initialFormData } from '../../utils/utility'
import { isOnboardingComplete } from '../../utils/authRedirect'

const DE_BLUE = brand.ink
const DE_AMBER = brand.accent

export type FormErrors = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof UserInfoData]: any
}

type UserContactFallback = {
  phone?: string
}

const steps = [
  { key: 1, title: 'Personal Info', helper: 'Your contact details' },
  { key: 2, title: 'Business Details', helper: 'About your business' },
  { key: 3, title: 'Integrations', helper: 'Connect your store' },
]

export default function UserOnboarding() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { user: userData, loading: fetchingUserData } = useAuth()
  const { mutateAsync: completeOnboarding, isPending } = useCompleteUserOnboarding()

  const [step, setStep] = useState<number>(1)
  const [formData, setFormData] = useState<UserInfoData>({ ...initialFormData })
  const [formErrors, setFormErrors] = useState<FormErrors>({ ...initialFormData })

  const progressPercent = useMemo(() => Math.round((step / steps.length) * 100), [step])

  useEffect(() => {
    if (!userData) return

    if (isOnboardingComplete(userData)) {
      navigate('/dashboard')
      return
    }

    const resumeStep = (userData.onboardingStep ?? 0) + 1
    const clamped = Math.min(Math.max(resumeStep, 1), steps.length)
    setStep(clamped)
  }, [userData, navigate])

  useEffect(() => {
    if (!userData || !Object.keys(userData).length) return

    const prefill = getOnboardingPrefill()

    setFormData({
      basicInfo: {
        firstName:
          userData?.companyInfo?.contactPerson?.split(' ')?.[0] ||
          prefill?.firstName ||
          '',
        lastName:
          userData?.companyInfo?.contactPerson?.split(' ')?.slice(1).join(' ') ||
          prefill?.lastName ||
          '',
        email: userData?.companyInfo?.contactEmail || userData?.email || prefill?.email || '',
        phone:
          userData?.companyInfo?.contactNumber ||
          (userData as typeof userData & UserContactFallback)?.phone ||
          prefill?.phone ||
          '',
        companyName: userData?.companyInfo?.businessName ?? '',
        pincode: userData?.companyInfo?.pincode ?? '',
        state: userData?.companyInfo?.state ?? '',
        city: userData?.companyInfo?.city ?? '',
        personalWebsite: userData?.companyInfo?.website ?? '',
      },
      businessLegal: {
        brandName: userData?.companyInfo?.brandName ?? '',
        businessCategory: userData?.businessType ?? [],
        monthlyShipments: userData?.monthlyOrderCount ?? '0-100',
      },
      platformIntegration: { ...(userData?.salesChannels ?? {}) },
    })
    clearOnboardingPrefill()
  }, [userData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    subKey?: keyof UserInfoData,
  ) => {
    const { name, value } = e.target

    const updatedForm = subKey
      ? {
          ...formData,
          [subKey]: {
            ...formData[subKey],
            [name]: value,
          },
        }
      : {
          ...formData,
          [name]: value,
        }

    setFormData(updatedForm)

    const newErrors = validateOnboardingFields(updatedForm, step)
    setFormErrors((prev) => {
      if (subKey) {
        return {
          ...prev,
          [subKey]: {
            ...prev[subKey],
            [name]: newErrors[subKey]?.[name] || '',
          },
        }
      }
      return {
        ...prev,
        [name]: newErrors[name] || '',
      }
    })
  }

  const handleNext = async () => {
    const errors = validateOnboardingFields(formData, step)
    setFormErrors(errors)

    if (hasValidationErrors(errors)) return

    const response = (await completeOnboarding({ step, data: formData })) as { user?: unknown }

    if (response?.user) {
      if (step < steps.length) {
        setStep((prev) => prev + 1)
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        navigate('/dashboard')
      }
    }
  }

  if (fetchingUserData) return <FullScreenLoader />

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: brandGradients.page,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 2, md: 4 },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ width: '100%', maxWidth: 840, mb: 3 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: DE_BLUE, letterSpacing: -0.5, fontSize: '1.4rem' }}
        >
          Ship Aggregator Seller Panel
        </Typography>
        <SwitchAccountButton />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 840,
          borderRadius: '34px',
          border: `1px solid ${alpha('#FFFFFF', 0.72)}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: '0 24px 54px rgba(15, 44, 67, 0.1)',
        }}
      >
        {/* Sidebar Progress */}
        <Box
          sx={{
            width: { xs: '100%', md: 280 },
            background: `
              radial-gradient(circle at 0% 0%, ${alpha(DE_AMBER, 0.22)} 0%, transparent 32%),
              ${brandGradients.softSurface}
            `,
            borderRight: { md: `1px solid ${alpha(DE_BLUE, 0.08)}` },
            borderBottom: { xs: `1px solid ${alpha(DE_BLUE, 0.08)}`, md: 'none' },
            p: 3,
          }}
        >
          <Stack spacing={3.5}>
            {steps.map((s) => {
              const active = step === s.key
              const completed = step > s.key

              return (
                <Stack key={s.key} direction="row" spacing={1.8} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed ? '#36B37E' : active ? DE_BLUE : 'transparent',
                      border: completed
                        ? 'none'
                        : `1.5px solid ${active ? DE_BLUE : alpha(DE_BLUE, 0.2)}`,
                      color: completed || active ? '#fff' : alpha(DE_BLUE, 0.4),
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {completed ? <FiCheckCircle size={18} /> : s.key}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: active ? DE_BLUE : completed ? '#36B37E' : alpha(DE_BLUE, 0.4),
                      }}
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: alpha(DE_BLUE, 0.35),
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {s.helper}
                    </Typography>
                  </Box>
                </Stack>
              )
            })}
          </Stack>

          <Box sx={{ mt: 6 }}>
            <Typography variant="caption" sx={{ color: alpha(DE_BLUE, 0.4), fontWeight: 700 }}>
              WORKSPACE SETUP
            </Typography>
            <Box
              sx={{
                height: 6,
                bgcolor: alpha(DE_BLUE, 0.08),
                borderRadius: 3,
                mt: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  bgcolor: DE_BLUE,
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ mt: 0.8, display: 'block', fontWeight: 800, color: DE_BLUE }}
            >
              {progressPercent}% Complete
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2.5, md: 4 },
            background: 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,251,255,0.98) 100%)',
          }}
        >
          {step === 3 ? (
            <Button
              onClick={() => setStep((p) => p - 1)}
              startIcon={<MdArrowBack />}
              sx={{
                color: alpha(DE_BLUE, 0.72),
                fontWeight: 700,
                textTransform: 'none',
                px: 0,
                mb: 3.2,
                justifyContent: 'flex-start',
                '&:hover': { bgcolor: 'transparent', color: DE_BLUE },
              }}
            >
              Back
            </Button>
          ) : (
            <Box sx={{ mb: 3.2 }}>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: alpha(DE_BLUE, 0.6),
                  mb: 0.75,
                }}
              >
                Ship Aggregator onboarding
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.35rem', md: '1.8rem' },
                  fontWeight: 900,
                  color: DE_BLUE,
                }}
              >
                Complete your seller workspace setup
              </Typography>
            </Box>
          )}

          {step === 1 && (
            <StepOneForm
              formData={formData}
              errors={formErrors}
              onChange={handleChange}
              setFormData={setFormData}
              setErrors={setFormErrors}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepTwoForm formData={formData} errors={formErrors} onChange={handleChange} />
          )}
          {step === 3 && (
            <StepThree
              formData={formData}
              errors={formErrors}
              onChange={handleChange}
              setErrors={setFormErrors}
            />
          )}

          <Stack
            direction={step === 3 ? 'column' : 'row'}
            spacing={step === 3 ? 1.6 : 2}
            alignItems={step === 3 ? 'center' : 'stretch'}
            sx={{ mt: 4, pt: step === 3 ? 0 : 3, borderTop: step === 3 ? 'none' : `1px solid ${alpha(DE_BLUE, 0.06)}` }}
          >
            {step > 1 && step !== 3 && (
              <Button
                onClick={() => setStep((p) => p - 1)}
                startIcon={<MdArrowBack />}
                sx={{
                  color: DE_BLUE,
                  fontWeight: 800,
                  textTransform: 'none',
                  px: 3,
                  borderRadius: 1,
                  '&:hover': { bgcolor: alpha(DE_BLUE, 0.06) },
                }}
              >
                Back
              </Button>
            )}

            <CustomIconLoadingButton
              variant="solid"
              fullWidth
              loading={isPending}
              onClick={handleNext}
              endIcon={step < steps.length ? <MdArrowForward /> : <FiCheckCircle />}
              text={step < steps.length ? 'Continue Setup' : 'Complete Setup'}
              styles={{
                flex: 1,
                background: step === 3 ? 'linear-gradient(135deg, #FF6B13 0%, #F35A00 100%)' : brandGradients.button,
                color: step === 3 ? '#FFFFFF' : brand.ink,
                borderRadius: step === 3 ? 2.2 : 999,
                fontWeight: 800,
                fontSize: '1rem',
                py: step === 3 ? 1.45 : 1.2,
                boxShadow: step === 3 ? '0 18px 34px rgba(255,107,19,0.26)' : '0 16px 32px rgba(130,194,255,0.24)',
              }}
            />

            {step === 3 && (
              <Button
                onClick={handleNext}
                disabled={isPending}
                endIcon={<MdArrowForward />}
                sx={{
                  color: alpha(DE_BLUE, 0.72),
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: alpha(DE_BLUE, 0.04), color: DE_BLUE },
                }}
              >
                Skip for now
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}


