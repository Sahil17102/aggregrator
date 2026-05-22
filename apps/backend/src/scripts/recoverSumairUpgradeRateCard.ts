import { randomUUID } from 'crypto'
import type { PoolClient } from 'pg'
import { pool } from '../models/client'

const TARGET_PLAN_NAME = 'SUMAIR-UPGRD'
const SOURCE_PLAN_NAME = 'SUMAIR1'
const DELIVERY_ONE_PROVIDER = 'deliveryone'
const DELIVERY_ONE_SURFACE_ID = 99
const DELIVERY_ONE_SURFACE_NAME = 'Delhivery Surface'
const DELIVERY_ONE_SURFACE_MODE = 'surface'

const dryRun =
  process.argv.includes('--dry-run') ||
  ['1', 'true', 'yes'].includes(
    String(process.env.RECOVER_SUMAIR_UPGRADE_DRY_RUN || '').trim().toLowerCase(),
  )

const confirmed =
  process.argv.includes('--confirm') ||
  ['1', 'true', 'yes'].includes(
    String(process.env.RECOVER_SUMAIR_UPGRADE_CONFIRM || '').trim().toLowerCase(),
  )

type PlanRow = {
  id: string
  name: string
}

type RateRow = {
  id: string
  plan_id: string
  zone_id: string
  type: string
  rate: string
  min_weight: string
  cod_charges: string | null
  cod_percent: string | null
  other_charges: string | null
}

