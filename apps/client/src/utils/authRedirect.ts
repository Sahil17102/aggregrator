type OnboardingStatusUser = {
  onboardingComplete?: boolean | null
  profileComplete?: boolean | null
  approved?: boolean | null
  onboardingStep?: number | null
}

export const isOnboardingComplete = (user?: OnboardingStatusUser | null) =>
  Boolean(
    user?.onboardingComplete ||
      user?.profileComplete ||
      user?.approved ||
      Number(user?.onboardingStep ?? 0) < 0,
  )

export const getPostAuthRedirect = (user?: OnboardingStatusUser | null) =>
  isOnboardingComplete(user) ? '/dashboard' : '/onboarding-questions'
