import { Box, Skeleton } from '@mui/material'
import { useState } from 'react'
import type { CompanyType } from '../../../../types/generic.types'
import type { KycDetails } from '../../../../types/user.types'
import { useUserKyc } from '../../../../hooks/User/Kyc/UseKyc'
import { useUserProfile } from '../../../../hooks/User/useUserProfile'
import { requiredKycDetails } from '../../../../utils/constants'
import KycDetailsCard from './KycDetailsCard'
import KYCVerificationStep from './KycVerificationSection'

const resolveRequiredFields = (kyc?: Partial<KycDetails> | null) => {
  if (!kyc?.structure) return []

  const config = requiredKycDetails[kyc.structure]

  if (
    kyc.structure === 'company' &&
    kyc.companyType &&
    typeof config === 'object' &&
    !Array.isArray(config)
  ) {
    return config[kyc.companyType as CompanyType] ?? []
  }

  return Array.isArray(config) ? config : []
}

const hasValue = (value: unknown) =>
  typeof value === 'string' ? value.trim().length > 0 : Boolean(value)

const isKycSubmissionComplete = (kyc?: Partial<KycDetails> | null) => {
  if (!kyc?.structure || kyc.status === 'rejected') return false

  const requiredFields = resolveRequiredFields(kyc)

  if (!hasValue(kyc.selfieUrl)) return false

  return requiredFields.every((field) => {
    if (
      (field === 'aadhaarFrontUrl' || field === 'aadhaarBackUrl') &&
      !hasValue(kyc.aadhaarFrontUrl) &&
      !hasValue(kyc.aadhaarBackUrl) &&
      hasValue(kyc.aadhaarUrl)
    ) {
      return true
    }

    return hasValue(kyc[field])
  })
}

const KycSection = () => {
  // Always fetch the authenticated user's profile inside protected routes
  const { isLoading } = useUserProfile(true)
  const [editingKyc, setEditingKyc] = useState(false)
  const { data: kycData, isLoading: loadingKyc } = useUserKyc()

  const hasKycDetails = isKycSubmissionComplete(kycData?.kyc)

  // Once KYC is submitted, always show the details card (even if status is "pending"),
  // and only show the multi-step form when there are no details yet or when explicitly editing.
  const showDetailsCard = hasKycDetails && !editingKyc

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" width="100%">
        <Skeleton
          width="100%"
          height={300}
          variant="rectangular"
          sx={{
            borderRadius: 3,
            bgcolor: '#F5F7FA',
            '&::after': {
              background:
                'linear-gradient(90deg, transparent, rgba(51, 51, 105, 0.08), transparent)',
            },
          }}
        />
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="center" width="100%">
      {showDetailsCard ? (
        <KycDetailsCard
          kyc={kycData?.kyc ?? {}}
          isLoading={loadingKyc}
          onEdit={() => setEditingKyc(true)}
        />
      ) : (
        <KYCVerificationStep
          existingKyc={kycData?.kyc ?? {}}
          editing={editingKyc}
          onCancelEdit={() => setEditingKyc(false)}
          onComplete={() => setEditingKyc(false)}
        />
      )}
    </Box>
  )
}

export default KycSection
