import { Box, Grid, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import BrandLogo from '../brand/BrandLogo'
import { brand } from '../../theme/brand'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  helperTitle: string
  helperText: string
  variant?: 'default' | 'compact'
  showChrome?: boolean
  showNavbar?: boolean
  showFooter?: boolean
  children: React.ReactNode
}

const authPalette = {
  navy: '#0D1B4D',
  orange: '#E86F00',
  text: '#111111',
  muted: '#3C465F',
  blob: '#E8F7FF',
  blobEdge: '#DDF0FC',
}

const deliveryArtwork = '/images/client-auth-delivery-van-theme.png'

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  helperTitle,
  helperText,
  variant = 'default',
  children,
}: AuthShellProps) {
  const isCompact = variant === 'compact'

  return (
    <Box
      aria-label={eyebrow}
      sx={{
        height: { xs: 'auto', lg: '100dvh' },
        minHeight: { xs: '100dvh', lg: 0 },
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: '#FFFFFF',
        color: authPalette.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
        overflowY: { xs: 'auto', lg: 'hidden' },
        p: { xs: 1, sm: 1.25, md: 1.5, lg: 1.25 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: isCompact ? 760 : 1160,
          height: { xs: 'auto', lg: 'min(640px, calc(100dvh - 24px))' },
          minHeight: { xs: 'auto', lg: 0 },
          maxHeight: { lg: 'calc(100dvh - 24px)' },
          borderRadius: { xs: '18px', md: '22px' },
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
          boxShadow: {
            xs: '0 16px 38px rgba(13, 27, 77, 0.08)',
            md: '0 26px 70px rgba(13, 27, 77, 0.1)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            zIndex: 0,
            inset: { xs: '18px -44% 18px -30%', lg: '0 4% 0 6%' },
            bgcolor: authPalette.blob,
            background: `linear-gradient(145deg, ${authPalette.blob} 0%, #F4FBFF 48%, ${authPalette.blobEdge} 100%)`,
            borderRadius: {
              xs: '42% 58% 48% 52% / 12% 16% 84% 88%',
              lg: '46% 54% 50% 50% / 16% 18% 82% 84%',
            },
            transform: { xs: 'rotate(-1.5deg)', md: 'rotate(-2deg)' },
          }}
        />

        <Grid
          container
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: 'inherit',
            minWidth: 0,
            width: '100%',
            height: { xs: 'auto', lg: '100%' },
            boxSizing: 'border-box',
            px: { xs: 1.6, sm: 2.2, md: 3, lg: 3.2 },
            py: { xs: 2, sm: 2.4, md: 2.8, lg: 2.4 },
          }}
        >
          {!isCompact && (
            <Grid
              size={{ xs: 12, lg: 6.3 }}
              sx={{
                display: 'flex',
                alignItems: { xs: 'center', lg: 'center' },
                height: { xs: 'auto', lg: '100%' },
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: { xs: 'center', lg: 'flex-start' },
                  textAlign: { xs: 'center', lg: 'left' },
                  pt: { xs: 0.4, lg: 0 },
                  pb: { xs: 1.2, lg: 0 },
                  gap: { xs: 1.8, lg: 1.4 },
                }}
              >
                <Stack
                  spacing={{ xs: 1, md: 1.1 }}
                  sx={{ width: '100%', maxWidth: 520, minWidth: 0 }}
                >
                  <Typography
                    sx={{
                      color: authPalette.navy,
                      fontSize: { xs: '1.25rem', sm: '1.85rem', md: '2.2rem', lg: '2.24rem' },
                      lineHeight: 1.16,
                      fontWeight: 800,
                      letterSpacing: 0,
                      whiteSpace: 'pre-line',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{
                      color: authPalette.muted,
                      fontSize: { xs: '0.82rem', sm: '0.93rem', md: '0.98rem' },
                      lineHeight: 1.46,
                      maxWidth: { xs: 300, sm: 460 },
                      overflowWrap: 'break-word',
                    }}
                  >
                    {subtitle}
                  </Typography>
                </Stack>

                <Box
                  component="img"
                  src={deliveryArtwork}
                  alt="Delivery van with courier team"
                  sx={{
                    width: { xs: '66%', sm: '58%', lg: '68%' },
                    maxWidth: { xs: 220, sm: 330, lg: 380 },
                    mt: { xs: 0.8, lg: 0.6 },
                    ml: { lg: 2.4 },
                    alignSelf: { xs: 'center', lg: 'flex-start' },
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                    filter: 'saturate(1.04) contrast(1.02)',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </Stack>
            </Grid>
          )}

          <Grid
            size={{ xs: 12, lg: isCompact ? 12 : 5.7 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'center', lg: 'flex-start' },
              height: { xs: 'auto', lg: '100%' },
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 'calc(100vw - 36px)', sm: isCompact ? 430 : 385, md: isCompact ? 440 : 395 },
                mx: { xs: 'auto', lg: 0 },
                pt: { xs: 0, lg: isCompact ? 0.6 : 0 },
                pb: { xs: 1, lg: 0 },
              }}
            >
              <Stack spacing={{ xs: 1, md: 1.1 }} alignItems="center" sx={{ mb: { xs: 1.15, md: 1.35 } }}>
                <BrandLogo
                  sx={{
                    width: { xs: 122, sm: 146, md: 154 },
                    filter: 'drop-shadow(0 10px 18px rgba(13, 27, 77, 0.08))',
                  }}
                />
                <Stack spacing={0.8} alignItems="center" textAlign="center">
                  <Typography
                    sx={{
                      color: authPalette.orange,
                      fontSize: { xs: '0.98rem', sm: '1.24rem', md: '1.36rem' },
                      lineHeight: 1.1,
                      fontWeight: 800,
                      letterSpacing: 0,
                      maxWidth: '100%',
                      overflowWrap: 'break-word',
                    }}
                  >
                    {helperTitle}
                  </Typography>
                  <Typography
                    sx={{
                      color: authPalette.text,
                      fontSize: { xs: '0.78rem', sm: '0.84rem', md: '0.88rem' },
                      fontWeight: 700,
                      lineHeight: 1.28,
                    }}
                  >
                    {helperText}
                  </Typography>
                </Stack>
              </Stack>

              <Box
                sx={{
                  p: { xs: 0, sm: 0.2 },
                  borderRadius: '8px',
                  bgcolor: alpha('#FFFFFF', 0.58),
                }}
              >
                {children}
              </Box>

              <Box
                component="span"
                sx={{
                  display: { xs: 'block', lg: 'none' },
                  mt: 2.5,
                  mx: 'auto',
                  width: 92,
                  height: 4,
                  borderRadius: 999,
                  bgcolor: alpha(brand.ink, 0.12),
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
