import { alpha, type PaletteMode, type SxProps, type Theme } from '@mui/material/styles'
import { brand, brandFonts } from '../../theme/brand'

export const dashboardPalette = {
  page: 'var(--dashboard-page)',
  surface: 'var(--dashboard-surface)',
  tile: 'var(--dashboard-tile)',
  ink: 'var(--dashboard-ink)',
  muted: 'var(--dashboard-muted)',
  line: 'var(--dashboard-line)',
  orange: '#ff7a17',
  orangeDark: '#E67213',
  orangeSoft: '#2b2118',
  blue: '#7657ff',
  blueDark: '#6547ea',
  green: '#35d27f',
  amber: '#F59E0B',
  red: '#ef4444',
  track: 'var(--dashboard-track)',
}

export const getDashboardCssVars = (mode: PaletteMode) => {
  const isDark = mode === 'dark'

  return {
    '--dashboard-page': isDark ? '#0f141b' : '#f6f8fc',
    '--dashboard-surface': isDark ? '#151b23' : '#ffffff',
    '--dashboard-tile': isDark ? '#0f141b' : '#f8fafc',
    '--dashboard-ink': isDark ? '#f8fafc' : '#11182d',
    '--dashboard-muted': isDark ? '#9badc3' : '#64748b',
    '--dashboard-line': isDark ? '#2a313a' : 'rgba(15, 23, 42, 0.1)',
    '--dashboard-track': isDark ? '#2a313a' : '#e8edf5',
  } satisfies SxProps<Theme>
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
