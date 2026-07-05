import { CssBaseline } from '@mui/material'
import { ThemeProvider, type PaletteMode } from '@mui/material/styles'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createAppTheme } from '../../theme/theme'

interface ClientThemeContextValue {
  mode: PaletteMode
  setMode: (mode: PaletteMode) => void
  toggleMode: () => void
}

const STORAGE_KEY = 'ship-aggregator-client-theme'

const ClientThemeContext = createContext<ClientThemeContextValue | undefined>(undefined)

const getInitialMode = (): PaletteMode => {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  return 'light'
}

export function ClientThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PaletteMode>(getInitialMode)

  const setMode = (nextMode: PaletteMode) => {
    setModeState(nextMode)
    window.localStorage.setItem(STORAGE_KEY, nextMode)
  }

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
    }),
    [mode],
  )

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ClientThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ClientThemeContext.Provider>
  )
}

export const useClientThemeMode = () => {
  const context = useContext(ClientThemeContext)
  if (!context) throw new Error('useClientThemeMode must be used inside ClientThemeProvider')
  return context
}
