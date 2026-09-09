import { and, eq } from 'drizzle-orm'
import { db } from '../client'
import { addresses, pickupAddresses } from '../schema/pickupAddresses'
import { kyc } from '../schema/kyc'
import { userProfiles } from '../schema/userProfile'
import { users } from '../schema/users'
import type { CompanyInfo } from '../../types/profileBlocks.types'
import { getOrCreateWalletForUser } from './wallet.service'

type CompleteReadinessPayload = {
  companyAddress?: string
  pickup?: {
    addressLine1?: string
    addressLine2?: string
    addressNickname?: string
    city?: string
    state?: string
    pincode?: string
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    landmark?: string
  }
}

const clean = (value: unknown) => String(value ?? '').trim()

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    const normalized = clean(value)
    if (normalized) return normalized
  }
  return ''
}

const buildCompanyInfo = (
  companyInfo: Partial<CompanyInfo> | null | undefined,
  user: typeof users.$inferSelect,
  payload: CompleteReadinessPayload,
): CompanyInfo => {
  const contactEmail = firstText(companyInfo?.contactEmail, companyInfo?.companyEmail, user.email)
  const contactNumber = firstText(companyInfo?.contactNumber, companyInfo?.companyContactNumber, user.phone)
  const businessName = firstText(companyInfo?.businessName, companyInfo?.brandName, contactEmail, user.email)
  const contactPerson = firstText(companyInfo?.contactPerson, businessName, contactEmail, 'Seller')
  const companyAddress = firstText(payload.companyAddress, companyInfo?.companyAddress)

  return {
    businessName,
    brandName: firstText(companyInfo?.brandName, businessName),
    contactPerson,
    POCEmailVerified: Boolean(companyInfo?.POCEmailVerified || user.emailVerified || user.accountVerified),
    POCPhoneVerified: Boolean(companyInfo?.POCPhoneVerified || user.phoneVerified),
    companyAddress,
    pincode: firstText(payload.pickup?.pincode, companyInfo?.pincode),
    state: firstText(payload.pickup?.state, companyInfo?.state),
    city: firstText(payload.pickup?.city, companyInfo?.city),
    profilePicture: companyInfo?.profilePicture,
    contactNumber,
    contactEmail,
    companyContactNumber: firstText(companyInfo?.companyContactNumber, contactNumber),
    companyEmail: firstText(companyInfo?.companyEmail, contactEmail),
    companyLogoUrl: companyInfo?.companyLogoUrl,
    website: companyInfo?.website,
  }
}

const buildPickup = (
  companyInfo: CompanyInfo,
  user: typeof users.$inferSelect,
  payload: CompleteReadinessPayload,
) => {
  const pickup = payload.pickup || {}
  const addressLine1 = firstText(pickup.addressLine1, payload.companyAddress, companyInfo.companyAddress)
  const city = firstText(pickup.city, companyInfo.city)
  const state = firstText(pickup.state, companyInfo.state)
  const pincode = firstText(pickup.pincode, companyInfo.pincode)
  const contactPhone = firstText(pickup.contactPhone, companyInfo.contactNumber, user.phone)
  const contactEmail = firstText(pickup.contactEmail, companyInfo.contactEmail, user.email)
  const contactName = firstText(pickup.contactName, companyInfo.contactPerson, companyInfo.businessName)

  const missing = [
    ['pickup address', addressLine1],
    ['city', city],
    ['state', state],
    ['pincode', pincode],
    ['contact phone', contactPhone],
    ['contact name', contactName],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label)

  if (missing.length) {
    throw new Error(`Cannot enable orders. Missing ${missing.join(', ')}.`)
  }

  return {
    type: 'pickup',
    contactName,
    contactPhone,
    contactEmail,
    addressLine1,
    addressLine2: firstText(pickup.addressLine2),
    landmark: firstText(pickup.landmark),
    addressNickname: firstText(pickup.addressNickname, companyInfo.businessName, 'Default Warehouse'),
    city,
    state,
    country: 'India',
    pincode,
  }
}

export const completeMerchantOrderAccess = async (
  userId: string,
  payload: CompleteReadinessPayload = {},
) => {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) throw new Error('User not found')
  if (user.role === 'admin') throw new Error('Cannot enable orders for admin users')

  return db.transaction(async (tx) => {
    const [existingProfile] = await tx
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)

    const companyInfo = buildCompanyInfo(existingProfile?.companyInfo, user, payload)
    const pickup = buildPickup(companyInfo, user, payload)
    const now = new Date()

    if (existingProfile) {
      await tx
        .update(userProfiles)
        .set({
          approved: true,
          approvedAt: now,
          onboardingStep: -1,
          onboardingComplete: true,
          profileComplete: true,
          companyInfo,
          domesticKyc: { status: 'verified', updatedAt: now },
          rejectionReason: null,
        })
        .where(eq(userProfiles.userId, userId))
    } else {
      await tx.insert(userProfiles).values({
        userId,
        onboardingStep: -1,
        monthlyOrderCount: '0-100',
        salesChannels: {},
        companyInfo,
        domesticKyc: { status: 'verified', updatedAt: now },
        bankDetails: null,
        gstDetails: null,
        businessType: [],
        approved: true,
        approvedAt: now,
        onboardingComplete: true,
        profileComplete: true,
      })
    }

    await tx
      .insert(kyc)
      .values({ userId, status: 'verified', updatedAt: now })
      .onConflictDoUpdate({
        target: kyc.userId,
        set: { status: 'verified', updatedAt: now },
      })

    const existingPickup = await tx
      .select({ id: pickupAddresses.id })
      .from(pickupAddresses)
      .where(eq(pickupAddresses.userId, userId))
      .limit(1)

    if (existingPickup[0]) {
      await tx
        .update(pickupAddresses)
        .set({ isPickupEnabled: true, isPrimary: true })
        .where(and(eq(pickupAddresses.userId, userId), eq(pickupAddresses.id, existingPickup[0].id)))
    } else {
      const [createdAddress] = await tx
        .insert(addresses)
        .values({
          userId,
          ...pickup,
        })
        .returning()

      await tx.insert(pickupAddresses).values({
        userId,
        addressId: createdAddress.id,
        rtoAddressId: createdAddress.id,
        isPrimary: true,
        isPickupEnabled: true,
        isRTOSame: true,
      })
    }

    const wallet = await getOrCreateWalletForUser(userId, tx)

    return {
      approved: true,
      onboardingComplete: true,
      profileComplete: true,
      kycStatus: 'verified',
      pickupReady: true,
      walletId: wallet.id,
      walletBalance: Number(wallet.balance ?? 0),
    }
  })
}
