import {
  BusinessStructure,
  CompanyType,
  KycDetails,
} from "../types/users.types";

export const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const requiredKycDetails: Record<
  BusinessStructure,
  (keyof KycDetails)[] | Record<CompanyType, (keyof KycDetails)[]>
> = {
  individual: ["panCardUrl", "aadhaarFrontUrl", "aadhaarBackUrl", "cancelledChequeUrl"],
  sole_proprietor: [
    "panCardUrl",
    "aadhaarFrontUrl",
    "aadhaarBackUrl",
    "cancelledChequeUrl",
    "gstin",
    "gstCertificateUrl",
  ],
  partnership_firm: [
    "partnershipDeedUrl",
    "panCardUrl",
    "aadhaarFrontUrl",
    "aadhaarBackUrl",
    "cancelledChequeUrl",
    "gstin",
    "gstCertificateUrl",
  ],
  company: {
    private_limited: [
      "cin",
      "gstin",
      "gstCertificateUrl",
      "boardResolutionUrl",
      "businessPanUrl",
      "aadhaarFrontUrl",
      "aadhaarBackUrl",
    ],
    llp: [
      "businessPanUrl",
      "aadhaarFrontUrl",
      "aadhaarBackUrl",
      "companyAddressProofUrl",
      "cancelledChequeUrl",
      "llpAgreementUrl",
      "gstin",
      "gstCertificateUrl",
    ],
    one_person_company: [
      "businessPanUrl",
      "aadhaarFrontUrl",
      "aadhaarBackUrl",
      "cin",
      "companyAddressProofUrl",
      "cancelledChequeUrl",
    ],
    section_8_company: [
      "businessPanUrl",
      "aadhaarFrontUrl",
      "aadhaarBackUrl",
      "companyAddressProofUrl",
      "boardResolutionUrl",
      "cancelledChequeUrl",
    ],
    public_limited: [
      "businessPanUrl",
      "aadhaarFrontUrl",
      "aadhaarBackUrl",
      "gstin",
      "gstCertificateUrl",
    ],
  },
};

export const requiredKycFieldMap: Record<
  BusinessStructure,
  Record<string, boolean> | Record<CompanyType, Record<string, boolean>>
> = {
  individual: {
    panCardUrl: true,
    aadhaarFrontUrl: true,
    aadhaarBackUrl: true,
    cancelledChequeUrl: true,
  },
  sole_proprietor: {
    panCardUrl: true,
    aadhaarFrontUrl: true,
    aadhaarBackUrl: true,
    cancelledChequeUrl: true,
    gstin: false,
    gstCertificateUrl: false,
  },
  partnership_firm: {
    partnershipDeedUrl: true,
    panCardUrl: true,
    aadhaarFrontUrl: true,
    aadhaarBackUrl: true,
    cancelledChequeUrl: true,
    gstin: false,
    gstCertificateUrl: false,
  },
  company: {
    private_limited: {
      cin: true,
      gstin: false,
      gstCertificateUrl: true,
      boardResolutionUrl: true,
      businessPanUrl: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
    },
    llp: {
      businessPanUrl: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      companyAddressProofUrl: true,
      cancelledChequeUrl: true,
      llpAgreementUrl: true,
      gstin: false,
      gstCertificateUrl: false,
    },
    one_person_company: {
      businessPanUrl: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      cin: true,
      companyAddressProofUrl: true,
      cancelledChequeUrl: true,
    },
    section_8_company: {
      businessPanUrl: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      companyAddressProofUrl: true,
      boardResolutionUrl: true,
      cancelledChequeUrl: true,
    },
    public_limited: {
      businessPanUrl: true,
      aadhaarFrontUrl: true,
      aadhaarBackUrl: true,
      gstin: false,
      gstCertificateUrl: true,
    },
  },
};
