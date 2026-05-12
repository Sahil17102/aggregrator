import React from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { MdLocalShipping } from 'react-icons/md'
import { dashboardCardSx, dashboardChartBase, dashboardIconSx, dashboardPalette } from './dashboardStyles'

interface CourierComparisonChartProps {
  ordersData: { courier: string; count: number }[]
  ChartComponent: React.ComponentType<{ options: unknown; series: unknown; type: string; height: number }> | null
}

export default function CourierComparisonChart({
  ordersData,
  ChartComponent,
}: CourierComparisonChartProps) {
  const topCouriers = [...ordersData].sort((a, b) => b.count - a.count).slice(0, 5)
  const courierNames = topCouriers.map((d) => d.courier.charAt(0).toUpperCase() + d.courier.slice(1))
  const ordersSeries = topCouriers.map((d) => d.count)

  const chartOptions = {
    chart: {
      ...dashboardChartBase,
      type: 'bar' as const,
      stacked: false,
    },
    colors: [dashboardPalette.blue],
    xaxis: {
      categories: courierNames,
      labels: {
        style: { colors: dashboardPalette.muted, fontSize: '12px', fontWeight: 600 },
        trim: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: dashboardPalette.muted, fontSize: '12px' },
      },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '46%',
      },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val: number) => `${val.toLocaleString()} orders` },
    },
    legend: { show: false },
    grid: {
      borderColor: dashboardPalette.line,
      strokeDashArray: 4,
    },
  }

  const chartSeries = [
    {
      name: 'Orders',
      data: ordersSeries,
    },
  ]

  return (
    <Card sx={dashboardCardSx}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
          <Box sx={dashboardIconSx(dashboardPalette.blue)}>
            <MdLocalShipping size={20} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: dashboardPalette.ink }}>
              Courier Comparison
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: dashboardPalette.muted }}>
              Top carriers by order count
            </Typography>
          </Box>
        </Stack>
        {ChartComponent && <ChartComponent options={chartOptions} series={chartSeries} type="bar" height={320} />}
      </CardContent>
    </Card>
  )
}
