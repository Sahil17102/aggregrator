import {
  alpha,
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { BsKeyboardFill } from 'react-icons/bs'
import { FaGavel } from 'react-icons/fa6'
import { MdAccountCircle, MdLogout, MdSettings } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth/AuthContext'
import { usePresignedDownloadUrls } from '../../hooks/Uploads/usePresignedDownloadUrls'
import { brand } from '../../theme/brand'

const INK = brand.ink
const TEXT = brand.ink
const TEXT_SECONDARY = brand.inkSoft
const ACCENT = brand.warning
const SKY = '#4E90CA'
const TEAL = brand.success
const CRIMSON = brand.danger

const getInitials = (fullName?: string) => {
  if (!fullName) return 'U'
  const parts = fullName.trim().split(/\s+/)
  const firstInitial = parts[0]?.[0] ?? ''
  const lastInitial = parts.length > 1 ? parts.at(-1)?.[0] ?? '' : ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

interface UserMenuProps {
  compact?: boolean
}

const UserMenu = ({ compact = false }: UserMenuProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const isDark = theme.palette.mode === 'dark'
  const panelBg = isDark ? '#151b23' : '#ffffff'
  const panelMutedBg = isDark ? '#101720' : alpha(INK, 0.02)
  const borderColor = isDark ? alpha('#f8fafc', 0.1) : alpha(INK, 0.08)
  const textColor = isDark ? '#f8fafc' : TEXT
  const mutedColor = isDark ? '#93a4ba' : TEXT_SECONDARY
  const avatarBg = compact ? (isDark ? '#2b2760' : alpha('#7657ff', 0.1)) : INK
  const avatarColor = compact ? (isDark ? '#f8fafc' : '#7657ff') : '#ffffff'

  const { data: avatarUrl } = usePresignedDownloadUrls({
    keys: user?.companyInfo?.profilePicture,
    enabled: !!user?.companyInfo?.profilePicture,
  })

  const handleClose = () => setAnchorEl(null)

  const menuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: MdAccountCircle,
      color: INK,
      onClick: () => {
        navigate('/profile/user_profile/settings/user')
        handleClose()
      },
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: MdSettings,
      color: ACCENT,
      onClick: () => {
        navigate('/settings')
        handleClose()
      },
    },
    {
      key: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      icon: BsKeyboardFill,
      color: SKY,
      onClick: () => {
        navigate('/help/shortcuts')
        handleClose()
      },
    },
    {
      key: 'terms-conditions',
      label: 'Legal & Policies',
      icon: FaGavel,
      color: TEAL,
      onClick: () => {
        navigate('/policies/refund_cancellation')
        handleClose()
      },
    },
    { key: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      icon: MdLogout,
      color: CRIMSON,
      onClick: () => {
        logout()
        handleClose()
      },
    },
  ]

  return (
    <Box>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        sx={{
          p: compact ? 0 : 0.45,
          minWidth: compact ? 42 : 'auto',
          height: compact ? 38 : 'auto',
          borderRadius: compact ? 1.5 : 2,
          border: compact ? `1px solid ${isDark ? alpha('#fff', 0.08) : 'transparent'}` : `1px solid ${borderColor}`,
          bgcolor: compact ? (isDark ? alpha('#ffffff', 0.03) : 'transparent') : alpha('#FFFFFF', 0.84),
          color: avatarColor,
          boxShadow: compact ? 'none' : `0 8px 18px ${alpha(INK, 0.05)}`,
          '&:hover': {
            bgcolor: compact ? (isDark ? alpha('#ffffff', 0.08) : alpha('#7657ff', 0.08)) : alpha(INK, 0.04),
          },
        }}
      >
        <Avatar
          src={avatarUrl?.[0] ?? ''}
          sx={{
            width: compact ? 38 : 32,
            height: compact ? 38 : 32,
            bgcolor: avatarBg,
            color: avatarColor,
            fontSize: compact ? '0.94rem' : '0.82rem',
            fontWeight: 900,
            borderRadius: compact ? 1.5 : 2,
          }}
        >
          {getInitials(user?.companyInfo?.contactPerson || user?.name)}
        </Avatar>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.15,
            width: 280,
            borderRadius: 2,
            border: `1px solid ${borderColor}`,
            boxShadow: isDark ? '0 24px 54px rgba(0,0,0,0.36)' : `0 18px 36px ${alpha(INK, 0.12)}`,
            overflow: 'hidden',
            background: panelBg,
            color: textColor,
          },
        }}
      >
        <Box
          sx={{
            p: 1.4,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: panelMutedBg,
          }}
        >
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 900, color: textColor }} noWrap>
            {user?.companyInfo?.contactPerson || user?.name || 'Ship Aggregator User'}
          </Typography>
          <Typography sx={{ mt: 0.3, fontSize: '0.76rem', fontWeight: 600, color: mutedColor }} noWrap>
            {user?.companyInfo?.contactEmail || user?.email}
          </Typography>
        </Box>

        <List sx={{ p: 1 }}>
          {menuItems.map((item, index) => {
            if (item.key === 'divider') return <Divider key={index} sx={{ my: 0.8, borderColor, opacity: 1 }} />

            const Icon = item.icon!
            const itemColor = isDark && item.color === INK ? '#9b8cff' : item.color ?? INK
            return (
              <ListItemButton
                key={item.key}
                onClick={item.onClick}
                sx={{
                  borderRadius: 2,
                  py: 0.95,
                  px: 1.1,
                  '&:hover': {
                    bgcolor: alpha(itemColor, isDark ? 0.16 : 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: itemColor }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(itemColor, isDark ? 0.18 : 0.1),
                    }}
                  >
                    <Icon size={17} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    color: textColor,
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Popover>
    </Box>
  )
}

export default UserMenu

