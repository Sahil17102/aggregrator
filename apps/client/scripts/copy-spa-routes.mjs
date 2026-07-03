import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const distDir = join(process.cwd(), 'dist')
const indexFile = join(distDir, 'index.html')

const routes = [
  'landing',
  'login',
  'signin',
  'forgot-password',
  'reset-password',
  'signup',
  'app',
  'preview',
  'tracking',
  'rate-calculator',
  'weight-calculator',
  'terms-and-conditions',
  'privacy-policy',
  'onboarding-questions',
  'settings',
  'settings/manage_pickups',
  'settings/invoice_preferences',
  'settings/label_config',
  'settings/users_management',
  'settings/courier_priority',
  'settings/api-integration',
  'billing/wallet_transactions',
  'billing/invoice_management',
  'orders/list',
  'orders/create',
  'orders/b2c/list',
  'orders/b2b/list',
  'support/about_us',
  'support/tickets',
  'channels/connected',
  'channels/channel_list',
  'help/shortcuts',
  'profile',
  'profile/user_profile',
  'profile/company',
  'profile/password',
  'profile/bank_details',
  'profile/kyc_details',
  'dashboard',
  'tools/rate_card',
  'tools/rate_calculator',
  'tools/order_tracking',
  'home',
  'couriers/partners',
  'cod-remittance',
  'reports',
  'reconciliation/weight',
  'reconciliation/weight/settings',
  'ops/ndr',
  'ops/rto',
]

if (!existsSync(indexFile)) {
  throw new Error(`Cannot copy SPA routes because ${indexFile} does not exist.`)
}

for (const route of routes) {
  const routeIndex = join(distDir, route, 'index.html')
  mkdirSync(dirname(routeIndex), { recursive: true })
  copyFileSync(indexFile, routeIndex)
}

console.log(`Copied index.html to ${routes.length} SPA route fallback(s).`)
