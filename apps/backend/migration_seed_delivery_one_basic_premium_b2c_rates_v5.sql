CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_data_migrations (
  key text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE
  v_basic_plan_id uuid;
  v_premium_plan_id uuid;
  v_zone record;
  v_plan record;
  v_rate_id uuid;
  v_is_kashmir boolean;
  v_slab_rates numeric[];
  v_extra_rate numeric(10, 2);
  v_extra_weight_unit numeric(10, 3);
  v_slab_index integer;
  v_weight_froms numeric[] := ARRAY[0.100, 0.500, 1.000, 2.000, 3.000, 4.000];
  v_weight_tos numeric[] := ARRAY[0.500, 1.000, 2.000, 3.000, 4.000, 5.000];
  v_rate_type text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM app_data_migrations
    WHERE key = 'seed_delivery_one_basic_premium_b2c_rates_v5'
  ) THEN
    RETURN;
  END IF;

  SELECT id INTO v_basic_plan_id
  FROM plans
  WHERE lower(trim(name)) = 'basic'
  ORDER BY created_at NULLS LAST
  LIMIT 1;

  IF v_basic_plan_id IS NULL THEN
    INSERT INTO plans (id, name, description, is_active, created_at)
    VALUES (gen_random_uuid(), 'Basic', 'Default B2C plan', true, now())
    RETURNING id INTO v_basic_plan_id;
  END IF;

  SELECT id INTO v_premium_plan_id
  FROM plans
  WHERE lower(trim(name)) = 'premium'
  ORDER BY created_at NULLS LAST
  LIMIT 1;

  IF v_premium_plan_id IS NULL THEN
    INSERT INTO plans (id, name, description, is_active, created_at)
    VALUES (gen_random_uuid(), 'Premium', 'Premium B2C plan', true, now())
    RETURNING id INTO v_premium_plan_id;
  END IF;

  INSERT INTO couriers (id, name, "serviceProvider", "isEnabled", business_type, created_at, updated_at)
  VALUES (99, 'Delhivery Surface', 'deliveryone', true, '["b2c"]'::jsonb, now(), now())
  ON CONFLICT (id, "serviceProvider") DO UPDATE SET
    name = EXCLUDED.name,
    "isEnabled" = true,
    business_type = EXCLUDED.business_type,
    updated_at = now();

  INSERT INTO meracourierwala_zones
    (id, code, name, description, region, business_type, metadata, states, created_at, updated_at)
  VALUES
    (
      gen_random_uuid(),
      'KASHMIR',
      'Kashmir',
      'Dedicated Kashmir and Ladakh B2C pricing zone.',
      'Kashmir',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '["Jammu and Kashmir", "Jammu & Kashmir", "Ladakh"]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'METRO_TO_METRO',
      'Metro to Metro',
      'Shipments between major metros across the network.',
      'Metro to Metro',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'ROI',
      'Rest of India',
      'Default outside-Kashmir B2C pricing zone.',
      'Rest of India',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'SPECIAL_ZONE',
      'Special Zone',
      'Special zones that need extra handling, excluding Kashmir/Ladakh.',
      'Special Zones',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'WITHIN_CITY',
      'Within City',
      'Shipments that stay within a single city boundary.',
      'Within City',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'WITHIN_REGION',
      'Within Region',
      'Shipments moving within neighbouring regions.',
      'Within Region',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      'WITHIN_STATE',
      'Within State',
      'Shipments moving within the same state.',
      'Within State',
      'B2C',
      '{"source":"choice-mee-image-rate-card-v5"}'::jsonb,
      '[]'::jsonb,
      now(),
      now()
    )
  ON CONFLICT (code, business_type) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    region = EXCLUDED.region,
    metadata = EXCLUDED.metadata,
    states = EXCLUDED.states,
    updated_at = now();

  DELETE FROM shipping_rate_cod_slabs
  WHERE shipping_rate_id IN (
    SELECT id
    FROM shipping_rates
    WHERE lower(trim(business_type)) = 'b2c'
      AND plan_id IN (v_basic_plan_id, v_premium_plan_id)
      AND courier_id IN (99, 100)
      AND (
        lower(coalesce(service_provider, '')) IN ('deliveryone', 'delhivery')
        OR lower(trim(courier_name)) LIKE '%delivery%one%'
        OR lower(trim(courier_name)) LIKE '%delhivery%'
      )
  );

  DELETE FROM shipping_rate_slabs
  WHERE shipping_rate_id IN (
    SELECT id
    FROM shipping_rates
    WHERE lower(trim(business_type)) = 'b2c'
      AND plan_id IN (v_basic_plan_id, v_premium_plan_id)
      AND courier_id IN (99, 100)
      AND (
        lower(coalesce(service_provider, '')) IN ('deliveryone', 'delhivery')
        OR lower(trim(courier_name)) LIKE '%delivery%one%'
        OR lower(trim(courier_name)) LIKE '%delhivery%'
      )
  );

  DELETE FROM shipping_rates
  WHERE lower(trim(business_type)) = 'b2c'
    AND plan_id IN (v_basic_plan_id, v_premium_plan_id)
    AND courier_id IN (99, 100)
    AND (
      lower(coalesce(service_provider, '')) IN ('deliveryone', 'delhivery')
      OR lower(trim(courier_name)) LIKE '%delivery%one%'
      OR lower(trim(courier_name)) LIKE '%delhivery%'
    );

  FOR v_plan IN
    SELECT v_basic_plan_id AS id, 'Basic' AS name
    UNION ALL
    SELECT v_premium_plan_id AS id, 'Premium' AS name
  LOOP
    FOR v_zone IN
      SELECT id, code, name
      FROM meracourierwala_zones
      WHERE lower(trim(business_type)) = 'b2c'
    LOOP
      v_is_kashmir :=
        lower(trim(v_zone.code)) = 'kashmir'
        OR lower(trim(v_zone.name)) = 'kashmir';

      IF v_is_kashmir THEN
        IF v_plan.name = 'Premium' THEN
          v_slab_rates := ARRAY[70.00, 85.00, 115.00, 165.00, 200.00, 225.00];
          v_extra_rate := 25.00;
          v_extra_weight_unit := 2.000;
        ELSE
          v_slab_rates := ARRAY[80.00, 100.00, 150.00, 200.00, 230.00, 260.00];
          v_extra_rate := 20.00;
          v_extra_weight_unit := 1.000;
        END IF;
      ELSIF v_plan.name = 'Premium' THEN
        v_slab_rates := ARRAY[85.00, 115.00, 180.00, 250.00, 300.00, 360.00];
        v_extra_rate := 40.00;
        v_extra_weight_unit := 1.000;
      ELSE
        v_slab_rates := ARRAY[95.00, 140.00, 195.00, 260.00, 320.00, 380.00];
        v_extra_rate := 50.00;
        v_extra_weight_unit := 1.000;
      END IF;

      FOR v_rate_type IN SELECT 'forward' UNION ALL SELECT 'rto'
      LOOP
        v_rate_id := gen_random_uuid();

        INSERT INTO shipping_rates
          (
            id,
            plan_id,
            service_provider,
            cod_charges,
            cod_percent,
            other_charges,
            rate,
            last_updated,
            courier_id,
            courier_name,
            mode,
            business_type,
            min_weight,
            zone_id,
            type,
            created_at
          )
        VALUES
          (
            v_rate_id,
            v_plan.id,
            'deliveryone',
            40.00,
            2.00,
            0.00,
            v_slab_rates[1],
            now(),
            99,
            'Delhivery Surface',
            'Surface',
            'b2c',
            0.50,
            v_zone.id,
            v_rate_type,
            now()
          );

        FOR v_slab_index IN 1..array_length(v_slab_rates, 1)
        LOOP
          INSERT INTO shipping_rate_slabs
            (
              id,
              shipping_rate_id,
              weight_from,
              weight_to,
              rate,
              extra_rate,
              extra_weight_unit,
              created_at,
              updated_at
            )
          VALUES
            (
              gen_random_uuid(),
              v_rate_id,
              v_weight_froms[v_slab_index],
              v_weight_tos[v_slab_index],
              v_slab_rates[v_slab_index],
              CASE WHEN v_slab_index = array_length(v_slab_rates, 1) THEN v_extra_rate ELSE NULL END,
              CASE WHEN v_slab_index = array_length(v_slab_rates, 1) THEN v_extra_weight_unit ELSE NULL END,
              now(),
              now()
            );
        END LOOP;

        INSERT INTO shipping_rate_cod_slabs
          (id, shipping_rate_id, amount_from, amount_to, charge_type, charge_value, created_at, updated_at)
        VALUES
          (gen_random_uuid(), v_rate_id, 0.00, 2000.00, 'flat', 40.00, now(), now()),
          (gen_random_uuid(), v_rate_id, 2000.00, NULL, 'percent', 2.00, now(), now());
      END LOOP;
    END LOOP;
  END LOOP;

  INSERT INTO app_data_migrations (key)
  VALUES ('seed_delivery_one_basic_premium_b2c_rates_v5')
  ON CONFLICT (key) DO NOTHING;
END $$;
