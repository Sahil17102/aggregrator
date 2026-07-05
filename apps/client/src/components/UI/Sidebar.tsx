import {
  alpha,
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { BiListPlus } from 'react-icons/bi'
import { CgTrack } from 'react-icons/cg'
import { FaClipboardList as FaFileAlt, FaToolbox } from 'react-icons/fa6'
import {
  MdAccountBalanceWallet,
  MdApps,
  MdDashboard,
  MdExpandMore,
  MdKeyboardReturn,
  MdLocalShipping,
  MdOutlineAddBusiness,
  MdShoppingCart,
  MdSyncProblem,
} from 'react-icons/md'
import { RiSettings2Fill } from 'react-icons/ri'
import { TbInvoice, TbReportAnalytics, TbTransactionRupee } from 'react-icons/tb'
import { NavLink, useLocation } from 'react-router-dom'

import type { JSX } from '@emotion/react/jsx-runtime'
import BrandLogo from '../brand/BrandLogo'
import { brandIdentity } from '../../theme/brand'
import { DRAWER_WIDTH } from '../../utils/constants'
import { isActive } from '../../utils/functions'
import { useAuth } from '../../context/auth/AuthContext'

export type Role = 'customer' | 'admin'

export interface SubItem {
  text: string
  path: string
  icon?: JSX.Element
}

export interface NavItem {
  text: string
  icon: JSX.Element
  path: string
  roles: Role[]
  children?: SubItem[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface SidebarProps {
  role?: Role
  pinned: boolean
  handleDrawerToggle: () => void
  setHovered: Dispatch<SetStateAction<boolean>>
  hovered: boolean
  temporary?: boolean
  onNavigate?: () => void
}

export const COLLAPSED_WIDTH = 72

const STANDARD_ICON_SIZE = 21
const ACTIVE = '#7657ff'

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        text: 'Dashboard',
        icon: <MdDashboard size={STANDARD_ICON_SIZE} />,
        path: '/dashboard',
        roles: ['customer', 'admin'],
      },
      {
        text: 'Orders',
        icon: <MdShoppingCart size={STANDARD_ICON_SIZE} />,
        path: '/orders',
        roles: ['customer', 'admin'],
        children: [
          { text: 'All Orders', path: '/orders/list', icon: <FaFileAlt size={STANDARD_ICON_SIZE} /> },
          { text: 'Create Order', path: '/orders/create', icon: <BiListPlus size={STANDARD_ICON_SIZE} /> },
          { text: 'B2C Orders', path: '/orders/b2c/list', icon: <MdOutlineAddBusiness size={STANDARD_ICON_SIZE} /> },
          { text: 'B2B Orders', path: '/orders/b2b/list', icon: <MdOutlineAddBusiness size={STANDARD_ICON_SIZE} /> },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        text: 'Wallet',
        icon: <MdAccountBalanceWallet size={STANDARD_ICON_SIZE} />,
        path: '/billing/wallet_transactions',
        roles: ['customer', 'admin'],
      },
      {
        text: 'COD Remittance',
        icon: <TbTransactionRupee size={STANDARD_ICON_SIZE} />,
        path: '/cod-remittance',
        roles: ['customer', 'admin'],
      },
      {
        text: 'Billings',
        icon: <TbInvoice size={STANDARD_ICON_SIZE} />,
        path: '/billing/invoice_management',
        roles: ['customer', 'admin'],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        text: 'Operations',
        icon: <MdSyncProblem size={STANDARD_ICON_SIZE} />,
        path: '/ops',
        roles: ['customer', 'admin'],
        children: [
          { text: 'NDR', path: '/ops/ndr', icon: <MdSyncProblem size={STANDARD_ICON_SIZE} /> },
          { text: 'RTO', path: '/ops/rto', icon: <MdKeyboardReturn size={STANDARD_ICON_SIZE} /> },
        ],
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        text: 'Integrations',
        icon: <MdApps size={STANDARD_ICON_SIZE} />,
        path: '/channels',
        roles: ['customer', 'admin'],
        children: [
          { text: 'Couriers', path: '/couriers/partners', icon: <MdLocalShipping size={STANDARD_ICON_SIZE} /> },
          { text: 'Channels', path: '/channels/connected', icon: <MdApps size={STANDARD_ICON_SIZE} /> },
        ],
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        text: 'Tools',
        icon: <FaToolbox size={STANDARD_ICON_SIZE} />,
        path: '/tools',
        roles: ['customer', 'admin'],
        children: [
          { text: 'Rate Calculator', path: '/tools/rate_calculator', icon: <TbReportAnalytics size={STANDARD_ICON_SIZE} /> },
          { text: 'Order Tracking', path: '/tools/order_tracking', icon: <CgTrack size={STANDARD_ICON_SIZE} /> },
        ],
      },
    ],
  },
]

