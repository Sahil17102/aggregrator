import { Box, Grid, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { FiLink } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { MdCheckCircle } from 'react-icons/md'
import type { FormErrors } from '../../pages/onboarding/UserOnboarding'
import type { UserInfoData } from '../../types/user.types'
import { createSyntheticEvent } from '../../utils/functions'

interface IStepThree {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    subKey?: keyof UserInfoData,
  ) => void
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const DE_BLUE = '#071D49'
const BRAND_PURPLE = '#7357FF'
const BRAND_ORANGE = '#FF6B13'

type ChannelOption = {
  key: string
  label: string
  subtitle: string
  logoBg: string
  logo?: string
  fallback?: string
  icon?: IconType
}

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    key: 'shopify',
    label: 'Shopify',
    subtitle: 'E-commerce platform',
    logo: '/logo/integrations/shopify.webp',
    logoBg: '#F3FAED',
  },
  {
    key: 'woocommerce',
    label: 'WooCommerce',
    subtitle: 'WordPress plugin',
    logo: '/logo/integrations/woocommerce.webp',
    logoBg: '#F4EEFF',
  },
  {
    key: 'amazon',
    label: 'Amazon Seller',
    subtitle: 'Marketplace seller',
    logo: '/logo/integrations/amazon.png',
    logoBg: '#FFF4E8',
  },
  {
    key: 'flipkart',
    label: 'Flipkart Seller',
    subtitle: 'Marketplace seller',
    fallback: 'f',
    logoBg: '#FFE500',
  },
  {
    key: 'magento',
    label: 'Magento',
    subtitle: 'E-commerce platform',
    logo: '/logo/integrations/magento.png',
    logoBg: '#FFF5F0',
  },
  {
    key: 'customApi',
    label: 'Custom API',
    subtitle: 'Direct integration',
    icon: FiLink,
    logoBg: '#F6F8FC',
  },
]

export default function StepThree({ formData, onChange }: IStepThree) {
  const selectedChannels = formData?.platformIntegration || {}

  const toggleChannel = (key: string) => {
    onChange(
      createSyntheticEvent(key, !Boolean(selectedChannels?.[key])),
      'platformIntegration',
    )
  }

  return (
    <Stack spacing={{ xs: 2.4, md: 3 }}>
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: DE_BLUE,
            mb: 0.8,
            fontSize: { xs: '1.45rem', sm: '1.7rem', md: '2rem' },
            letterSpacing: 0,
          }}
        >
          Connect your store
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#5A6C8C', fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: 1.55 }}
        >
          Select platforms you'd like to integrate. You can always do this later.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.4, md: 1.8 }}>
        {CHANNEL_OPTIONS.map((option) => {
          const active = Boolean(selectedChannels?.[option.key])
          const Icon = option.icon

          return (
            <Grid key={option.key} size={{ xs: 12, sm: 6 }}>
              <Box
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => toggleChannel(option.key)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleChannel(option.key)
                  }
                }}
                sx={{
                  minHeight: 92,
                  height: '100%',
                  p: { xs: 1.7, md: 2 },
                  borderRadius: 2.4,
                  border: `2px solid ${active ? BRAND_PURPLE : '#E7ECF4'}`,
                  backgroundColor: active ? alpha(BRAND_PURPLE, 0.035) : '#FAFBFD',
                  boxShadow: active ? `0 18px 34px ${alpha(BRAND_PURPLE, 0.14)}` : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.6,
                  position: 'relative',
                  transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease',
                  '&:hover': {
                    borderColor: active ? BRAND_PURPLE : alpha(BRAND_PURPLE, 0.45),
                    transform: 'translateY(-1px)',
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${alpha(BRAND_PURPLE, 0.28)}`,
                    outlineOffset: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    bgcolor: option.logoBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: '#2874F0',
                    textTransform: 'uppercase',
                  }}
                >
                  {option.logo ? (
                    <Box
                      component="img"
                      src={option.logo}
                      alt=""
                      sx={{ width: 30, height: 30, objectFit: 'contain' }}
                    />
                  ) : Icon ? (
                    <Icon size={22} color="#617089" />
                  ) : (
                    option.fallback
                  )}
                </Box>

                <Box sx={{ minWidth: 0, pr: active ? 3.3 : 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.98rem', md: '1.05rem' },
                      lineHeight: 1.2,
                      fontWeight: 900,
                      color: DE_BLUE,
                    }}
                  >
                    {option.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: { xs: '0.82rem', md: '0.9rem' },
                      color: '#5B6F91',
                      lineHeight: 1.25,
                    }}
                  >
                    {option.subtitle}
                  </Typography>
                </Box>

                {active && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: BRAND_PURPLE,
                      display: 'flex',
                    }}
                  >
                    <MdCheckCircle size={26} />
                  </Box>
                )}
              </Box>
            </Grid>
          )
        })}
      </Grid>

      <Box
        sx={{
          p: { xs: 1.7, md: 2 },
          borderRadius: 2,
          bgcolor: alpha(BRAND_ORANGE, 0.08),
          border: `1px solid ${alpha(BRAND_ORANGE, 0.18)}`,
        }}
      >
        <Typography variant="body2" sx={{ color: '#93420C', fontWeight: 700, lineHeight: 1.55 }}>
          Pick one or more channels now, or leave all unselected and finish setup. Store
          connection details can be added later from the Integrations panel.
        </Typography>
      </Box>
    </Stack>
  )
}
