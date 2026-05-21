/**
 * COD Settlement Flow - Integration Test
 * Tests the complete flow from order delivery to offline COD settlement
 */

import { db } from './src/models/client'
import { codRemittances } from './src/models/schema/codRemittance'
import { eq } from 'drizzle-orm'
import {
  createCodRemittance,
  markCodRemittanceSettledOffline,
  getCodRemittanceStats,
} from './src/models/services/codRemittance.service'

async function testCodSettlementFlow() {
  console.log('🧪 Starting COD Settlement Flow Test...\n')

  const testUserId = 'test-user-123'
  const testOrderId = 'test-order-' + Date.now()
  const testOrderNumber = 'ORD-TEST-' + Date.now()

  try {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Create COD Remittance (Order Delivered)
    // ═══════════════════════════════════════════════════════════════
    console.log('📦 STEP 1: Creating COD remittance (simulating order delivery)...')

    const { remittance } = await createCodRemittance({
      orderId: testOrderId,
      orderType: 'b2c',
      userId: testUserId,
      orderNumber: testOrderNumber,
      awbNumber: 'TEST-AWB-' + Date.now(),
      courierPartner: 'nimbuspost',
      codAmount: 1500,
      codCharges: 30,
      freightCharges: 50,
      collectedAt: new Date(),
    })

    console.log('✅ Remittance created:', {
      id: remittance.id,
      orderNumber: remittance.orderNumber,
      codAmount: remittance.codAmount,
      deductions: remittance.deductions,
      remittableAmount: remittance.remittableAmount,
      status: remittance.status,
    })

    if (remittance.status !== 'pending') {
      throw new Error('❌ Expected status to be "pending" but got: ' + remittance.status)
    }

    console.log('✅ Status is correctly set to "pending"')
    console.log('✅ Wallet NOT credited yet (real-world flow)\n')

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Check User Stats (Should show pending)
    // ═══════════════════════════════════════════════════════════════
    console.log('📊 STEP 2: Checking user COD stats...')

    const stats = await getCodRemittanceStats(testUserId)

    console.log('Stats:', {
      remittedTillDate: stats.remittedTillDate,
      lastRemittance: stats.lastRemittance,
      nextRemittance: stats.nextRemittance,
      totalDue: stats.totalDue,
      pendingCount: stats.pendingCount,
      creditedCount: stats.creditedCount,
    })

    if (stats.pendingCount === 0) {
      throw new Error('❌ Expected pending count > 0')
    }

    console.log('✅ Pending remittance showing in stats\n')

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Simulate Courier Settlement (Admin Marks Offline Settlement)
    // ═══════════════════════════════════════════════════════════════
    console.log('💰 STEP 3: Simulating courier settlement...')
    console.log('(In real world: Courier sends ₹1420 to your bank after 7-15 days)')
    console.log('Admin now marks the seller settlement as paid offline...\n')

    const settledDate = new Date()
    const utrNumber = 'TEST-UTR-' + Date.now()

    const creditedRemittance = await markCodRemittanceSettledOffline({
      remittanceId: remittance.id,
      settledDate,
      utrNumber,
      settledAmount: Number(remittance.remittableAmount),
      notes: 'Test settlement from integration test',
      creditedBy: 'test-admin',
    })

    console.log('✅ Remittance settled offline:', {
      id: creditedRemittance.id,
      status: creditedRemittance.status,
      creditedAt: creditedRemittance.creditedAt,
      walletTransactionId: creditedRemittance.walletTransactionId,
      notes: creditedRemittance.notes,
    })

    if (creditedRemittance.status !== 'credited') {
      throw new Error('❌ Expected status to be "credited"')
    }

    console.log('✅ Status changed to "credited"\n')

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Verify Wallet Was Not Credited
    // ═══════════════════════════════════════════════════════════════
    console.log('💵 STEP 4: Verifying no wallet transaction was created...')

    if (creditedRemittance.walletTransactionId !== null) {
      throw new Error('❌ Offline COD settlement should not create a wallet transaction')
    }

    console.log('✅ Wallet transaction reference stayed null\n')

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Verify Final Stats
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📊 STEP 5: Checking final stats...')

    const finalStats = await getCodRemittanceStats(testUserId)

    console.log('Final Stats:', {
      remittedTillDate: finalStats.remittedTillDate,
      creditedCount: finalStats.creditedCount,
      pendingCount: finalStats.pendingCount,
    })

    if (finalStats.creditedCount === 0) {
      throw new Error('❌ Expected credited count > 0')
    }

    console.log('✅ Stats updated correctly\n')

    // ═══════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════
    console.log('🧹 Cleaning up test data...')

    await db.delete(codRemittances).where(eq(codRemittances.id, remittance.id))

    console.log('✅ Test data cleaned up\n')

    // ═══════════════════════════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ ALL TESTS PASSED! COD Settlement Flow Working Correctly')
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log('✅ Flow Summary:')
    console.log('  1. Order delivered → COD remittance created with "pending" status')
    console.log('  2. No wallet transaction is created (real-world flow)')
    console.log('  3. Courier settles → Admin marks settlement paid offline')
    console.log('  4. Status updated to "credited"')
    console.log('  5. Wallet transaction is not created')
    console.log('  6. Stats updated correctly\n')

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run the test
testCodSettlementFlow()
