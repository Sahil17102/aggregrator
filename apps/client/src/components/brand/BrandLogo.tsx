import { Box, type BoxProps } from '@mui/material'
import { brandIdentity } from '../../theme/brand'

interface BrandLogoProps extends Omit<BoxProps, 'component'> {
  compact?: boolean
}

export default function BrandLogo({ compact = false, sx, ...rest }: BrandLogoProps) {
  return (
    <Box
      component="img"
      src={brandIdentity.logoSrc}
      alt={brandIdentity.name}
      sx={{
        width: compact ? 48 : { xs: 54, sm: 64 },
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
        ...sx,
      }}
      {...rest}
    />
  )
}
