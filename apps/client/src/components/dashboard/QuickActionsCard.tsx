import { alpha, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import {
  MdAdd,
  MdCalculate,
  MdLockOutline,
  MdLocalShipping,
  MdShoppingCart,
  MdSupport,
  MdTrackChanges,
} from 'react-icons/md'
import { TbTruckDelivery } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { useMerchantReadiness } from '../../hooks/useMerchantReadiness'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

export default function QuickActionsCard() {
  const navigate = useNavigate()
  const { isReady, firstIncompleteStep } = useMerchantReadiness()

  const actions = [
    { label: 'Create Order', icon: <MdAdd size={18} />, path: '/orders/create' },
    { label: 'All Orders', icon: <MdShoppingCart size={18} />, path: '/orders/list' },
    { label: 'Rate Calculator', icon: <MdCalculate size={18} />, path: '/tools/rate_calculator' },
    { label: 'Track AWB', icon: <MdTrackChanges size={18} />, path: '/tools/order_tracking' },
    { label: 'Support', icon: <MdSupport size={18} />, path: '/support/tickets' },
    { label: 'Shipments', icon: <TbTruckDelivery size={18} />, path: '/orders/list' },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2.2}>
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <MdLocalShipping size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Quick Actions
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Frequent shipping tasks
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={1.4}>
          {actions.map((action) => {
            const locked = action.path === '/orders/create' && !isReady
            const color = locked ? dashboardPalette.amber : dashboardPalette.blue

            return (
              <Grid size={{ xs: 6 }} key={action.label}>
                <Box
                  onClick={() => navigate(locked ? firstIncompleteStep?.path || '/home' : action.path)}
                  sx={{
                    p: 1.35,
                    borderRadius: '12px',
                    border: `1px solid ${alpha(color, 0.16)}`,
                    bgcolor: locked ? alpha(color, 0.06) : dashboardPalette.tile,
                    cursor: 'pointer',
                    minHeight: 58,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color .18s ease, border-color .18s ease',
                    '&:hover': {
                      bgcolor: alpha(color, 0.08),
                      borderColor: alpha(color, 0.34),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '9px',
                        display: 'grid',
                        placeItems: 'center',
                        color,
                        bgcolor: alpha(color, 0.1),
                        flex: '0 0 auto',
                      }}
                    >
                      {locked ? <MdLockOutline size={18} /> : action.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color,
                        lineHeight: 1.2,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {locked ? 'Unlock' : action.label}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}
