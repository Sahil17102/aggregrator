export const getPostAuthRedirect = (user?: { onboardingComplete?: boolean | null }) =>
  user?.onboardingComplete ? '/dashboard' : '/onboarding-questions'
