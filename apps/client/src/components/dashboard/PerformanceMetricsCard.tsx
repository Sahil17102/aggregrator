import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import { MdAssessment } from 'react-icons/md'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface PerformanceMetricsCardProps {
  operational: {
    deliverySuccessRate: number
    ndrRate: number
    rtoRate: number
    avgDeliveryTime: number
  }
  formatPercentage: (value: number) => string
}

export default function PerformanceMetricsCard({
  operational,
  formatPercentage,
}: PerformanceMetricsCardProps) {
  const rows = [
    { label: 'Delivery Success Rate', value: operational.deliverySuccessRate || 0, color: dashboardPalette.green },
    { label: 'NDR Rate', value: operational.ndrRate || 0, color: dashboardPalette.red },
    { label: 'RTO Rate', value: operational.rtoRate || 0, color: dashboardPalette.amber },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2.2}>
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <MdAssessment size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Performance
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Operational health
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2.2}>
          {rows.map((row) => (
            <Box key={row.label}>
              <Stack direction="row" justifyContent="space-between" mb={0.8}>
                <Typography sx={{ fontSize: '0.82rem', color: dashboardPalette.muted, fontWeight: 700 }}>
                  {row.label}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: row.color }}>
                  {formatPercentage(row.value)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, row.value)}
                sx={{
                  height: 7,
                  borderRadius: 999,
                  bgcolor: '#EEF2F7',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: row.color,
                  },
                }}
              />
            </Box>
          ))}

          <Box sx={{ pt: 0.4 }}>
            <Typography sx={{ fontSize: '0.82rem', color: dashboardPalette.muted, fontWeight: 700 }}>
              Average Delivery Time
            </Typography>
            <Typography sx={{ mt: 0.4, fontSize: '1.45rem', fontWeight: 900, color: dashboardPalette.ink }}>
              {operational.avgDeliveryTime || 0} days
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
