import { pool } from '../models/client'

const commissionPlans = Array.from({ length: 13 }, (_, index) => ({
  name: `Plan ${String.fromCharCode(65 + index)}`,
  commission: 10 + index * 5,
}))

async function applyPlanCommissionMigration() {
  const client = await pool.connect()
  try {
    await client.query(`
      ALTER TABLE plans
      ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0
    `)

    for (const plan of commissionPlans) {
      await client.query(
        `
          INSERT INTO plans (name, description, commission_percentage, is_active)
          SELECT $1, $2, $3, true
          WHERE NOT EXISTS (SELECT 1 FROM plans WHERE lower(name) = lower($1))
        `,
        [plan.name, `${plan.commission}% commission on courier cost`, plan.commission],
      )
    }

    console.log('Plan commission migration complete: Plan A (10%) through Plan M (70%).')
  } finally {
    client.release()
    await pool.end()
  }
}

applyPlanCommissionMigration().catch((error) => {
  console.error('Plan commission migration failed:', error)
  process.exit(1)
})
