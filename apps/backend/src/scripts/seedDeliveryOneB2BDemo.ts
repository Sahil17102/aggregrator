import { pool } from '../models/client'

const SOURCE = 'delivery-one-b2b-demo-v1'

const main = async () => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      INSERT INTO couriers (id, name, "serviceProvider", "isEnabled", business_type, created_at, updated_at)
      VALUES (99, 'Delhivery Surface', 'deliveryone', true, '["b2c","b2b"]'::jsonb, now(), now())
      ON CONFLICT (id, "serviceProvider") DO UPDATE SET
        name = EXCLUDED.name,
        "isEnabled" = true,
        business_type = EXCLUDED.business_type,
        updated_at = now()
    `)

    await client.query(`
      INSERT INTO meracourierwala_zones
        (code, name, description, region, business_type, metadata, states, created_at, updated_at)
      VALUES
        ('NORTH', 'North India', 'Demo B2B North zone', 'North', 'B2B', $1::jsonb, '["Delhi","Haryana","Punjab","Himachal Pradesh","Uttarakhand","Uttar Pradesh","Jammu and Kashmir","Ladakh"]'::jsonb, now(), now()),
        ('SOUTH', 'South India', 'Demo B2B South zone', 'South', 'B2B', $1::jsonb, '["Telangana","Andhra Pradesh","Karnataka","Tamil Nadu","Kerala","Puducherry"]'::jsonb, now(), now()),
        ('WEST', 'West India', 'Demo B2B West zone', 'West', 'B2B', $1::jsonb, '["Maharashtra","Gujarat","Goa","Rajasthan"]'::jsonb, now(), now()),
        ('EAST', 'East India', 'Demo B2B East zone', 'East', 'B2B', $1::jsonb, '["West Bengal","Odisha","Bihar","Jharkhand"]'::jsonb, now(), now()),
        ('CENTRAL', 'Central India', 'Demo B2B Central zone', 'Central', 'B2B', $1::jsonb, '["Madhya Pradesh","Chhattisgarh"]'::jsonb, now(), now()),
        ('NORTHEAST', 'North East India', 'Demo B2B North East zone', 'North East', 'B2B', $1::jsonb, '["Assam","Arunachal Pradesh","Manipur","Meghalaya","Mizoram","Nagaland","Sikkim","Tripura"]'::jsonb, now(), now())
      ON CONFLICT (code, business_type) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        region = EXCLUDED.region,
        metadata = EXCLUDED.metadata,
        states = EXCLUDED.states,
        updated_at = now()
    `, [JSON.stringify({ source: SOURCE, demo: true })])

    await client.query(`
      DELETE FROM meracourierwala_b2b_zone_states
      WHERE service_provider = 'deliveryone' AND courier_id = 99
    `)
    await client.query(`
      INSERT INTO meracourierwala_b2b_zone_states
        (zone_id, state_name, courier_id, service_provider, created_at, updated_at)
      SELECT z.id, state_name, 99, 'deliveryone', now(), now()
      FROM meracourierwala_zones z
      CROSS JOIN LATERAL jsonb_array_elements_text(z.states) AS state_name
      WHERE z.business_type = 'B2B' AND z.metadata->>'source' = $1
    `, [SOURCE])

    await client.query(`
      DELETE FROM meracourierwala_b2b_pincodes
      WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1
    `, [SOURCE])
    await client.query(`
      INSERT INTO meracourierwala_b2b_pincodes
        (pincode, city, state, zone_id, courier_id, service_provider, metadata, created_at, updated_at)
      SELECT seed.pincode, seed.city, seed.state, z.id, 99, 'deliveryone', $1::jsonb, now(), now()
      FROM (VALUES
        ('500032', 'Hyderabad', 'Telangana', 'SOUTH'),
        ('110001', 'New Delhi', 'Delhi', 'NORTH'),
        ('126116', 'Jind', 'Haryana', 'NORTH')
      ) AS seed(pincode, city, state, zone_code)
      JOIN meracourierwala_zones z ON z.code = seed.zone_code AND z.business_type = 'B2B'
    `, [JSON.stringify({ source: SOURCE, demo: true })])

    await client.query(`
      DELETE FROM meracourierwala_b2b_zone_to_zone_rates
      WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1
    `, [SOURCE])
    await client.query(`
      INSERT INTO meracourierwala_b2b_zone_to_zone_rates
        (plan_id, origin_zone_id, destination_zone_id, courier_id, service_provider,
         rate_per_kg, volumetric_factor, effective_from, is_active, metadata, created_at, updated_at)
      SELECT p.id, oz.id, dz.id, 99, 'deliveryone',
        ROUND((CASE
          WHEN oz.id = dz.id THEN 8
          WHEN oz.code = 'NORTHEAST' OR dz.code = 'NORTHEAST' THEN 18
          WHEN oz.code IN ('NORTH','CENTRAL') AND dz.code IN ('NORTH','CENTRAL') THEN 11
          WHEN oz.code IN ('SOUTH','WEST') AND dz.code IN ('SOUTH','WEST') THEN 12
          ELSE 15
        END * CASE WHEN lower(p.name) = 'premium' THEN 0.9 ELSE 1 END)::numeric, 4),
        5000, now(), true, $1::jsonb, now(), now()
      FROM plans p
      CROSS JOIN meracourierwala_zones oz
      CROSS JOIN meracourierwala_zones dz
      WHERE lower(p.name) IN ('basic', 'premium')
        AND oz.business_type = 'B2B' AND dz.business_type = 'B2B'
        AND oz.metadata->>'source' = $2 AND dz.metadata->>'source' = $2
    `, [JSON.stringify({ source: SOURCE, demo: true, currency: 'INR', unit: 'kg' }), SOURCE])

    await client.query(`
      DELETE FROM meracourierwala_b2b_additional_charges
      WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1
    `, [SOURCE])
    await client.query(`
      INSERT INTO meracourierwala_b2b_additional_charges
        (plan_id, courier_id, service_provider, awb_charges, cft_factor,
         minimum_chargeable_amount, minimum_chargeable_weight, fuel_surcharge_percentage,
         oda_charges, oda_per_kg_charge, insurance_charge, metadata, created_at, updated_at)
      SELECT id, 99, 'deliveryone', 50, 5, 250, 10, 12, 750, 6, 100,
        $1::jsonb, now(), now()
      FROM plans WHERE lower(name) IN ('basic', 'premium')
    `, [JSON.stringify({ source: SOURCE, demo: true })])

    await client.query(`
      DELETE FROM meracourierwala_b2b_volumetric_rules
      WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1
    `, [SOURCE])
    await client.query(`
      INSERT INTO meracourierwala_b2b_volumetric_rules
        (courier_id, service_provider, volumetric_divisor, cft_factor,
         minimum_volumetric_weight, metadata, created_at, updated_at)
      VALUES (99, 'deliveryone', 5000, 5, 1, $1::jsonb, now(), now())
    `, [JSON.stringify({ source: SOURCE, demo: true })])

    await client.query('COMMIT')

    const summary = await client.query(`
      SELECT
        (SELECT count(*) FROM meracourierwala_zones WHERE business_type = 'B2B' AND metadata->>'source' = $1) AS zones,
        (SELECT count(*) FROM meracourierwala_b2b_zone_to_zone_rates WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1) AS rates,
        (SELECT count(*) FROM meracourierwala_b2b_additional_charges WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1) AS charge_cards,
        (SELECT count(*) FROM meracourierwala_b2b_pincodes WHERE service_provider = 'deliveryone' AND metadata->>'source' = $1) AS sample_pincodes
    `, [SOURCE])
    console.log('Delhivery B2B demo pricing seeded:', summary.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Delhivery B2B demo pricing seed failed:', error)
  process.exit(1)
})
