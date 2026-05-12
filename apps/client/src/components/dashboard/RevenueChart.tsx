import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { MdTrendingUp } from 'react-icons/md'
import { dashboardCardSx, dashboardChartBase, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface RevenueChartProps {
  chartData: { date: string; revenue: number }[]
  ChartComponent: React.ComponentType<{ options: unknown; series: unknown; type: string; height: number }> | null
  formatCurrency: (amount: number) => string
}

export default function RevenueChart({ chartData, ChartComponent, formatCurrency }: RevenueChartProps) {
  const formatChartDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return value
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const chartOptions = {
    chart: {
      ...dashboardChartBase,
      type: 'bar' as const,
    },
    colors: [dashboardPalette.green],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '48%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData?.map((d) => formatChartDate(d.date)) || [],
      labels: { style: { colors: dashboardPalette.muted, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: dashboardPalette.muted, fontSize: '12px' },
        formatter: (val: number) => `Rs. ${(val / 1000).toFixed(1)}k`,
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val: number) => formatCurrency(val),
      },
    },
    grid: {
      borderColor: dashboardPalette.line,
      strokeDashArray: 4,
    },
  }

  const chartSeries = [
    {
      name: 'Revenue',
      data: chartData?.map((d) => d.revenue) || [],
    },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
          <Box sx={dashboardIconSx(dashboardPalette.green)}>
            <MdTrendingUp size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Revenue Trend
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Last 7 days net revenue
            </Typography>
          </Box>
        </Stack>
        {ChartComponent && <ChartComponent options={chartOptions} series={chartSeries} type="bar" height={300} />}
      </CardContent>
    </Card>
  )
}
