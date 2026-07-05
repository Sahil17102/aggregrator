import { Alert, AlertTitle, Box, Button, Container, LinearProgress, Stack, Typography, alpha, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMerchantReadiness } from '../../../hooks/useMerchantReadiness'
import FullScreenLoader from '../../UI/loader/FullScreenLoader'

const BRAND_PRIMARY = '#0D3B8E'
const BRAND_ACCENT = '#FF7A00'

export default function RequireMerchantReady({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const { isReady, isLoading, checklist, progress, firstIncompleteStep, assignedPlanName, assignedPlanId } =
    useMerchantReadiness()
  const location = useLocation()
  const navigate = useNavigate()
  const isDark = theme.palette.mode === 'dark'
  const surface = isDark ? '#151b23' : '#fff'
  const nestedSurface = isDark ? '#0f141b' : '#fff'
  const textPrimary = isDark ? '#f8fafc' : '#102A54'
  const textSecondary = isDark ? '#9badc3' : '#496189'
  const borderColor = isDark ? alpha('#f8fafc', 0.12) : alpha(BRAND_PRIMARY, 0.14)
  const readyBorder = isDark ? alpha('#f8fafc', 0.16) : alpha(BRAND_PRIMARY, 0.24)
  const pendingBorder = isDark ? alpha(BRAND_ACCENT, 0.35) : alpha(BRAND_ACCENT, 0.24)
  const readyBg = isDark ? alpha('#ffffff', 0.045) : alpha(BRAND_PRIMARY, 0.05)
  const pendingBg = isDark ? alpha(BRAND_ACCENT, 0.1) : alpha(BRAND_ACCENT, 0.06)
  const progressTrack = isDark ? alpha('#ffffff', 0.12) : alpha(BRAND_PRIMARY, 0.12)
  const assignedPlanLabel = isLoading
    ? 'Checking assigned plan...'
    : assignedPlanName || assignedPlanId || 'Not assigned'

  if (isLoading) return <FullScreenLoader />

  if (isReady) {
    return <>{children}</>
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2.5}>
        <Alert
          severity="warning"
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(BRAND_ACCENT, 0.28)}`,
            bgcolor: isDark ? '#151b23' : undefined,
            color: textPrimary,
            '& .MuiAlert-message': { color: textPrimary },
            '& .MuiAlertTitle-root': { color: textPrimary },
          }}
        >
          <AlertTitle>Panel Setup Incomplete</AlertTitle>
          Order creation is locked until all panel checks are complete.
        </Alert>

        <Box
          sx={{
            p: { xs: 2.2, md: 2.8 },
            borderRadius: 3,
            border: `1px solid ${borderColor}`,
            bgcolor: surface,
            boxShadow: isDark ? 'none' : `0 10px 28px ${alpha(BRAND_PRIMARY, 0.08)}`,
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: textPrimary }}>
                Panel Readiness
              </Typography>
              <Typography sx={{ mt: 0.5, color: textSecondary, fontSize: '0.9rem' }}>
                Complete these checks before creating your first order from the panel.
              </Typography>
              <Typography sx={{ mt: 0.75, color: textPrimary, fontSize: '0.84rem', fontWeight: 700 }}>
                Assigned Plan: {assignedPlanLabel}
              </Typography>
            </Box>

            <Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: progressTrack,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${BRAND_PRIMARY} 0%, ${BRAND_ACCENT} 100%)`,
                  },
                }}
              />
              <Typography sx={{ mt: 0.8, fontSize: '12px', fontWeight: 700, color: textSecondary }}>
                {progress}% ready
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.6,
                borderRadius: 2.2,
                border: `1px solid ${alpha(BRAND_ACCENT, 0.24)}`,
                bgcolor: isDark ? alpha(BRAND_ACCENT, 0.1) : alpha(BRAND_ACCENT, 0.07),
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                gap={1.2}
              >
                <Box>
                  <Typography sx={{ fontSize: '0.94rem', fontWeight: 800, color: textPrimary }}>
                    Need a Custom Plan?
                  </Typography>
                  <Typography sx={{ mt: 0.35, fontSize: '0.82rem', color: textSecondary }}>
                    Contact our admin team for customised pricing, higher shipment support,
                    or enterprise onboarding.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate('/support/tickets', { state: { from: location } })}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: BRAND_PRIMARY,
                    '&:hover': { bgcolor: '#0A2A66' },
                  }}
                >
                  Contact Support Team
                </Button>
              </Stack>
            </Box>

            <Stack spacing={1.1}>
              {checklist.map((item) => (
                <Box
                  key={item.key}
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    border: `1px solid ${item.done ? readyBorder : pendingBorder}`,
                    bgcolor: item.done ? readyBg : pendingBg,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    gap={1.2}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: textPrimary }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: textSecondary, mt: 0.4 }}>
                        {item.description}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant={item.done ? 'outlined' : 'contained'}
                      onClick={() => navigate(item.path, { state: { from: location } })}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        ...(item.done
                          ? {
                              color: isDark ? '#f8fafc' : BRAND_PRIMARY,
                              borderColor: isDark ? alpha('#f8fafc', 0.24) : alpha(BRAND_PRIMARY, 0.35),
                              bgcolor: nestedSurface,
                            }
                          : {
                              bgcolor: BRAND_ACCENT,
                              '&:hover': { bgcolor: '#D95C00' },
                            }),
                      }}
                    >
                      {item.done ? 'Review' : item.actionLabel}
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>

            {firstIncompleteStep && (
              <Button
                variant="contained"
                onClick={() =>
                  navigate(firstIncompleteStep.path, {
                    state: { from: location },
                  })
                }
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: BRAND_PRIMARY,
                  '&:hover': { bgcolor: '#0A2A66' },
                }}
              >
                Continue Panel Setup
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
