process.env.B2C_RATECARD_PROVIDER = 'deliveryone'
process.env.B2C_RATECARD_COURIER_ID = process.env.B2C_RATECARD_COURIER_ID || '99'
process.env.B2C_RATECARD_COURIER_NAME =
  process.env.B2C_RATECARD_COURIER_NAME || 'Delivery One Surface'

void import('./seedDelhiveryB2CRatecard')
