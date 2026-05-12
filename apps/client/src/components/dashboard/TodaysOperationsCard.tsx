import { alpha, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { TbTruckDelivery } from 'react-icons/tb'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface TodaysOperationsCardProps {
  todayOps: {
    orders: number
    pending: number
    inTransit: number
    delivered: number
  }
}

export default function TodaysOperationsCard({ todayOps }: TodaysOperationsCardProps) {
  const operations = [
    { label: 'Today Orders', value: todayOps.orders || 0, color: dashboardPalette.blue },
    { label: 'Pending', value: todayOps.pending || 0, color: dashboardPalette.amber },
    { label: 'In Transit', value: todayOps.inTransit || 0, color: '#0F766E' },
    { label: 'Delivered', value: todayOps.delivered || 0, color: dashboardPalette.green },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2.2}>
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <TbTruckDelivery size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Today's Operations
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Live order movement
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={1.5}>
          {operations.map((op) => (
            <Grid size={{ xs: 6 }} key={op.label}>
              <Box
                sx={{
                  p: 1.6,
                  bgcolor: alpha(op.color, 0.06),
                  borderRadius: '12px',
                  border: `1px solid ${alpha(op.color, 0.16)}`,
                  minHeight: 92,
                }}
              >
                <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted, fontWeight: 800 }}>
                  {op.label}
                </Typography>
                <Typography sx={{ mt: 0.8, fontSize: '1.45rem', fontWeight: 900, color: dashboardPalette.ink }}>
                  {op.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
