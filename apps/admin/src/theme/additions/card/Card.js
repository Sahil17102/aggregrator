const Card = {
  baseStyle: {
    p: '22px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    minWidth: '0px',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
  },
  variants: {
    panel: (props) => ({
      bg:
        props.colorMode === 'dark'
          ? '#161B22'
          : '#FFFFFF',
      width: '100%',
      border:
        props.colorMode === 'dark'
          ? '1px solid #30363D'
          : '1px solid #E2E8F0',
      boxShadow:
        props.colorMode === 'dark'
          ? 'none'
          : '0 8px 24px rgba(15, 23, 42, 0.04)',
      borderRadius: '12px',
      overflow: 'hidden',
      backdropFilter: 'none',
    }),
  },
  defaultProps: {
    variant: 'panel',
  },
}

export const CardComponent = {
  components: {
    Card,
  },
}
