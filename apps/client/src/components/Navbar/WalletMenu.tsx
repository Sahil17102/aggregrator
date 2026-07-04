import { alpha, Box, Skeleton, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { FaWallet } from 'react-icons/fa'
import { useAuth } from '../../context/auth/AuthContext'
import { useWalletBalance } from '../../hooks/useWalletBalance'
import AddMoneyDialog from '../AddMoneyDialog'

const INK = '#182235'
const ACCENT = '#D66F3D'

interface WalletMenuProps {
  compactLabel?: string
}

const WalletMenu = ({ compactLabel }: WalletMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { walletBalance, setWalletBalance } = useAuth()
  const { data, isLoading } = useWalletBalance(true)

  useEffect(() => {
    const balance = Number(data?.data?.balance ?? 0)
    if (!isNaN(balance)) {
      setWalletBalance(balance)
    } else {
      setWalletBalance(0)
    }
  }, [data, setWalletBalance])

  return (
    <>
      <Box
        onClick={() => setDialogOpen(true)}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: compactLabel ? 0.75 : 0.85,
          height: compactLabel ? 38 : 'auto',
          px: compactLabel ? 1.35 : { xs: 0.95, sm: 1.05 },
          py: compactLabel ? 0 : 0.78,
          borderRadius: compactLabel ? 2 : 3,
          border: compactLabel ? '1px solid #2a313a' : `1px solid ${alpha(INK, 0.08)}`,
          bgcolor: compactLabel ? '#101720' : alpha('#FFFFFF', 0.84),
          minWidth: compactLabel ? 'auto' : { xs: 'auto', sm: 156 },
          boxShadow: compactLabel ? 'none' : `0 8px 18px ${alpha(INK, 0.05)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: compactLabel ? alpha('#7657ff', 0.5) : alpha(ACCENT, 0.24),
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Box
          sx={{
            width: compactLabel ? 20 : 32,
            height: compactLabel ? 20 : 32,
            borderRadius: compactLabel ? 1 : 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: compactLabel ? 'transparent' : alpha(ACCENT, 0.12),
            color: compactLabel ? '#ff7a17' : ACCENT,
            border: compactLabel ? 0 : `1px solid ${alpha(ACCENT, 0.14)}`,
            flexShrink: 0,
          }}
        >
          <FaWallet size={14} />
        </Box>

        <Stack spacing={0.02} sx={{ minWidth: 0 }}>
          {!compactLabel ? (
            <Typography
              sx={{
                fontSize: '0.64rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: alpha(INK, 0.46),
              }}
            >
              Wallet
            </Typography>
          ) : null}
          {isLoading || walletBalance === null ? (
            <Skeleton variant="text" width={70} height={20} sx={{ bgcolor: alpha(INK, 0.08) }} />
          ) : (
            <Typography
              sx={{
                fontSize: compactLabel ? '0.94rem' : '0.86rem',
                fontWeight: 900,
                color: compactLabel ? '#f8fafc' : INK,
                letterSpacing: '-0.02em',
              }}
            >
              {compactLabel || `INR ${walletBalance?.toLocaleString('en-IN')}`}
            </Typography>
          )}
        </Stack>
      </Box>

      <AddMoneyDialog
        currentBalance={walletBalance ?? 0}
        open={dialogOpen}
        setOpen={setDialogOpen}
      />
    </>
  )
}

export default WalletMenu
