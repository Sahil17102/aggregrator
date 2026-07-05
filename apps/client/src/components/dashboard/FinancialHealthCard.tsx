import { alpha, Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { MdAccountBalanceWallet, MdArrowForward } from 'react-icons/md'
import { TbCurrencyRupee } from 'react-icons/tb'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface FinancialHealthCardProps {
  financial: {
    walletBalance: number
    codRemittanceDue: number
    codRemittanceCredited: number
  }
  trends: Record<string, unknown>
  formatCurrency: (amount: number) => string
}

export default function FinancialHealthCard({
  financial,
  formatCurrency,
}: FinancialHealthCardProps) {
  const navigate = useNavigate()

  const isHealthy = financial.walletBalance > 1000 && financial.codRemittanceDue < financial.walletBalance * 2
  const isLowBalance = financial.walletBalance < 500
  const statusColor = isLowBalance ? dashboardPalette.red : isHealthy ? dashboardPalette.green : dashboardPalette.amber
  const healthScore = isHealthy ? 90 : isLowBalance ? 40 : 70

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.4}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={dashboardIconSx(statusColor)}>
              <TbCurrencyRupee size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
                Financial Health
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
                Wallet and COD position
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={isHealthy ? 'Healthy' : isLowBalance ? 'Low Balance' : 'Watch'}
            size="small"
            sx={{
              height: 26,
              borderRadius: '8px',
              fontWeight: 800,
              color: statusColor,
              bgcolor: alpha(statusColor, 0.1),
            }}
          />
        </Stack>

        <Box sx={{ mb: 2.2 }}>
          <Stack direction="row" justifyContent="space-between" mb={0.8}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: dashboardPalette.muted }}>
              Health Score
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: statusColor }}>
              {healthScore}/100
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={healthScore}
            sx={{
              height: 7,
              borderRadius: 999,
              bgcolor: dashboardPalette.track,
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                bgcolor: statusColor,
              },
            }}
          />
        </Box>

        <Stack spacing={1.4}>
          <Box
            sx={{
              p: 1.6,
              borderRadius: '12px',
              bgcolor: alpha(dashboardPalette.blue, 0.055),
              border: `1px solid ${alpha(dashboardPalette.blue, 0.16)}`,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/billing/wallet_transactions')}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={0.7}>
                  <MdAccountBalanceWallet size={17} color={dashboardPalette.blue} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: dashboardPalette.muted }}>
                    Wallet Balance
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: isLowBalance ? dashboardPalette.red : dashboardPalette.ink }}>
                  {formatCurrency(financial.walletBalance || 0)}
                </Typography>
              </Box>
              <MdArrowForward size={19} color={dashboardPalette.blue} />
            </Stack>
          </Box>

          <Box
            sx={{
              p: 1.6,
              borderRadius: '12px',
              bgcolor: alpha(dashboardPalette.amber, 0.065),
              border: `1px solid ${alpha(dashboardPalette.amber, 0.18)}`,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/cod-remittance')}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: dashboardPalette.muted, mb: 0.7 }}>
                  COD Remittance Due
                </Typography>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: dashboardPalette.ink }}>
                  {formatCurrency(financial.codRemittanceDue || 0)}
                </Typography>
                {financial.codRemittanceCredited > 0 && (
                  <Typography sx={{ fontSize: '0.74rem', color: dashboardPalette.muted, mt: 0.4 }}>
                    Settled this month: {formatCurrency(financial.codRemittanceCredited || 0)}
                  </Typography>
                )}
              </Box>
              <MdArrowForward size={19} color={dashboardPalette.amber} />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
