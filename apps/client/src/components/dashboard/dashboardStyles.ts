import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import { brand } from '../../theme/brand'

export const dashboardPalette = {
  page: '#F5F7FB',
  surface: '#FFFFFF',
  tile: '#F8FAFC',
  ink: '#111827',
  muted: '#64748B',
  line: '#E5E7EB',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  green: '#16A34A',
  amber: '#F59E0B',
  red: '#DC2626',
}

export const dashboardCardSx = {
  height: '100%',
  borderRadius: '16px',
  border: `1px solid ${dashboardPalette.line}`,
  background: dashboardPalette.surface,
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden',
} satisfies SxProps<Theme>

export const dashboardTileSx = (color = dashboardPalette.blue) => ({
  borderRadius: '12px',
  border: `1px solid ${alpha(color, 0.16)}`,
  backgroundColor: alpha(color, 0.055),
}) satisfies SxProps<Theme>

export const dashboardIconSx = (color = dashboardPalette.blue) => ({
  width: 36,
  height: 36,
  borderRadius: '10px',
  display: 'grid',
  placeItems: 'center',
  color,
  backgroundColor: alpha(color, 0.1),
  flex: '0 0 auto',
}) satisfies SxProps<Theme>

export const dashboardButtonSx = {
  borderRadius: '10px',
  minHeight: 38,
  px: 1.8,
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 800,
  '&:hover': {
    boxShadow: 'none',
  },
} satisfies SxProps<Theme>

export const dashboardChartBase = {
  fontFamily: 'Inter, Poppins, sans-serif',
  toolbar: { show: false },
  animations: { enabled: false },
}

export const dashboardText = {
  title: brand.ink || dashboardPalette.ink,
  muted: brand.inkSoft || dashboardPalette.muted,
}
