import { Box, Typography } from '@mui/material'
import { TERMS_AND_CONDITIONS, TERMS_HIGHLIGHT_LINES } from '../../utils/constants'

const isHighlightedLine = (line: string) => {
  const trimmed = line.trim()
  return TERMS_HIGHLIGHT_LINES.some((highlight) => trimmed === highlight || trimmed.endsWith(highlight))
}

export default function TermsAndConditionsText() {
  return (
    <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
      {TERMS_AND_CONDITIONS.trim().split('\n').map((line, index) => {
        const highlighted = isHighlightedLine(line)

        if (!line.trim()) {
          return <Box key={`space-${index}`} sx={{ height: 10 }} />
        }

        return (
          <Typography
            key={`${line}-${index}`}
            variant="body2"
            component="p"
            sx={{
              whiteSpace: 'pre-wrap',
              mb: 0.8,
              fontWeight: highlighted ? 800 : 400,
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
