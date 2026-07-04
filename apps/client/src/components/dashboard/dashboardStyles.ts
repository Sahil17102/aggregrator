import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import { brand, brandFonts } from '../../theme/brand'

export const dashboardPalette = {
  page: '#0f141b',
  surface: '#151b23',
  tile: '#0f141b',
  ink: '#f8fafc',
  muted: '#9badc3',
  line: '#2a313a',
  orange: '#ff7a17',
  orangeDark: '#E67213',
  orangeSoft: '#2b2118',
  blue: '#7657ff',
  blueDark: '#6547ea',
  green: '#35d27f',
  amber: '#F59E0B',
  red: '#ef4444',
  track: '#2a313a',
}

export const dashboardCardSx = {
  height: '100%',
  borderRadius: '16px',
  position: 'relative',
  border: `1px solid ${dashboardPalette.line}`,
  background: dashboardPalette.surface,
  boxShadow: 'none',
  overflow: 'hidden',
} satisfies SxProps<Theme>

export const dashboardTileSx = (color = dashboardPalette.orange) => ({
  borderRadius: '12px',
  border: `1px solid ${alpha(color, 0.16)}`,
  backgroundColor: alpha(color, 0.075),
}) satisfies SxProps<Theme>

export const dashboardIconSx = (color = dashboardPalette.orange) => ({
  width: 36,
  height: 36,
  borderRadius: '10px',
  display: 'grid',
  placeItems: 'center',
  color,
  background: `linear-gradient(135deg, ${alpha(color, 0.18)} 0%, ${alpha(brand.gold, 0.1)} 100%)`,
  border: `1px solid ${alpha(color, 0.16)}`,
  flex: '0 0 auto',
}) satisfies SxProps<Theme>

export const dashboardButtonSx = {
  borderRadius: '10px',
  minHeight: 38,
  px: 1.8,
  boxShadow: 'none',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    boxShadow: `0 12px 26px ${alpha(dashboardPalette.orange, 0.16)}`,
  },
} satisfies SxProps<Theme>

export const dashboardChartBase = {
  fontFamily: brandFonts.body,
  toolbar: { show: false },
  animations: { enabled: false },
}

export const dashboardText = {
  title: dashboardPalette.ink,
  muted: dashboardPalette.muted,
}
