import { alpha, Box, Button, LinearProgress, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TbAlertTriangle,
  TbArrowRight,
  TbCalculator,
  TbChartBar,
  TbCheck,
  TbCreditCard,
  TbCube,
  TbPackage,
  TbPlus,
  TbRefresh,
  TbShieldCheck,
  TbTruckDelivery,
  TbWallet,
  TbX,
} from 'react-icons/tb'
import { useAuth } from '../../context/auth/AuthContext'
import { useMerchantReadiness } from '../../hooks/useMerchantReadiness'

const PAGE_BG = '#0f141b'
const CARD_BG = '#151b23'
const CARD_DARK = '#0f141b'
const BORDER = '#2a313a'
const TEXT = '#f8fafc'
const MUTED = '#9badc3'
const DIM = '#7f8fa6'
const PURPLE = '#7657ff'
const ORANGE = '#ff7a17'
const BLUE = '#3082ff'
const RED = '#ef4444'
const GREEN = '#35d27f'

const cardSx = {
  border: `1px solid ${BORDER}`,
  bgcolor: CARD_BG,
  borderRadius: 3,
}

export default function Home() {
  const navigate = useNavigate()
  const { walletBalance, user } = useAuth()
  const { progress } = useMerchantReadiness()
  const [showKycBanner, setShowKycBanner] = useState(true)

  const displayName = user?.companyInfo?.contactPerson || user?.name || 'Sahil Mittal'
  const formattedWalletBalance = `\u20B9${Number(walletBalance ?? 0).toLocaleString('en-IN')}`

  const statCards = useMemo(
    () => [
      { label: 'Orders Today', value: '0', icon: <TbCube />, color: PURPLE },
      { label: 'In Transit', value: '0', icon: <TbTruckDelivery />, color: BLUE },
      { label: 'NDR Pending', value: '0', icon: <TbAlertTriangle />, color: RED },
      { label: 'RTO Active', value: '0', icon: <TbRefresh />, color: ORANGE },
      {
        label: 'Wallet',
        value: formattedWalletBalance,
        icon: <TbWallet />,
        color: PURPLE,
        action: '+ Recharge',
      },
    ],
    [walletBalance],
  )

  const setupSteps = [
    { title: 'Complete KYC', text: 'Verify identity to unlock all fea...', done: false },
    { title: 'Company Profile', text: 'Add business details', done: false },
    { title: 'Bank Account', text: 'Required for COD payouts', done: false },
    { title: 'Pickup Address', text: 'Set up warehouse location', done: false },
    { title: 'Label Config', text: 'Customize shipping labels', done: true },
  ]

  const quickActions = [
    { title: 'Create Order', text: 'Ship a new package', icon: <TbPlus />, color: PURPLE, path: '/orders/create' },
    { title: 'All Orders', text: 'View all shipments', icon: <TbTruckDelivery />, color: BLUE, path: '/orders/list' },
    { title: 'NDR Actions', text: 'Handle failed deliveries', icon: <TbRefresh />, color: RED, path: '/ops/ndr' },
    { title: 'COD Remittance', text: 'Track COD payouts', icon: <TbCreditCard />, color: '#d99b1c', path: '/cod-remittance' },
    { title: 'Rate Calculator', text: 'Compare courier rates', icon: <TbCalculator />, color: '#00a976', path: '/tools/rate_calculator' },
    { title: 'Analytics', text: 'Shipping insights', icon: <TbChartBar />, color: PURPLE, path: '/dashboard' },
  ]

  return (
    <Box sx={{ bgcolor: PAGE_BG, color: TEXT, minHeight: '100%', pb: 5 }}>
      <Stack spacing={3}>
        {showKycBanner ? (
          <Box
            sx={{
              ...cardSx,
              minHeight: 92,
              px: { xs: 2, md: 3.2 },
              py: 2,
              pr: { xs: 5, md: 3.2 },
              borderColor: alpha('#ffffff', 0.86),
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
              gap: 2,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ color: ORANGE, display: 'grid', placeItems: 'center' }}>
                <TbShieldCheck size={22} />
              </Box>
              <Box>
                <Typography sx={{ color: ORANGE, fontWeight: 900, fontSize: '1.05rem' }}>
                  Complete Your KYC
                </Typography>
                <Typography sx={{ color: DIM, fontWeight: 600 }}>
                  Verify your identity to unlock COD orders, wallet withdrawals, and more.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              endIcon={<TbArrowRight />}
              onClick={() => navigate('/profile/kyc_details')}
              sx={{
                justifySelf: { xs: 'start', md: 'end' },
                bgcolor: PURPLE,
                color: '#ffffff',
                borderRadius: 2,
                px: 2.6,
                py: 1.1,
                fontWeight: 900,
                textTransform: 'none',
                '&:hover': { bgcolor: '#6547ea' },
              }}
            >
              Start KYC
            </Button>
            <Box
              component="button"
              type="button"
              aria-label="Dismiss KYC reminder"
              onClick={() => setShowKycBanner(false)}
              sx={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 26,
                height: 26,
                border: 0,
                borderRadius: '50%',
                bgcolor: 'transparent',
                color: DIM,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                '&:hover': { color: TEXT, bgcolor: alpha('#ffffff', 0.07) },
              }}
            >
              <TbX size={18} />
            </Box>
          </Box>
        ) : null}

        <Box>
          <Typography sx={{ color: TEXT, fontSize: '1.55rem', fontWeight: 900 }}>
            Good afternoon, {displayName}!
          </Typography>
          <Typography sx={{ color: MUTED, mt: 0.4, fontSize: '1rem' }}>
            Here's your daily overview.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' },
            gap: 2,
          }}
        >
          {statCards.map((item) => (
            <Box
              key={item.label}
              sx={{
                ...cardSx,
                minHeight: 112,
                p: 2,
                position: 'relative',
                overflow: 'hidden',
                borderColor: item.label === 'Wallet' ? alpha('#ffffff', 0.86) : BORDER,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: item.color,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ color: DIM, fontWeight: 700 }}>{item.label}</Typography>
                  <Typography sx={{ color: TEXT, fontSize: '1.75rem', lineHeight: 1.1, fontWeight: 900 }}>
                    {item.value}
                  </Typography>
                  {item.action ? (
                    <Typography sx={{ color: PURPLE, mt: 0.8, fontWeight: 800, fontSize: '0.86rem' }}>
                      {item.action}
                    </Typography>
                  ) : null}
                </Box>
                <Box sx={{ color: item.color, '& svg': { width: 22, height: 22 } }}>{item.icon}</Box>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box sx={{ ...cardSx, borderColor: alpha('#ffffff', 0.86), p: { xs: 2, md: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TbShieldCheck color={PURPLE} />
              <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: '1.1rem' }}>
                Complete Your Profile
              </Typography>
            </Stack>
            <Typography sx={{ color: PURPLE, fontWeight: 900 }}>{progress || 20}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress || 20}
            sx={{
              height: 7,
              borderRadius: 999,
              bgcolor: '#2a313a',
              mb: 2.4,
              '& .MuiLinearProgress-bar': {
                borderRadius: 999,
                background: `linear-gradient(90deg, ${PURPLE}, ${ORANGE})`,
              },
            }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
              gap: 1.2,
            }}
          >
            {setupSteps.map((step) => (
              <Box
                key={step.title}
                sx={{
                  minHeight: 66,
                  p: 1.6,
                  borderRadius: 2,
                  border: `1px solid ${step.done ? alpha('#ffffff', 0.86) : BORDER}`,
                  bgcolor: CARD_BG,
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 25,
                    height: 25,
                    borderRadius: '50%',
                    border: `2px solid ${step.done ? GREEN : '#2d3744'}`,
                    bgcolor: step.done ? GREEN : 'transparent',
                    color: '#ffffff',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {step.done ? <TbCheck size={15} strokeWidth={3} /> : null}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: step.done ? alpha(TEXT, 0.6) : TEXT,
                      fontWeight: 850,
                      textDecoration: step.done ? 'line-through' : 'none',
                    }}
                    noWrap
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: MUTED, fontSize: '0.78rem' }} noWrap>
                    {step.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.9fr 1.85fr' }, gap: 2.2 }}>
          <Box sx={{ ...cardSx, minHeight: 258, p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.4} alignItems="center">
                <TbChartBar color={PURPLE} />
                <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: '1.08rem' }}>
                  Orders by Status
                </Typography>
              </Stack>
              <Typography sx={{ color: MUTED }}>0 total</Typography>
            </Stack>
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 178 }}>
              <TbPackage size={32} color={MUTED} />
              <Typography sx={{ color: MUTED, mt: 1.3 }}>No orders yet</Typography>
            </Stack>
          </Box>

          <Box sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: '1.08rem', mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.2 }}>
              {quickActions.map((item) => (
                <Box
                  key={item.title}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 76,
                    p: 1.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${BORDER}`,
                    bgcolor: CARD_DARK,
                    cursor: 'pointer',
                    '&:hover': { borderColor: alpha(item.color, 0.6), transform: 'translateY(-1px)' },
                    transition: 'all 0.16s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(item.color, 0.13),
                      color: item.color,
                      flexShrink: 0,
                      '& svg': { width: 22, height: 22 },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: '1.02rem' }} noWrap>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: MUTED, fontSize: '0.84rem' }} noWrap>
                      {item.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ ...cardSx, minHeight: 386, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: '1.08rem' }}>
              Recent Orders
            </Typography>
            <Typography onClick={() => navigate('/orders/list')} sx={{ color: PURPLE, fontWeight: 800, cursor: 'pointer' }}>
              View all {'\u2192'}
            </Typography>
          </Stack>
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <TbCube size={32} color={PURPLE} />
            <Typography sx={{ color: TEXT, mt: 2, fontWeight: 900, fontSize: '1.05rem' }}>
              No orders yet
            </Typography>
            <Typography sx={{ color: MUTED, mt: 0.7 }}>Create your first order to start shipping.</Typography>
            <Button
              variant="contained"
              startIcon={<TbPlus />}
              onClick={() => navigate('/orders/create')}
              sx={{
                mt: 2.2,
                bgcolor: PURPLE,
                color: '#ffffff',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 900,
                px: 2.6,
                '&:hover': { bgcolor: '#6547ea' },
              }}
            >
              Create Order
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
