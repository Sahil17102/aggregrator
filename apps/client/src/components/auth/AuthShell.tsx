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
        minHeight: '100dvh',
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: '#FFFFFF',
        color: authPalette.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: { xs: 'auto', lg: 'hidden' },
        p: { xs: 1, sm: 1.5, md: 2, lg: 1.6 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: isCompact ? 840 : 1320,
          minHeight: isCompact
            ? { xs: 'auto', md: 'min(680px, calc(100dvh - 28px))' }
            : { xs: 'auto', lg: 'min(720px, calc(100dvh - 28px))' },
          maxHeight: { lg: 'calc(100dvh - 28px)' },
          borderRadius: { xs: '20px', md: '28px' },
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
            boxSizing: 'border-box',
            px: { xs: 2, sm: 2.8, md: 4, lg: 5.4 },
            py: { xs: 2.4, sm: 3, md: 3.6, lg: 3.8 },
          }}
        >
          {!isCompact && (
            <Grid
              size={{ xs: 12, lg: 6.6 }}
              sx={{
                display: 'flex',
                alignItems: { xs: 'center', lg: 'stretch' },
                minHeight: { xs: 'auto', lg: 'min(620px, calc(100dvh - 104px))' },
                minWidth: 0,
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'center', lg: 'flex-start' },
                  textAlign: { xs: 'center', lg: 'left' },
                  pt: { xs: 0.6, lg: 4.2 },
                  pb: { xs: 2, lg: 1.5 },
                }}
              >
                <Stack
                  spacing={{ xs: 1.2, md: 1.45 }}
                  sx={{ width: '100%', maxWidth: 610, minWidth: 0 }}
                >
                  <Typography
                    sx={{
                      color: authPalette.navy,
                      fontSize: { xs: '1.35rem', sm: '2.1rem', md: '2.45rem', lg: '2.55rem' },
                      lineHeight: 1.22,
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
                      fontSize: { xs: '0.86rem', sm: '1rem', md: '1.06rem' },
                      lineHeight: 1.58,
                      maxWidth: { xs: 310, sm: 500 },
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
                    width: { xs: '78%', sm: '70%', lg: '80%' },
                    maxWidth: { xs: 250, sm: 430, lg: 520 },
                    mt: { xs: 2.2, lg: 1 },
                    ml: { lg: 1 },
                    alignSelf: { xs: 'center', lg: 'center' },
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
            size={{ xs: 12, lg: isCompact ? 12 : 5.4 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: 'auto', lg: 'min(620px, calc(100dvh - 104px))' },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: { xs: 'calc(100vw - 48px)', sm: isCompact ? 460 : 440, md: isCompact ? 480 : 460 },
                mx: 'auto',
                pt: { xs: 0, lg: isCompact ? 0.6 : 0 },
                pb: { xs: 1, lg: 0 },
              }}
            >
              <Stack spacing={{ xs: 1.45, md: 1.8 }} alignItems="center" sx={{ mb: { xs: 1.8, md: 2.1 } }}>
                <BrandLogo
                  sx={{
                    width: { xs: 132, sm: 168, md: 188 },
                    filter: 'drop-shadow(0 10px 18px rgba(13, 27, 77, 0.08))',
                  }}
                />
                <Stack spacing={0.8} alignItems="center" textAlign="center">
                  <Typography
                    sx={{
                      color: authPalette.orange,
                      fontSize: { xs: '1.02rem', sm: '1.52rem', md: '1.78rem' },
                      lineHeight: 1.18,
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
                      fontSize: { xs: '0.86rem', sm: '0.96rem', md: '1.02rem' },
                      fontWeight: 700,
                      lineHeight: 1.38,
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
