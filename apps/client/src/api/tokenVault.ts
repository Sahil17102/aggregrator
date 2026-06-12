// src/api/tokenVault.ts
let access = ''
let refresh = ''
let keepSignedIn = true

const ACCESS_KEY = 'cc_access'
const REFRESH_KEY = 'cc_refresh'

const getStoredTokenPair = () => {
  const sessionAccess = sessionStorage.getItem(ACCESS_KEY) || ''
  const sessionRefresh = sessionStorage.getItem(REFRESH_KEY) || ''
  const localAccess = localStorage.getItem(ACCESS_KEY) || ''
  const localRefresh = localStorage.getItem(REFRESH_KEY) || ''

  if (sessionAccess || sessionRefresh) {
    keepSignedIn = false
    return { accessToken: sessionAccess, refreshToken: sessionRefresh }
  }

  if (localAccess || localRefresh) {
    keepSignedIn = true
    return { accessToken: localAccess, refreshToken: localRefresh }
  }

  return { accessToken: '', refreshToken: '' }
}

export const getAuthPersistence = () => keepSignedIn

/** Read the latest tokens kept in memory and the selected browser storage. */
export const getAuthTokens = () => {
  if (access || refresh) return { accessToken: access, refreshToken: refresh }

  const { accessToken, refreshToken } = getStoredTokenPair()
  access = accessToken
  refresh = refreshToken

  return { accessToken, refreshToken }
}

/** Save tokens for the current browser session, or persist when keep-signed-in is enabled. */
export const setAuthTokens = (a: string, r: string, persist = getAuthPersistence()) => {
  access = a
  refresh = r
  keepSignedIn = persist

  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)

  const storage = persist ? localStorage : sessionStorage
  storage.setItem(ACCESS_KEY, a)
  storage.setItem(REFRESH_KEY, r)
}

/** Wipe everything. */
export const clearAuthTokens = () => {
  access = ''
  refresh = ''
  keepSignedIn = true
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
