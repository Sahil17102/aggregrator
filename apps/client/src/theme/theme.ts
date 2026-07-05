import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'
import { brand, brandFonts, brandGradients } from './brand'

export const BRAND_NAVY = brand.ink
export const BRAND_PLUM = brand.ink
export const BRAND_YELLOW = brand.gold
export const BRAND_BLUE = brand.sky
export const TEXT = brand.inkSoft
export const BRAND_LIGHT_NAVY = alpha(brand.ink, 0.12)
export const BRAND_PURPLE = brand.ink

export const createAppTheme = (mode: PaletteMode = 'light') => {
  const isDark = mode === 'dark'
  const backgroundDefault = isDark ? '#0f141b' : brand.page
  const backgroundPaper = isDark ? '#151b23' : brand.surface
  const backgroundRaised = isDark ? '#1b2430' : '#FFFFFF'
  const textPrimary = isDark ? '#f8fafc' : brand.ink
  const textSecondary = isDark ? '#93a4ba' : brand.inkSoft
  const divider = isDark ? alpha('#f8fafc', 0.1) : alpha(brand.ink, 0.08)

  return createTheme({
  breakpoints: {
    values: {
      xs: 300,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode,
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    primary: {
      main: brand.accent,
      light: '#FFC58F',
      dark: '#D96400',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brand.ink,
      light: brand.sky,
      dark: '#07133A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: brand.danger,
      light: '#FCA5A5',
      dark: '#991B1B',
    },
    warning: {
      main: brand.warning,
      light: '#FDE7C5',
      dark: '#B45309',
    },
    info: {
      main: '#60A5FA',
      light: '#D4F6FF',
      dark: '#1D4ED8',
    },
    success: {
      main: brand.success,
      light: '#D6F5EC',
      dark: '#1F7F68',
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: alpha(textSecondary, 0.58),
    },
    divider,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: brandFonts.body,
    h1: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.04,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 700,
      fontSize: '2.35rem',
      lineHeight: 1.08,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 700,
      fontSize: '1.85rem',
      lineHeight: 1.12,
      letterSpacing: 0,
    },
    h4: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 600,
      fontSize: '1.55rem',
      lineHeight: 1.12,
    },
    h5: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 600,
      fontSize: '1.24rem',
      lineHeight: 1.16,
    },
    h6: {
      fontFamily: brandFonts.display,
      color: textPrimary,
      fontWeight: 600,
      fontSize: '1.04rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      color: textPrimary,
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle2: {
      color: textSecondary,
      fontWeight: 500,
      fontSize: '0.84rem',
      letterSpacing: 0,
    },
    body1: {
      color: textPrimary,
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.62,
    },
    body2: {
      color: textSecondary,
      fontWeight: 400,
      fontSize: '0.92rem',
      lineHeight: 1.58,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: backgroundDefault,
          backgroundImage: isDark ? 'none' : brandGradients.page,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          '@media (hover: none), (pointer: coarse), (max-width: 899.98px)': {
            backgroundAttachment: 'scroll',
          },
          color: textPrimary,
          colorScheme: mode,
          fontFamily: brandFonts.body,
          fontWeight: 400,
          scrollbarColor: `${isDark ? '#3a4350' : '#94a3b8'} ${backgroundDefault}`,
        },
        html: {
          backgroundColor: backgroundDefault,
          colorScheme: mode,
        },
        '#root': {
          minHeight: '100vh',
          backgroundColor: backgroundDefault,
          color: textPrimary,
        },
        ...(isDark
          ? {
              '[data-client-theme="dark"] .MuiCard-root, [data-client-theme="dark"] .MuiPaper-root, [data-client-theme="dark"] .MuiAccordion-root': {
                backgroundColor: `${backgroundPaper} !important`,
                backgroundImage: 'none !important',
                color: `${textPrimary} !important`,
                borderColor: `${divider} !important`,
              },
              '[data-client-theme="dark"] .MuiCardContent-root, [data-client-theme="dark"] .MuiDialogContent-root, [data-client-theme="dark"] .MuiDrawer-paper, [data-client-theme="dark"] .MuiPopover-paper, [data-client-theme="dark"] .MuiMenu-paper': {
                backgroundColor: `${backgroundPaper} !important`,
                backgroundImage: 'none !important',
                color: `${textPrimary} !important`,
              },
              '[data-client-theme="dark"] .MuiTableContainer-root, [data-client-theme="dark"] .MuiTable-root': {
                backgroundColor: `${backgroundDefault} !important`,
                color: `${textPrimary} !important`,
              },
              '[data-client-theme="dark"] .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: `${backgroundRaised} !important`,
                color: `${textPrimary} !important`,
                borderColor: `${divider} !important`,
              },
              '[data-client-theme="dark"] .MuiTableBody-root .MuiTableRow-root, [data-client-theme="dark"] .MuiTableBody-root .MuiTableCell-root': {
                backgroundColor: `${backgroundPaper} !important`,
                color: `${textPrimary} !important`,
                borderColor: `${divider} !important`,
              },
              '[data-client-theme="dark"] .MuiTableBody-root .MuiTableRow-root:nth-of-type(even), [data-client-theme="dark"] .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
                backgroundColor: `${backgroundRaised} !important`,
              },
              '[data-client-theme="dark"] .MuiTablePagination-root': {
                backgroundColor: `${backgroundPaper} !important`,
                color: `${textPrimary} !important`,
                borderColor: `${divider} !important`,
              },
              '[data-client-theme="dark"] .MuiOutlinedInput-root, [data-client-theme="dark"] .MuiInputBase-root': {
                backgroundColor: `${backgroundDefault} !important`,
                backgroundImage: 'none !important',
                color: `${textPrimary} !important`,
              },
              '[data-client-theme="dark"] .MuiOutlinedInput-notchedOutline': {
                borderColor: `${divider} !important`,
              },
              '[data-client-theme="dark"] .MuiInputBase-input, [data-client-theme="dark"] .MuiSelect-select': {
                color: `${textPrimary} !important`,
              },
              '[data-client-theme="dark"] .MuiFormLabel-root, [data-client-theme="dark"] .MuiFormHelperText-root, [data-client-theme="dark"] .MuiTypography-colorTextSecondary': {
                color: `${textSecondary} !important`,
              },
              '[data-client-theme="dark"] .MuiDivider-root': {
                borderColor: `${divider} !important`,
              },
            }
          : {}),
        '::selection': {
          backgroundColor: isDark ? alpha(brand.accent, 0.44) : alpha(brand.sky, 0.92),
          color: textPrimary,
        },
        '.MuiButton-root': {
          borderRadius: '8px !important',
          minHeight: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.MuiCard-root': {
          borderRadius: '16px !important',
        },
        '.MuiPaper-root': {
          borderRadius: '12px',
        },
        '.MuiIconButton-root': {
          borderRadius: '8px',
        },
        'option, optgroup': {
          backgroundColor: backgroundPaper,
          color: textPrimary,
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: backgroundDefault,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: isDark ? '#3a4350' : '#94a3b8',
          borderColor: backgroundDefault,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          letterSpacing: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 14,
          boxShadow: isDark ? '0 14px 34px rgba(0, 0, 0, 0.18)' : '0 14px 34px rgba(15, 23, 42, 0.06)',
          border: `1px solid ${divider}`,
          background: backgroundPaper,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          flexGrow: 1,
          backgroundColor: isDark ? backgroundPaper : undefined,
          color: textPrimary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: isDark ? backgroundPaper : brandGradients.surface,
          color: textPrimary,
          borderColor: divider,
          borderRadius: 14,
        },
        elevation1: {
          boxShadow: '0 18px 38px rgba(15, 44, 67, 0.06)',
        },
        elevation4: {
          boxShadow: brand.shadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 18px',
          fontSize: '0.86rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background-color .18s ease, border-color .18s ease, color .18s ease',
        },
        containedPrimary: {
          background: brandGradients.button,
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            background: brandGradients.button,
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: brand.ink,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#163E59',
          },
        },
        outlined: {
          borderColor: alpha(brand.ink, 0.14),
          color: textPrimary,
          backgroundColor: isDark ? alpha('#ffffff', 0.04) : alpha('#FFFFFF', 0.78),
          '&:hover': {
            borderColor: alpha(brand.ink, 0.28),
            backgroundColor: isDark ? alpha('#ffffff', 0.08) : '#FFFFFF',
          },
        },
        text: {
          color: textPrimary,
          '&:hover': {
            backgroundColor: isDark ? alpha('#ffffff', 0.08) : alpha('#FFFFFF', 0.68),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: isDark ? alpha('#0f141b', 0.88) : alpha('#FFFFFF', 0.88),
            '& fieldset': {
              borderColor: alpha(brand.ink, 0.12),
            },
            '&:hover fieldset': {
              borderColor: alpha(brand.ink, 0.24),
            },
            '&.Mui-focused fieldset': {
              borderColor: isDark ? alpha('#fff', 0.48) : brand.ink,
            },
          },
          '& .MuiInputLabel-root': {
            color: textSecondary,
            fontWeight: 500,
            '&.Mui-focused': {
              color: textPrimary,
            },
          },
          '& .MuiOutlinedInput-input': {
            color: textPrimary,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaper,
          color: textPrimary,
          border: `1px solid ${divider}`,
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          color: textPrimary,
        },
        expandIconWrapper: {
          color: textSecondary,
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          color: textSecondary,
          backgroundColor: isDark ? backgroundPaper : undefined,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: backgroundPaper,
          color: textPrimary,
          border: `1px solid ${divider}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: textPrimary,
          '&:hover': {
            backgroundColor: isDark ? alpha('#ffffff', 0.08) : alpha(brand.ink, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: isDark ? alpha(brand.accent, 0.18) : alpha(brand.accent, 0.1),
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: backgroundPaper,
          color: textPrimary,
          border: `1px solid ${divider}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: backgroundPaper,
          color: textPrimary,
          borderColor: divider,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? backgroundDefault : undefined,
          color: textPrimary,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? backgroundPaper : undefined,
          color: textPrimary,
          borderColor: divider,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        filled: {
          backgroundColor: alpha(brand.accent, 0.14),
          color: brand.accent,
        },
        outlined: {
          borderColor: divider,
          color: textPrimary,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${divider}`,
          boxShadow: '0 32px 68px rgba(15, 44, 67, 0.16)',
          background: isDark ? backgroundPaper : brandGradients.surface,
          overflow: 'hidden',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: textPrimary,
          fontFamily: brandFonts.display,
          fontWeight: 600,
          fontSize: '1.14rem',
          padding: '22px 24px 12px',
          borderBottom: `1px solid ${divider}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '18px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '14px 20px',
          borderTop: `1px solid ${divider}`,
          backgroundColor: isDark ? alpha('#ffffff', 0.03) : alpha(brand.sky, 0.08),
          gap: 10,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(isDark ? '#000' : brand.ink, 0.36),
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: isDark ? alpha('#ffffff', 0.05) : alpha(brand.sky, 0.26),
          color: textPrimary,
          fontWeight: 600,
          fontSize: '0.8rem',
          borderBottom: `1px solid ${divider}`,
        },
        root: {
          borderBottom: `1px solid ${divider}`,
          color: textPrimary,
          fontWeight: 400,
          fontSize: '0.86rem',
        },
      },
    },
  },
  })
}

const theme = createAppTheme('light')

export default theme
