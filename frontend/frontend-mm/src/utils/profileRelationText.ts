function normalizeRelation(relation?: string | null) {
  return relation?.trim().toUpperCase() ?? ''
}

function resolvePossessivePrefix(relation?: string | null) {
  const normalized = normalizeRelation(relation)

  if (!normalized || normalized === 'SELF') return 'My'
  if (normalized === 'SON') return "Your Son's"
  if (normalized === 'DAUGHTER') return "Your Daughter's"
  if (normalized === 'BROTHER') return "Your Brother's"
  if (normalized === 'SISTER') return "Your Sister's"
  if (normalized === 'RELATIVE') return "Your Relative's"
  if (normalized === 'FRIEND') return "Your Friend's"

  return 'My'
}

function resolveRelationLabel(relation?: string | null) {
  const normalized = normalizeRelation(relation)
  if (!normalized || normalized === 'SELF') return 'My'
  if (normalized === 'SON') return 'Son'
  if (normalized === 'DAUGHTER') return 'Daughter'
  if (normalized === 'BROTHER') return 'Brother'
  if (normalized === 'SISTER') return 'Sister'
  if (normalized === 'RELATIVE') return 'Relative'
  if (normalized === 'FRIEND') return 'Friend'
  return 'My'
}

export function getProfileHeading(relation?: string | null) {
  return `${resolvePossessivePrefix(relation)} Matrimony Profile`
}

export function getProfilePageTitle(relation?: string | null) {
  const normalized = normalizeRelation(relation)
  if (!normalized || normalized === 'SELF') return 'My Profile'
  return `${resolvePossessivePrefix(relation)} Profile`
}

export function getProfileDescription(relation?: string | null) {
  const normalized = normalizeRelation(relation)
  if (!normalized || normalized === 'SELF') {
    return 'Keep your profile complete for better discovery and compatibility.'
  }

  return 'Keep this profile complete for better discovery and compatibility.'
}

export function getSaveProfileButtonLabel(_relation?: string | null) {
  return 'Save Profile'
}

export function getProfileNavLabel(relation?: string | null) {
  const label = resolveRelationLabel(relation)
  if (label === 'My') return 'Profile'
  return `${label} Profile`
}