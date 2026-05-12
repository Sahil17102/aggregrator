import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { MdDashboardCustomize, MdRefresh } from 'react-icons/md'
import { dashboardButtonSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface DashboardHeaderProps {
  isRefetching: boolean
  onRefresh: () => void
  onCustomize?: () => void
}

export default function DashboardHeader({
  isRefetching,
  onRefresh,
  onCustomize,
}: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        mb: 2.5,
        p: { xs: 2, md: 2.4 },
        borderRadius: '16px',
        border: `1px solid ${dashboardPalette.line}`,
        background: dashboardPalette.surface,
        boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={1.5}
      >
        <Stack direction="row" spacing={1.4} alignItems="center">
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <MdDashboardCustomize size={19} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.8rem' }, fontWeight: 900 }}>
              Dashboard
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: dashboardPalette.muted, fontWeight: 500 }}>
              A clean view of orders, cash flow, courier health, and action queues.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {onCustomize && (
            <Button
              onClick={onCustomize}
              variant="outlined"
              startIcon={<MdDashboardCustomize size={18} />}
              sx={{
                ...dashboardButtonSx,
                borderColor: alpha(dashboardPalette.ink, 0.12),
                color: dashboardPalette.ink,
                backgroundColor: dashboardPalette.surface,
              }}
            >
              Customize
            </Button>
          )}

          <Button
            onClick={onRefresh}
            disabled={isRefetching}
            variant="contained"
            startIcon={
              isRefetching ? (
                <CircularProgress size={14} thickness={4} sx={{ color: '#FFFFFF' }} />
              ) : (
                <MdRefresh size={18} />
              )
            }
            sx={{
              ...dashboardButtonSx,
              background: dashboardPalette.blue,
              color: '#FFFFFF',
              '&:hover': {
                background: dashboardPalette.blueDark,
                boxShadow: 'none',
              },
            }}
          >
            {isRefetching ? 'Updating' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
