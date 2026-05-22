import { pool } from '../models/client'

type CourierRow = {
  id: number
  name: string
  serviceProvider: string
  isEnabled: boolean
  businessType: unknown
}

type EnabledSummaryRow = {
  serviceProvider: string
  enabledCount: string
}

const LEGACY_SEEDED_DELHIVERY_IDS = new Set([99, 100])

const normalizeProvider = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const parseIdList = (value: unknown) =>
  String(value ?? '')
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)

const uniqueSorted = (values: number[]) => Array.from(new Set(values)).sort((a, b) => a - b)

const chooseActiveDelhiveryIds = (rows: CourierRow[]) => {
  const envIds = parseIdList(
    process.env.ACTIVE_DELHIVERY_COURIER_IDS || process.env.VISIBLE_DELHIVERY_COURIER_IDS,
  )
  if (envIds.length) return uniqueSorted(envIds)

  const delhiveryRows = rows.filter(
    (row) => normalizeProvider(row.serviceProvider) === 'delhivery',
  )
  const enabledCustomIds = delhiveryRows
    .filter((row) => row.isEnabled && !LEGACY_SEEDED_DELHIVERY_IDS.has(Number(row.id)))
    .map((row) => Number(row.id))
  if (enabledCustomIds.length) return uniqueSorted(enabledCustomIds)

  const customIds = delhiveryRows
    .filter((row) => !LEGACY_SEEDED_DELHIVERY_IDS.has(Number(row.id)))
    .map((row) => Number(row.id))
  if (customIds.length) return uniqueSorted(customIds)

  const enabledIds = delhiveryRows
    .filter((row) => row.isEnabled)
    .map((row) => Number(row.id))
  if (enabledIds.length) return uniqueSorted(enabledIds)

  return uniqueSorted(delhiveryRows.map((row) => Number(row.id)))
}

const fetchEnabledSummary = async () => {
  const result = await pool.query<EnabledSummaryRow>(`
    select
      "serviceProvider" as "serviceProvider",
      count(*)::text as "enabledCount"
    from couriers
    where "isEnabled" = true
    group by "serviceProvider"
    order by "serviceProvider"
  `)

  return result.rows
}

