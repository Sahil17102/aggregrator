import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { FaChartLine } from 'react-icons/fa'
import { dashboardCardSx, dashboardChartBase, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface OrdersTrendChartProps {
  chartData: { date: string; orders: number }[]
  ChartComponent: React.ComponentType<{ options: unknown; series: unknown; type: string; height: number }> | null
}

export default function OrdersTrendChart({ chartData, ChartComponent }: OrdersTrendChartProps) {
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
      type: 'area' as const,
      sparkline: { enabled: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3,
      lineCap: 'round' as const,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.18,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
    markers: { size: 0, hover: { size: 5 } },
    colors: [dashboardPalette.blue],
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData?.map((d) => formatChartDate(d.date)) || [],
      labels: { style: { colors: dashboardPalette.muted, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: dashboardPalette.muted, fontSize: '12px' } },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val: number) => `${val} orders` },
    },
    grid: {
      borderColor: dashboardPalette.line,
      strokeDashArray: 4,
    },
  }

  const chartSeries = [
    {
      name: 'Orders',
      data: chartData?.map((d) => d.orders) || [],
    },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <FaChartLine size={17} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Orders Trend
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Last 7 days shipment volume
            </Typography>
          </Box>
        </Stack>
        {ChartComponent && (
          <ChartComponent options={chartOptions} series={chartSeries} type="area" height={300} />
        )}
      </CardContent>
    </Card>
  )
}
