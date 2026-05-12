import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { MdMonetizationOn } from 'react-icons/md'
import { dashboardCardSx, dashboardChartBase, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface RevenueByTypeChartProps {
  chartData: { type: string; revenue: number }[]
  ChartComponent: React.ComponentType<{ options: unknown; series: unknown; type: string; height: number }> | null
  formatCurrency: (amount: number) => string
}

export default function RevenueByTypeChart({
  chartData,
  ChartComponent,
  formatCurrency,
}: RevenueByTypeChartProps) {
  const chartOptions = {
    chart: {
      ...dashboardChartBase,
      type: 'bar' as const,
      stacked: false,
    },
    colors: [dashboardPalette.green],
    xaxis: {
      categories: chartData?.map((d) => d.type.charAt(0).toUpperCase() + d.type.slice(1)) || [],
      labels: {
        style: { colors: dashboardPalette.muted, fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: dashboardPalette.muted, fontSize: '12px' },
        formatter: (val: number) => `Rs. ${(val / 1000).toFixed(1)}k`,
      },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '48%',
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
            <MdMonetizationOn size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Revenue by Type
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Split by payment mode
            </Typography>
          </Box>
        </Stack>
        {ChartComponent && <ChartComponent options={chartOptions} series={chartSeries} type="bar" height={300} />}
      </CardContent>
    </Card>
  )
}
