import { Box, Typography } from '@mui/material'
import {
  TERMS_AND_CONDITIONS,
  TERMS_HIGHLIGHT_LINES,
  TERMS_SECTION_TITLES,
} from '../../utils/constants'

const isHighlightedLine = (line: string) => {
  const trimmed = line.trim()
  return TERMS_HIGHLIGHT_LINES.some((highlight) => trimmed === highlight || trimmed.endsWith(highlight))
}

const isSectionTitle = (line: string) => {
  const trimmed = line.trim()
  return trimmed.startsWith('Last updated:') || TERMS_SECTION_TITLES.includes(trimmed)
}

interface TermsAndConditionsTextProps {
  scrollable?: boolean
}

export default function TermsAndConditionsText({ scrollable = true }: TermsAndConditionsTextProps) {
  return (
    <Box sx={{ maxHeight: scrollable ? '60vh' : 'none', overflowY: scrollable ? 'auto' : 'visible', pr: 1 }}>
      {TERMS_AND_CONDITIONS.trim().split('\n').map((line, index) => {
        const highlighted = isHighlightedLine(line)
        const sectionTitle = isSectionTitle(line)

        if (!line.trim()) {
          return <Box key={`space-${index}`} sx={{ height: sectionTitle ? 6 : 10 }} />
        }

        return (
          <Typography
            key={`${line}-${index}`}
            variant="body2"
            component="p"
            sx={{
              whiteSpace: 'pre-wrap',
              mt: sectionTitle ? 1.6 : 0,
              mb: sectionTitle ? 1 : 0.8,
              fontSize: sectionTitle ? '0.98rem' : '0.88rem',
              lineHeight: sectionTitle ? 1.35 : 1.72,
              fontWeight: highlighted || sectionTitle ? 800 : 400,
              color: highlighted ? '#171310' : 'inherit',
              bgcolor: highlighted ? 'rgba(245, 124, 0, 0.12)' : 'transparent',
              borderLeft: highlighted ? '4px solid #F57C00' : '4px solid transparent',
              borderRadius: highlighted ? '8px' : 0,
              px: highlighted ? 1.25 : 0,
              py: highlighted ? 0.85 : 0,
            }}
          >
            {line}
          </Typography>
        )
      })}
    </Box>
  )
}
