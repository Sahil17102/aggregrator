export const supportCategories = [
  {
    key: 'order_booking',
    label: 'Order & Booking Issues',
    description: 'Problems creating, booking, cancelling, or manifesting an order',
    subcategories: [
      { key: 'order_not_created', label: 'Order Not Created' },
      { key: 'b2c_booking_failed', label: 'B2C Booking Failed' },
      { key: 'b2b_booking_failed', label: 'B2B Booking Failed' },
      { key: 'order_not_manifested', label: 'Order Not Manifested' },
      { key: 'duplicate_order', label: 'Duplicate Order Created' },
      { key: 'wrong_order_details', label: 'Wrong Order Details' },
      { key: 'order_cancellation_issue', label: 'Order Cancellation Issue' },
    ],
  },
  {
    key: 'shipment_issues',
    label: 'Shipment Issues',
    description: 'Problems with pickups, delivery, or lost shipments',
    subcategories: [
      { key: 'pickup_not_done', label: 'Pickup Not Done' },
      { key: 'pickup_delayed', label: 'Pickup Delayed' },
      { key: 'shipment_lost', label: 'Shipment Lost' },
      { key: 'shipment_damaged', label: 'Shipment Damaged' },
      { key: 'rto_issue', label: 'RTO Not Returned / Stuck' },
      { key: 'delivered_to_wrong_address', label: 'Delivered to Wrong Address' },
    ],
  },
  {
    key: 'awb_issues',
    label: 'AWB & Label Issues',
    description: 'Problems with airway bills, label generation, or printing',
    subcategories: [
      { key: 'awb_not_generated', label: 'AWB Not Generated' },
      { key: 'awb_not_visible', label: 'AWB Not Visible on Portal' },
      { key: 'wrong_awb_assigned', label: 'Wrong AWB Assigned' },
      { key: 'label_format_issue', label: 'Label Format Incorrect' },
    ],
  },
  {
    key: 'payment_refund',
    label: 'Payments & Refunds',
    description: 'Wallet recharges, COD settlements, or refund issues',
    subcategories: [
      { key: 'wallet_recharge_not_reflected', label: 'Recharge Not Reflecting' },
      { key: 'cod_payment_delayed', label: 'COD Payment Delayed' },
      { key: 'cod_payment_short', label: 'COD Payment Short' },
      { key: 'refund_not_received', label: 'Refund Not Received' },
      { key: 'extra_charge_on_shipment', label: 'Extra Charges on Shipment' },
    ],
  },
  {
    key: 'courier_partner',
    label: 'Courier Partner Issues',
    description: 'Partner-specific complaints or requests',
    subcategories: [
      { key: 'courier_not_picking_up', label: 'Courier Not Picking Up Orders' },
      { key: 'bad_courier_experience', label: 'Unprofessional Courier Behavior' },
      { key: 'request_new_partner', label: 'Request New Courier Partner' },
      { key: 'disable_partner', label: 'Disable Existing Partner' },
    ],
  },
  {
    key: 'returns_rto',
    label: 'Returns & RTOs',
    description: 'Concerns with returns, buyer rejections, or fake RTOs',
    subcategories: [
      { key: 'fake_rto', label: 'Fake RTO / Buyer Not Attempted' },
      { key: 'rto_damaged_product', label: 'RTO Came Back Damaged' },
      { key: 'rto_overcharged', label: 'Overcharged for RTO' },
      { key: 'rto_not_updated', label: 'RTO Not Updated in Dashboard' },
    ],
  },
  {
    key: 'kyc_onboarding',
    label: 'KYC & Onboarding',
    description: 'Problems with account verification or profile setup',
    subcategories: [
      { key: 'kyc_pending', label: 'KYC Pending Too Long' },
      { key: 'bank_not_verified', label: 'Bank Not Verified' },
      { key: 'document_rejected', label: 'Document Rejected' },
      { key: 'cheque_upload_issue', label: 'Cannot Upload Cheque' },
    ],
  },
  {
    key: 'platform_issue',
    label: 'Platform Issues',
    description: 'Bugs or glitches in dashboard, orders, or UI',
    subcategories: [
      { key: 'dashboard_not_loading', label: 'Dashboard Not Loading' },
      { key: 'order_not_syncing', label: 'Orders Not Syncing' },
      { key: 'tracking_not_updating', label: 'Tracking Not Updating' },
      { key: 'filters_not_working', label: 'Filters Not Working' },
      { key: 'inventory_error', label: 'Inventory Mismatch/Error' },
    ],
  },
  {
    key: 'other',
    label: 'Other / General Query',
    description: 'Anything not listed above',
    subcategories: [
      { key: 'feedback_suggestion', label: 'Feedback / Suggestion' },
      { key: 'schedule_call', label: 'Request a Call from Support' },
      { key: 'account_deactivation', label: 'Deactivate My Account' },
      { key: 'other', label: 'Other (Please Specify)' },
    ],
  },
].map((category) => ({
  ...category,
  subcategories: category.subcategories.some((reason) => reason.key === 'other')
    ? category.subcategories
    : [...category.subcategories, { key: 'other', label: 'Other / Custom Reason' }],
}))

export const walletAdjustmentReasons = {
  credit: [
    'Admin wallet recharge',
    'Payment gateway recharge correction',
    'Shipment charge refund',
    'COD remittance adjustment',
    'Promotional credit',
    'Invoice credit / waiver',
  ],
  debit: [
    'Admin wallet debit',
    'B2C shipment charge adjustment',
    'B2B shipment charge adjustment',
    'Weight discrepancy charge',
    'RTO / reverse shipment charge',
    'Invoice adjustment',
    'Incorrect wallet credit reversal',
  ],
}

export const kycRejectionReasons = [
  'Document is unclear or unreadable',
  'Document has expired',
  'Name or business details do not match',
  'Document is incomplete',
  'Invalid document type',
  'GST/PAN details could not be verified',
  'Duplicate or altered document',
]

export const kycRevocationReasons = [
  'KYC information has changed',
  'Periodic re-verification required',
  'Document has expired',
  'Verification mismatch detected',
  'Compliance review required',
]

export const bankRejectionReasons = [
  'Account holder name does not match',
  'Invalid account number or IFSC',
  'Cancelled cheque is unclear',
  'Bank proof is incomplete',
  'Account is inactive or verification failed',
]
