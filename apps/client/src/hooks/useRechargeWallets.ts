import { useMutation } from '@tanstack/react-query'
import { confirmRecharge, createRechargeOrder } from '../api/wallet.api'

interface RechargeOptions {
  amount: number
  prefill: {
    name: string
    email: string
    contact: string
  }
}

interface RechargeOrderResponse {
  orderId: string
  key: string
  amount: number
  currency?: string
  name?: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  themeColor?: string
}

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  retry?: {
    enabled: boolean
    max_count: number
  }
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>
  modal: {
    ondismiss: () => void
  }
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: () => void) => void
  close: () => void
}

interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

const loadRazorpayCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Razorpay checkout failed to load')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_CHECKOUT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Razorpay checkout failed to load'))
    document.body.appendChild(script)
  })

export const useRechargeWallet = () =>
  useMutation<void, Error, RechargeOptions>({
    mutationFn: async (options) => {
      await loadRazorpayCheckout()

      const orderData = (await createRechargeOrder({
        amount: options.amount,
        name: options.prefill.name,
        email: options.prefill.email,
        phone: options.prefill.contact,
      })) as RechargeOrderResponse

      if (!orderData?.orderId || !orderData?.key || !orderData?.amount) {
        throw new Error('Invalid Razorpay order response')
      }
      if (!window.Razorpay) {
        throw new Error('Razorpay checkout is unavailable')
      }

      const checkoutOptions: RazorpayCheckoutOptions = {
        key: orderData.key,
        amount: Number(orderData.amount),
        currency: orderData.currency || 'INR',
        name: orderData.name || 'ChoiceMee Logistics',
        description: orderData.description || 'Wallet Recharge',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill?.name || options.prefill.name || 'ChoiceMee Customer',
          email: orderData.prefill?.email || options.prefill.email || '',
          contact: orderData.prefill?.contact || options.prefill.contact || '',
        },
        theme: { color: orderData.theme?.color || orderData.themeColor || '#0052CC' },
        retry: {
          enabled: true,
          max_count: 2,
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await confirmRecharge({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })

            window.location.reload()
          } catch (error) {
            console.error('Payment confirmation error:', error)
            alert('Payment successful but wallet confirmation failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user')
          },
        },
      }

      const razorpay = new window.Razorpay(checkoutOptions)
      razorpay.open()
    },
  })