const settingsItem: NavItem = {
  text: 'Settings',
  icon: <RiSettings2Fill size={STANDARD_ICON_SIZE} />,
  path: '/settings',
  roles: ['customer', 'admin'],
}

const itemHasActiveChild = (pathname: string, item: NavItem) =>
  Boolean(item.children?.some((sub) => isActive(pathname, sub.path)))

export default function Sidebar({
  role = 'customer',
  pinned,
  hovered,
  setHovered,
  temporary = false,
  onNavigate,
}: SidebarProps) {
  const location = useLocation()
  const theme = useTheme()
  const { user } = useAuth()
  const isSidebarExpanded = temporary || pinned || hovered
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const isDark = theme.palette.mode === 'dark'
  const DARK_BG = isDark ? '#151b23' : '#ffffff'
  const BORDER = isDark ? '#2a313a' : 'rgba(15, 23, 42, 0.1)'
  const TEXT = isDark ? '#a9b8cc' : '#586b8a'
  const MUTED = isDark ? '#8798ad' : '#8492aa'
  const WHITE = isDark ? '#f8fafc' : '#11182d'
  const itemHoverBg = isDark ? alpha('#ffffff', 0.035) : alpha('#11182d', 0.045)
  const childHoverBg = isDark ? alpha('#ffffff', 0.045) : alpha(ACTIVE, 0.08)
  const activeBg = isDark ? alpha(ACTIVE, 0.16) : alpha(ACTIVE, 0.1)
  const childActiveBg = isDark ? alpha(ACTIVE, 0.14) : alpha(ACTIVE, 0.12)
  const iconMuted = isDark ? '#8190a5' : '#76849a'
  const scrollbarThumb = isDark ? '#3a4350' : '#cbd5e1'
  const activeText = isDark ? '#bdb5ff' : ACTIVE
  const initialsBg = isDark ? '#2b2760' : alpha(ACTIVE, 0.1)
  const initialsBorder = isDark ? alpha('#ffffff', 0.1) : alpha(ACTIVE, 0.16)
  const initialsColor = isDark ? '#f8fafc' : ACTIVE

  useEffect(() => {
    if (!isSidebarExpanded) setExpandedItems({})
  }, [isSidebarExpanded])

  useEffect(() => {
    const nextExpanded: Record<string, boolean> = {}
    ;[...navSections.flatMap((section) => section.items), settingsItem].forEach((item) => {
      if (item.children?.some((sub) => isActive(location.pathname, sub.path))) {
        nextExpanded[item.text] = true
      }
    })
    setExpandedItems((prev) => ({ ...prev, ...nextExpanded }))
  }, [location.pathname])

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleRouteNavigate = () => {
    onNavigate?.()
  }

  const navItemSx = {
    minHeight: 43,
    borderRadius: 0,
    px: isSidebarExpanded ? 3.6 : 0,
    py: 0,
    color: TEXT,
    position: 'relative',
    transition: 'background-color 160ms ease, color 160ms ease',
    '&:hover': {
      bgcolor: itemHoverBg,
      color: WHITE,
      '& .MuiListItemIcon-root': { color: WHITE },
    },
  }

  const activeItemSx = {
    bgcolor: activeBg,
    color: activeText,
    '& .MuiListItemIcon-root': { color: activeText },
    '& .MuiListItemText-primary': { fontWeight: 800 },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 11,
      bottom: 11,
      width: 4,
      borderRadius: '0 8px 8px 0',
      bgcolor: activeText,
    },
  }

  const renderItem = (item: NavItem) => {
    const isSelected = isActive(location.pathname, item.path)
    const hasChildren = Boolean(item.children?.length)
    const childSelected = itemHasActiveChild(location.pathname, item)
    const isExpanded = expandedItems[item.text]
    const showExpanded = isSidebarExpanded && isExpanded
    const active = (isSelected && !hasChildren) || childSelected

    const listItem = (
      <ListItemButton
        component={hasChildren ? 'div' : NavLink}
        to={hasChildren ? undefined : item.path}
        onClick={hasChildren ? () => toggleExpand(item.text) : handleRouteNavigate}
        sx={{
          ...navItemSx,
          justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
          ...(active ? activeItemSx : {}),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: isSidebarExpanded ? 38 : 0,
            justifyContent: 'center',
            color: active ? activeText : iconMuted,
            transition: 'color 160ms ease',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {isSidebarExpanded ? (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: '1rem',
              fontWeight: active ? 800 : 650,
              letterSpacing: '-0.01em',
            }}
          />
        ) : null}
        {hasChildren && isSidebarExpanded ? (
          <MdExpandMore
            size={20}
            style={{
              transform: showExpanded ? 'rotate(180deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
              color: active ? activeText : iconMuted,
            }}
          />
        ) : null}
      </ListItemButton>
    )

    return (
      <Box key={item.text}>
        {isSidebarExpanded ? (
          listItem
        ) : (
          <Tooltip title={item.text} placement="right">
            <Box>{listItem}</Box>
          </Tooltip>
        )}

        {hasChildren && isSidebarExpanded && (
          <Collapse in={showExpanded} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ ml: 6.6, pr: 1.5, py: 0.35 }}>
              {item.children?.map((sub) => {
                const subActive = isActive(location.pathname, sub.path)
                return (
                  <ListItemButton
                    key={sub.text}
                    component={NavLink}
                    to={sub.path}
                    onClick={handleRouteNavigate}
                    sx={{
                      minHeight: 32,
                      px: 1.2,
                      py: 0.45,
                      borderRadius: 1,
                      color: subActive ? WHITE : TEXT,
                      bgcolor: subActive ? childActiveBg : 'transparent',
                      '&:hover': {
                        bgcolor: childHoverBg,
                        color: WHITE,
                      },
                      mb: 0.25,
                    }}
                  >
                    <ListItemText
                      primary={sub.text}
                      primaryTypographyProps={{
                        fontSize: '0.88rem',
                        fontWeight: subActive ? 800 : 650,
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  const visibleSections = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role || 'customer')),
  }))

  const displayName = user?.companyInfo?.contactPerson || user?.name || 'Sahil Mittal'
  const displayEmail = user?.companyInfo?.contactEmail || user?.email || 'sahilmittal1920@gmail...'
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Box
      sx={{
        width: temporary ? '100%' : isSidebarExpanded ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        height: temporary ? '100%' : '100dvh',
        maxHeight: temporary ? '100%' : '100dvh',
        background: DARK_BG,
        borderRight: `1px solid ${BORDER}`,
        transition: 'width 220ms ease',
        display: 'flex',
        flexDirection: 'column',
        zIndex: theme.zIndex.drawer,
        position: temporary ? 'relative' : 'fixed',
        left: temporary ? 'auto' : 0,
        top: temporary ? 'auto' : 0,
        overflow: 'hidden',
        boxShadow: 'none',
        contain: 'layout paint style',
        willChange: temporary ? 'auto' : 'width',
      }}
      onMouseEnter={() => {
        if (!temporary) setHovered(true)
      }}
      onMouseLeave={() => {
        if (!temporary) setHovered(false)
      }}
    >
      <Box
        sx={{
          height: 72,
          px: isSidebarExpanded ? 2.25 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexShrink: 0,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <BrandLogo compact sx={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
        {isSidebarExpanded ? (
          <Typography
            sx={{
              color: WHITE,
              fontSize: '1.28rem',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            {brandIdentity.name}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          scrollbarGutter: 'stable',
          WebkitOverflowScrolling: 'touch',
          py: 1.5,
          bgcolor: DARK_BG,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: DARK_BG },
          '&::-webkit-scrollbar-thumb': { background: scrollbarThumb, borderRadius: 8 },
        }}
      >
        {visibleSections.map((section) =>
          section.items.length ? (
            <Box key={section.title} sx={{ mb: 2.2 }}>
              {isSidebarExpanded ? (
                <Typography
                  sx={{
                    px: 3.6,
                    mb: 0.8,
                    color: MUTED,
                    fontSize: '0.82rem',
                    fontWeight: 850,
                    textTransform: 'uppercase',
                    letterSpacing: 0,
                  }}
                >
                  {section.title}
                </Typography>
              ) : null}
              <List disablePadding>{section.items.map(renderItem)}</List>
            </Box>
          ) : null,
        )}
      </Box>

      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${BORDER}`, bgcolor: DARK_BG }}>
        {renderItem(settingsItem)}
        {isSidebarExpanded ? (
          <Box
            sx={{
              px: 3.6,
              py: 1.85,
              borderTop: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.35,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: initialsColor,
                bgcolor: initialsBg,
                border: `1px solid ${initialsBorder}`,
                fontSize: '0.9rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: WHITE, fontWeight: 850, fontSize: '0.98rem' }} noWrap>
                {displayName}
              </Typography>
              <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.85rem' }} noWrap>
                {displayEmail}
              </Typography>
            </Box>
            <MdExpandMore size={19} color={TEXT} />
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
