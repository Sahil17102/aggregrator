import type React from 'react'
import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { MdKeyboardReturn, MdNotificationsActive } from 'react-icons/md'
import { TbAlertTriangle, TbInvoice } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface ActionItemsCardProps {
  actions: {
    ndrCount: number
    rtoCount: number
    pendingInvoices: number
    pendingInvoiceAmount: number
  }
  formatCurrency: (amount: number) => string
}

export default function ActionItemsCard({ actions, formatCurrency }: ActionItemsCardProps) {
  const navigate = useNavigate()

  if (actions.ndrCount === 0 && actions.rtoCount === 0 && actions.pendingInvoices === 0) return null

  const items = [
    actions.ndrCount > 0
      ? {
          title: `${actions.ndrCount} NDR Pending`,
          subtitle: 'Review failed attempts',
          icon: <TbAlertTriangle size={18} />,
          color: dashboardPalette.red,
          path: '/ops/ndr',
        }
      : null,
    actions.rtoCount > 0
      ? {
          title: `${actions.rtoCount} RTO Cases`,
          subtitle: 'Manage return flow',
          icon: <MdKeyboardReturn size={18} />,
          color: dashboardPalette.amber,
          path: '/ops/rto',
        }
      : null,
    actions.pendingInvoices > 0
      ? {
          title: `${actions.pendingInvoices} Invoices`,
          subtitle: `Due: ${formatCurrency(actions.pendingInvoiceAmount || 0)}`,
          icon: <TbInvoice size={18} />,
          color: dashboardPalette.blue,
          path: '/billing/invoice_management',
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string
    subtitle: string
    icon: React.ReactNode
    color: string
    path: string
  }>

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2.2}>
          <Box sx={dashboardIconSx(dashboardPalette.red)}>
            <MdNotificationsActive size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Action Required
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Queues waiting on you
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.3}>
          {items.map((item) => (
            <Box
              key={item.title}
              onClick={() => navigate(item.path)}
              sx={{
                p: 1.45,
                borderRadius: '12px',
                border: `1px solid ${alpha(item.color, 0.2)}`,
                bgcolor: alpha(item.color, 0.055),
                cursor: 'pointer',
                transition: 'background-color .18s ease, border-color .18s ease',
                '&:hover': {
                  bgcolor: alpha(item.color, 0.085),
                  borderColor: alpha(item.color, 0.36),
                },
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="space-between">
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.84rem', color: dashboardPalette.ink, fontWeight: 800 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: dashboardPalette.muted, fontWeight: 500, mt: 0.2 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
                <Box sx={{ color: item.color, display: 'flex', flex: '0 0 auto' }}>{item.icon}</Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
