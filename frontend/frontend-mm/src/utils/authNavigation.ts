export function resolvePostAuthRoute(verificationStatus?: string | null) {
  const normalized = verificationStatus?.trim().toUpperCase() ?? ''
  return normalized === 'PROFILE_NOT_CREATED' ? '/relation' : '/'
}