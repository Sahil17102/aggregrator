process.env.B2C_RATECARD_PROVIDER = 'deliveryone'
process.env.B2C_RATECARD_COURIER_ID = process.env.B2C_RATECARD_COURIER_ID || '100'
process.env.B2C_RATECARD_COURIER_NAME =
  process.env.B2C_RATECARD_COURIER_NAME || 'Delhivery Express'
process.env.B2C_RATECARD_MODE = process.env.B2C_RATECARD_MODE || 'Express'

void import('./seedDelhiveryB2CRatecard')