async function main() {
  const client = await pool.connect()

  try {
    const beforeSummary = await fetchEnabledSummary()
    const courierResult = await client.query<CourierRow>(`
      select
        id,
        name,
        "serviceProvider" as "serviceProvider",
        "isEnabled" as "isEnabled",
        business_type as "businessType"
      from couriers
      order by "serviceProvider", id
    `)

    const activeDelhiveryIds = chooseActiveDelhiveryIds(courierResult.rows)
    if (!activeDelhiveryIds.length) {
      throw new Error('No delhivery courier rows were found to keep active.')
    }

    const missingIds = activeDelhiveryIds.filter(
      (id) =>
        !courierResult.rows.some(
          (row) => Number(row.id) === id && normalizeProvider(row.serviceProvider) === 'delhivery',
        ),
    )
    if (missingIds.length) {
      throw new Error(`Active Delhivery courier IDs not found: ${missingIds.join(', ')}`)
    }

    await client.query('begin')

    await client.query(
      `
        update couriers
        set "isEnabled" = false, updated_at = now()
        where lower(trim("serviceProvider")) <> 'delhivery'
           or not (id = any($1::int[]))
      `,
      [activeDelhiveryIds],
    )

    await client.query(
      `
        update couriers
        set
          "isEnabled" = true,
          business_type = case
            when business_type @> '["b2c"]'::jsonb then business_type
            else business_type || '["b2c"]'::jsonb
          end,
          updated_at = now()
        where lower(trim("serviceProvider")) = 'delhivery'
          and id = any($1::int[])
      `,
      [activeDelhiveryIds],
    )

    await client.query(
      `
        update shipping_rates
        set service_provider = 'delhivery', last_updated = now()
        where courier_id = any($1::int[])
          and (
            service_provider is null
            or lower(trim(service_provider)) in (
              '',
              'delhivery',
              'deliveryone',
              'delivery1',
              'delhiveryone'
            )
          )
      `,
      [activeDelhiveryIds],
    )

    await client.query(
      `
        update shipping_rates
        set min_weight = '0.50', last_updated = now()
        where courier_id = any($1::int[])
          and lower(trim(coalesce(service_provider, ''))) = 'delhivery'
          and lower(trim(business_type)) = 'b2c'
          and min_weight::numeric > 0.5
      `,
      [activeDelhiveryIds],
    )

    await client.query(
      `
        with active_rates as (
          select
            sr.id,
            sr.rate,
            first_slab.weight_from as first_weight_to,
            first_slab.extra_rate,
            first_slab.extra_weight_unit
          from shipping_rates sr
          join couriers c
            on c.id = sr.courier_id
           and c."serviceProvider" = sr.service_provider
           and c."isEnabled" = true
          left join lateral (
            select weight_from, extra_rate, extra_weight_unit
            from shipping_rate_slabs
            where shipping_rate_id = sr.id
            order by weight_from::numeric asc
            limit 1
          ) first_slab on true
          where sr.courier_id = any($1::int[])
            and lower(trim(coalesce(sr.service_provider, ''))) = 'delhivery'
            and lower(trim(sr.business_type)) = 'b2c'
            and first_slab.weight_from::numeric > 0.5
            and not exists (
              select 1
              from shipping_rate_slabs existing
              where existing.shipping_rate_id = sr.id
                and existing.weight_from::numeric <= 0.5
                and (
                  existing.weight_to is null
                  or existing.weight_to::numeric >= 0.5
                )
            )
        )
        insert into shipping_rate_slabs (
          shipping_rate_id,
          weight_from,
          weight_to,
          rate,
          extra_rate,
          extra_weight_unit,
          created_at,
          updated_at
        )
        select
          id,
          '0.100',
          first_weight_to,
          rate,
          extra_rate,
          extra_weight_unit,
          now(),
          now()
        from active_rates
      `,
      [activeDelhiveryIds],
    )

    await client.query(`
      insert into courier_credentials (
        provider,
        api_base,
        client_name,
        api_key,
        client_id,
        username,
        password,
        webhook_secret,
        created_at,
        updated_at
      )
      select
        'delhivery',
        api_base,
        client_name,
        api_key,
        client_id,
        username,
        password,
        webhook_secret,
        now(),
        now()
      from courier_credentials source
      where lower(source.provider) = 'deliveryone'
        and not exists (
          select 1 from courier_credentials existing
          where lower(existing.provider) = 'delhivery'
        )
      limit 1
    `)

    await client.query(`
      update courier_credentials target
      set
        api_base = coalesce(nullif(target.api_base, ''), source.api_base),
        client_name = coalesce(nullif(target.client_name, ''), source.client_name),
        api_key = coalesce(nullif(target.api_key, ''), source.api_key),
        client_id = coalesce(nullif(target.client_id, ''), source.client_id),
        username = coalesce(nullif(target.username, ''), source.username),
        password = coalesce(nullif(target.password, ''), source.password),
        webhook_secret = coalesce(nullif(target.webhook_secret, ''), source.webhook_secret),
        updated_at = now()
      from courier_credentials source
      where lower(target.provider) = 'delhivery'
        and lower(source.provider) = 'deliveryone'
    `)

    await client.query('commit')

    const afterSummary = await fetchEnabledSummary()
    const activeRows = courierResult.rows
      .filter(
        (row) =>
          normalizeProvider(row.serviceProvider) === 'delhivery' &&
          activeDelhiveryIds.includes(Number(row.id)),
      )
      .map((row) => ({
        id: row.id,
        name: row.name,
        serviceProvider: row.serviceProvider,
      }))

    console.log(
      JSON.stringify(
        {
          activeDelhiveryIds,
          activeRows,
          beforeSummary,
          afterSummary,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    await client.query('rollback').catch(() => undefined)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
