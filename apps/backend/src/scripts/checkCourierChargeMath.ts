import assert from 'node:assert/strict'
import { computeB2CCodCharge } from '../models/services/b2cRateCard.service'
import { calculateFinalCourierCharge } from '../models/services/shiprocket.service'

const slabbedRateCard = {
  cod_charges: 40,
  cod_percent: 2,
  cod_slabs: [
    {
      amount_from: 0,
      amount_to: 2000,
      charge_type: 'flat' as const,
      charge_value: 40,
    },
    {
      amount_from: 2000,
      amount_to: null,
      charge_type: 'percent' as const,
      charge_value: 2,
    },
  ],
}

const legacyRateCard = {
  cod_charges: 40,
  cod_percent: 2,
  cod_slabs: [],
}

const codCases = [
  { payment_type: 'cod', basis: 1999, expected: 40, label: 'COD Rs 1,999' },
  { payment_type: 'cod', basis: 2000, expected: 40, label: 'COD Rs 2,000' },
  { payment_type: 'cod', basis: 2500, expected: 50, label: 'COD Rs 2,500' },
  { payment_type: 'cod', basis: 5000, expected: 100, label: 'COD Rs 5,000' },
  { payment_type: 'prepaid', basis: 5000, expected: 0, label: 'Prepaid Rs 5,000' },
]

for (const item of codCases) {
  const result = computeB2CCodCharge({
    payment_type: item.payment_type,
    cod_charge_basis: item.basis,
    rateCard: slabbedRateCard,
  })
  assert.equal(result.cod_charges, item.expected, item.label)
  console.log(`${item.label} => Rs ${result.cod_charges}`)
}

const legacyFallback = computeB2CCodCharge({
  payment_type: 'cod',
  cod_charge_basis: 2500,
  rateCard: legacyRateCard,
})
assert.equal(legacyFallback.cod_charges, 50, 'Legacy fallback Rs 2,500')
console.log(`Legacy fallback 40 or 2% at Rs 2,500 => Rs ${legacyFallback.cod_charges}`)

const codFinal = calculateFinalCourierCharge({
  platformFreight: 80,
  providerQuote: 95,
  codCharge: 50,
  otherCharges: 0,
  paymentType: 'cod',
})
assert.equal(codFinal.seller_freight_charge, 80)
assert.equal(codFinal.provider_quote_charge, 95)
assert.equal(codFinal.final_courier_charge, 130)
console.log(
  `Final COD charge formula: platform Rs 80 + COD Rs 50, provider quote tracked separately Rs 95 => Rs ${codFinal.final_courier_charge}`,
)

const prepaidFinal = calculateFinalCourierCharge({
  platformFreight: 80,
  providerQuote: 95,
  codCharge: 50,
  otherCharges: 0,
  paymentType: 'prepaid',
})
assert.equal(prepaidFinal.seller_freight_charge, 80)
assert.equal(prepaidFinal.provider_quote_charge, 95)
assert.equal(prepaidFinal.final_courier_charge, 80)
console.log(
  `Final prepaid charge formula: platform Rs 80, provider quote tracked separately Rs 95 => Rs ${prepaidFinal.final_courier_charge}`,
)

console.log('PASS: courier charge math checks passed')
