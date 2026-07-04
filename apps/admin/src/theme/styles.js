import { mode } from '@chakra-ui/theme-tools'
import { brandFonts } from './brand'
import colors from './foundations/colors'

export const globalStyles = {
  colors: {
    ...colors,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode('#0D1117', '#0D1117')(props),
        color: mode('gray.900', 'whiteAlpha.900')(props),
        fontFamily: brandFonts.body,
        backgroundImage: 'none',
        backgroundAttachment: 'fixed',
      },
      html: {
        fontFamily: brandFonts.body,
        bg: '#0D1117',
      },
      '#root': {
        minHeight: '100vh',
      },
      '*': {
        boxSizing: 'border-box',
      },
      '.chakra-button': {
        borderRadius: '10px !important',
        minHeight: '40px',
        alignItems: 'center',
        justifyContent: 'center',
      },
      '.chakra-icon-button': {
        borderRadius: '10px !important',
      },
      '.admin-card': {
        borderRadius: '12px !important',
      },
      '.chakra-modal__content': {
        borderRadius: '16px !important',
      },
      '.chakra-input, .chakra-select, .chakra-textarea': {
        borderRadius: '10px !important',
      },
      '::selection': {
        background: mode('brand.100', 'accent.600')(props),
      },
      '::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '::-webkit-scrollbar-track': {
        background: '#0D1117',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'rgba(139, 148, 158, 0.65)',
        borderRadius: '999px',
      },
    }),
  },
}
