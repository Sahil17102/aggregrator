import React from 'react'
import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { MdCheckCircle, MdInfo, MdLightbulb, MdTrendingDown, MdTrendingUp, MdWarning } from 'react-icons/md'
import { dashboardCardSx, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface InsightsCardProps {
  operational: {
    deliverySuccessRate: number
    ndrRate: number
    rtoRate: number
    avgDeliveryTime: number
  }
  trends: {
    ordersGrowth: number
    revenueGrowth: number
  }
  actions: {
    ndrCount: number
    rtoCount: number
    weightDiscrepancyCount: number
  }
}

type InsightType = 'good' | 'warning' | 'notice'

export default function InsightsCard({ operational, trends, actions }: InsightsCardProps) {
  const insights: Array<{
    type: InsightType
    message: string
    icon: React.ReactNode
  }> = []

  if (operational.deliverySuccessRate >= 90) {
    insights.push({
      type: 'good',
      message: `Delivery success is strong at ${operational.deliverySuccessRate}%.`,
      icon: <MdCheckCircle size={18} />,
    })
  } else if (operational.deliverySuccessRate < 75) {
    insights.push({
      type: 'warning',
      message: `Delivery success dropped to ${operational.deliverySuccessRate}%. Prioritize interventions.`,
      icon: <MdWarning size={18} />,
    })
  }

  if (trends.ordersGrowth > 0) {
    insights.push({
      type: 'good',
      message: `Orders are growing by ${trends.ordersGrowth}% vs previous week.`,
      icon: <MdTrendingUp size={18} />,
    })
  } else if (trends.ordersGrowth < 0) {
    insights.push({
      type: 'warning',
      message: `Orders are down ${Math.abs(trends.ordersGrowth)}% this week.`,
      icon: <MdTrendingDown size={18} />,
    })
  }

  if (actions.ndrCount > 0 || actions.rtoCount > 0) {
    insights.push({
      type: 'notice',
      message: `${actions.ndrCount} NDR and ${actions.rtoCount} RTO orders need action.`,
      icon: <MdInfo size={18} />,
    })
  }

  if (operational.avgDeliveryTime > 7) {
    insights.push({
      type: 'warning',
      message: `Average delivery time is ${operational.avgDeliveryTime} days. Consider faster lanes.`,
      icon: <MdWarning size={18} />,
    })
  }

  const palette: Record<InsightType, { bg: string; border: string; color: string }> = {
    good: {
      bg: alpha(dashboardPalette.green, 0.07),
      border: alpha(dashboardPalette.green, 0.2),
      color: dashboardPalette.green,
    },
    warning: {
      bg: alpha(dashboardPalette.red, 0.07),
      border: alpha(dashboardPalette.red, 0.2),
      color: dashboardPalette.red,
    },
    notice: {
      bg: alpha(dashboardPalette.blue, 0.06),
      border: alpha(dashboardPalette.blue, 0.2),
      color: dashboardPalette.blue,
    },
  }

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2.2}>
          <Box sx={dashboardIconSx(dashboardPalette.amber)}>
            <MdLightbulb size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Performance Insights
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Signals that need attention
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.3}>
          {insights.slice(0, 4).map((insight, idx) => (
            <Box
              key={idx}
              sx={{
                p: 1.35,
                borderRadius: '12px',
                border: `1px solid ${palette[insight.type].border}`,
                bgcolor: palette[insight.type].bg,
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="flex-start">
                <Box sx={{ color: palette[insight.type].color, mt: 0.2 }}>{insight.icon}</Box>
                <Typography sx={{ fontSize: '0.82rem', color: dashboardPalette.ink, fontWeight: 600, lineHeight: 1.45 }}>
                  {insight.message}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