type SlabRow = {
  weight_from: string | number
  weight_to: string | number | null
  rate: string | number
  extra_rate: string | number | null
  extra_weight_unit: string | number | null
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toDecimalString = (value: unknown, digits: number) => toNumber(value).toFixed(digits)

const createSnapshotTable = async (client: PoolClient) => {
  await client.query(`
    create table if not exists rate_card_recovery_snapshots (
      id uuid primary key,
      recovery_key text not null,
      target_plan_name text not null,
      source_plan_name text not null,
      snapshot jsonb not null,
      created_at timestamp default now()
    )
  `)
}

const findPlan = async (client: PoolClient, name: string) => {
  const result = await client.query<PlanRow>(
    `
      select id, name
      from plans
      where lower(trim(name)) = lower(trim($1))
      limit 1
    `,
    [name],
  )

  return result.rows[0] || null
}

const fetchBestSourceRate = async (client: PoolClient, sourcePlanId: string) => {
  const result = await client.query<RateRow & { slab_count: number }>(
    `
      select
        sr.*,
        count(srs.id)::int as slab_count
      from shipping_rates sr
      left join shipping_rate_slabs srs on srs.shipping_rate_id = sr.id
      where sr.plan_id = $1
        and sr.business_type = 'b2c'
        and lower(trim(coalesce(sr.service_provider, ''))) = $2
      group by sr.id
      having count(srs.id) > 1
      order by count(srs.id) desc, max(sr.last_updated) desc nulls last, max(sr.created_at) desc nulls last
      limit 1
    `,
    [sourcePlanId, DELIVERY_ONE_PROVIDER],
  )

  return result.rows[0] || null
}

const fetchTargetRate = async (
  client: PoolClient,
  targetPlanId: string,
  sourceRate: Pick<RateRow, 'zone_id' | 'type'>,
) => {
  const result = await client.query<RateRow>(
    `
      select *
      from shipping_rates
      where plan_id = $1
        and business_type = 'b2c'
        and lower(trim(coalesce(service_provider, ''))) = $2
        and courier_id = $3
        and lower(trim(mode)) = $4
        and zone_id = $5
        and type = $6
      order by last_updated desc nulls last, created_at desc nulls last
      limit 1
    `,
    [
      targetPlanId,
      DELIVERY_ONE_PROVIDER,
      DELIVERY_ONE_SURFACE_ID,
      DELIVERY_ONE_SURFACE_MODE,
      sourceRate.zone_id,
      sourceRate.type,
    ],
  )

  return result.rows[0] || null
}

const fetchSlabs = async (client: PoolClient, rateId: string) => {
  const result = await client.query<SlabRow>(
    `
      select weight_from, weight_to, rate, extra_rate, extra_weight_unit
      from shipping_rate_slabs
      where shipping_rate_id = $1
      order by weight_from::numeric, weight_to::numeric nulls last, created_at
    `,
    [rateId],
  )

  return result.rows
}

const snapshotTarget = async (client: PoolClient, targetPlanId: string, sourcePlanId: string) => {
  const snapshot = await client.query(
    `
      select jsonb_build_object(
        'captured_at', now(),
        'target_plan_id', $1::uuid,
        'source_plan_id', $2::uuid,
        'rates', coalesce(jsonb_agg(
          jsonb_build_object(
            'rate', to_jsonb(sr),
            'weight_slabs', coalesce((
              select jsonb_agg(to_jsonb(srs) order by srs.weight_from::numeric, srs.weight_to::numeric nulls last)
              from shipping_rate_slabs srs
              where srs.shipping_rate_id = sr.id
            ), '[]'::jsonb),
            'cod_slabs', coalesce((
              select jsonb_agg(to_jsonb(cod) order by cod.amount_from::numeric, cod.amount_to::numeric nulls last)
              from shipping_rate_cod_slabs cod
              where cod.shipping_rate_id = sr.id
            ), '[]'::jsonb)
          )
          order by sr.created_at
        ), '[]'::jsonb)
      ) as snapshot
      from shipping_rates sr
      where sr.plan_id = $1
    `,
    [targetPlanId, sourcePlanId],
  )

  await client.query(
    `
      insert into rate_card_recovery_snapshots (
        id,
        recovery_key,
        target_plan_name,
        source_plan_name,
        snapshot
      )
      values ($1, $2, $3, $4, $5)
    `,
    [
      randomUUID(),
      'sumair-upgrade-rate-card',
      TARGET_PLAN_NAME,
      SOURCE_PLAN_NAME,
      snapshot.rows[0]?.snapshot || {},
    ],
  )
}

const buildRecoveredSlabs = (targetSlabs: SlabRow[], sourceSlabs: SlabRow[]) => {
  if (!sourceSlabs.length) return targetSlabs
  if (!targetSlabs.length) return sourceSlabs

  const firstTarget = targetSlabs[0]
  const firstTargetEnd = firstTarget.weight_to === null ? null : toNumber(firstTarget.weight_to)
  if (firstTargetEnd === null) return sourceSlabs

  const recovered: SlabRow[] = [
    {
      ...firstTarget,
      extra_rate: null,
      extra_weight_unit: null,
    },
  ]

  for (const source of sourceSlabs) {
    const sourceFrom = toNumber(source.weight_from)
    const sourceTo = source.weight_to === null ? null : toNumber(source.weight_to)

    if (sourceTo !== null && sourceTo <= firstTargetEnd) continue

    recovered.push({
      ...source,
      weight_from: sourceFrom < firstTargetEnd ? firstTargetEnd : source.weight_from,
      extra_rate: null,
      extra_weight_unit: null,
    })
  }

  if (recovered.length > 1) {
    const finalSourceSlab = sourceSlabs[sourceSlabs.length - 1]
    recovered[recovered.length - 1] = {
      ...recovered[recovered.length - 1],
      extra_rate: finalSourceSlab.extra_rate,
      extra_weight_unit: finalSourceSlab.extra_weight_unit,
    }
  }

  return recovered
}

async function main() {
  if (!dryRun && !confirmed) {
    throw new Error(
      'Refusing to recover without confirmation. Re-run with --confirm or RECOVER_SUMAIR_UPGRADE_CONFIRM=true. Use --dry-run to preview.',
    )
  }

  const client = await pool.connect()

  try {
    await client.query('begin')
    await createSnapshotTable(client)

    const targetPlan = await findPlan(client, TARGET_PLAN_NAME)
    const sourcePlan = await findPlan(client, SOURCE_PLAN_NAME)
    if (!targetPlan) throw new Error(`${TARGET_PLAN_NAME} plan was not found`)
    if (!sourcePlan) throw new Error(`${SOURCE_PLAN_NAME} plan was not found`)

    const sourceRate = await fetchBestSourceRate(client, sourcePlan.id)
    if (!sourceRate) {
      throw new Error(`${SOURCE_PLAN_NAME} does not have a multi-slab DeliveryOne B2C source row`)
    }

    const targetRate = await fetchTargetRate(client, targetPlan.id, sourceRate)
    if (!targetRate) {
      throw new Error(`${TARGET_PLAN_NAME} does not have a matching DeliveryOne Surface target row`)
    }

    const [sourceSlabs, targetSlabs] = await Promise.all([
      fetchSlabs(client, sourceRate.id),
      fetchSlabs(client, targetRate.id),
    ])
    const recoveredSlabs = buildRecoveredSlabs(targetSlabs, sourceSlabs)

    if (recoveredSlabs.length <= targetSlabs.length) {
      throw new Error(
        `Recovery would not add slabs: target=${targetSlabs.length}, recovered=${recoveredSlabs.length}`,
      )
    }

    await snapshotTarget(client, targetPlan.id, sourcePlan.id)

    await client.query(
      `
        update shipping_rates
        set
          service_provider = $1,
          courier_id = $2,
          courier_name = $3,
          mode = $4,
          rate = $5,
          min_weight = $6,
          last_updated = now()
        where id = $7
      `,
      [
        DELIVERY_ONE_PROVIDER,
        DELIVERY_ONE_SURFACE_ID,
        DELIVERY_ONE_SURFACE_NAME,
        DELIVERY_ONE_SURFACE_MODE,
        toDecimalString(recoveredSlabs[0]?.rate, 2),
        toDecimalString(recoveredSlabs[0]?.weight_from, 3),
        targetRate.id,
      ],
    )

    await client.query('delete from shipping_rate_slabs where shipping_rate_id = $1', [targetRate.id])

    for (const slab of recoveredSlabs) {
      await client.query(
        `
          insert into shipping_rate_slabs (
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
          values ($1, $2, $3, $4, $5, $6, $7, now(), now())
        `,
        [
          randomUUID(),
          targetRate.id,
          toDecimalString(slab.weight_from, 3),
          slab.weight_to === null ? null : toDecimalString(slab.weight_to, 3),
          toDecimalString(slab.rate, 2),
          slab.extra_rate === null ? null : toDecimalString(slab.extra_rate, 2),
          slab.extra_weight_unit === null ? null : toDecimalString(slab.extra_weight_unit, 3),
        ],
      )
    }

    if (dryRun) {
      await client.query('rollback')
    } else {
      await client.query('commit')
    }

    console.log(
      JSON.stringify(
        {
          mode: dryRun ? 'dry-run rolled back' : 'committed',
          targetPlan: targetPlan.name,
          sourcePlan: sourcePlan.name,
          targetRateId: targetRate.id,
          sourceRateId: sourceRate.id,
          beforeSlabs: targetSlabs.length,
          afterSlabs: recoveredSlabs.length,
          recoveredSlabs,
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
