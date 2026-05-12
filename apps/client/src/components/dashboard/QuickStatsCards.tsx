import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import {
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdLocalShipping,
  MdShoppingCart,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface QuickStatsCardsProps {
  todayOps: {
    orders: number
    pending: number
    inTransit: number
    delivered: number
  }
  financial: {
    walletBalance: number
    codRemittanceDue: number
  }
  trends: {
    ordersGrowth: number
  }
  formatCurrency: (amount: number) => string
}

export default function QuickStatsCards({
  todayOps,
  financial,
  formatCurrency,
}: QuickStatsCardsProps) {
  const navigate = useNavigate()

  const stats = [
    {
      title: 'Active Shipments',
      value: todayOps.orders?.toLocaleString() || '0',
      subtitle: `${todayOps.delivered || 0} delivered today`,
      icon: <MdShoppingCart size={19} />,
      color: dashboardPalette.blue,
      onClick: () => navigate('/orders/list'),
    },
    {
      title: 'In Transit',
      value: todayOps.inTransit?.toLocaleString() || '0',
      subtitle: `${todayOps.pending || 0} pending pickup`,
      icon: <MdLocalShipping size={19} />,
      color: '#0F766E',
      onClick: () => navigate('/orders/list'),
    },
    {
      title: 'Wallet Funds',
      value: formatCurrency(financial.walletBalance || 0),
      subtitle: financial.walletBalance < 500 ? 'Recharge required' : 'Sufficient funds',
      icon: <MdAccountBalanceWallet size={19} />,
      color: dashboardPalette.amber,
      onClick: () => navigate('/billing/wallet_transactions'),
    },
    {
      title: 'COD Remittance',
      value: formatCurrency(financial.codRemittanceDue || 0),
      subtitle: 'Awaiting bank transfer',
      icon: <MdAccountBalance size={19} />,
      color: '#475569',
      onClick: () => navigate('/cod-remittance'),
    },
  ]

  return (
    <Grid container spacing={2} mb={2.5}>
      {stats.map((stat) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
          <Card
            onClick={stat.onClick}
            sx={{
              ...dashboardCardSx,
              cursor: 'pointer',
              transition: 'border-color .18s ease, box-shadow .18s ease',
              '&:hover': {
                borderColor: stat.color,
                boxShadow: '0 16px 36px rgba(15,23,42,0.09)',
              },
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Stack spacing={1.6}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: dashboardPalette.ink }}>
                    {stat.title}
                  </Typography>
                  <Box sx={dashboardIconSx(stat.color)}>{stat.icon}</Box>
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.45rem', md: '1.65rem' },
                      fontWeight: 900,
                      color: dashboardPalette.ink,
                      lineHeight: 1.05,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      color:
                        stat.subtitle.includes('Recharge') || stat.subtitle.includes('pending')
                          ? dashboardPalette.red
                          : dashboardPalette.green,
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      mt: 0.6,
                    }}
                  >
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
