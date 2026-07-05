import { alpha, Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import React from 'react'
import { TbSparkles } from 'react-icons/tb'
import { brand, brandGradients } from '../../../theme/brand'

interface PageHeadingProps {
  title: string | React.ReactNode
  subtitle?: string
  center?: boolean
  fontSize?: string | number
  icon?: React.ReactNode
  eyebrow?: string
}

const normalizeHeadingText = (value: string) =>
  value
    .replace(/â€“|â€”/g, '-')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€�/g, '"')
    .replace(/â€¢/g, '•')
    .replace(/â€¦/g, '...')
    .replace(/Â©/g, '©')
    .replace(/Â®/g, '®')

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  center = false,
  fontSize,
  icon = <TbSparkles size={18} />,
  eyebrow = 'Panel',
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const normalizedTitle = typeof title === 'string' ? normalizeHeadingText(title) : title
  const normalizedSubtitle =
    typeof subtitle === 'string' ? normalizeHeadingText(subtitle) : subtitle
  const normalizedEyebrow = typeof eyebrow === 'string' ? normalizeHeadingText(eyebrow) : eyebrow

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: `1px solid ${isDark ? alpha('#f8fafc', 0.1) : alpha('#FFFFFF', 0.7)}`,
        background: isDark ? '#151b23' : brandGradients.surface,
        px: { xs: 1.8, sm: 2.4 },
        py: { xs: 1.8, sm: 2.1 },
        boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.18)' : '0 20px 42px rgba(15,44,67,0.08)',
      }}
    >
      <Stack spacing={1} textAlign={center ? 'center' : 'left'} position="relative" zIndex={1}>
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{
            justifyContent: center ? 'center' : 'flex-start',
          }}
        >
          <motion.div
            initial={{ rotate: -18, scale: 0.82, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            whileHover={{ rotate: 12, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: brandGradients.button,
                color: brand.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(130,194,255,0.24)',
              }}
            >
              {icon}
            </Box>
          </motion.div>
          <Stack spacing={0.4}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 0,
              }}
            >
              {normalizedEyebrow}
            </Typography>
            <Typography
              fontSize={fontSize ?? { xs: '1.45rem', md: '1.95rem' }}
              fontWeight={700}
              lineHeight={1.08}
              sx={{
                color: theme.palette.text.primary,
                letterSpacing: 0,
              }}
            >
              {normalizedTitle}
            </Typography>
          </Stack>
        </Stack>

        {normalizedSubtitle && (
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', md: '0.96rem' },
              maxWidth: center ? 820 : 760,
              mx: center ? 'auto' : 0,
              lineHeight: 1.75,
              pl: center ? 0 : { xs: 0, sm: 6 },
            }}
          >
            {normalizedSubtitle}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export default PageHeading
