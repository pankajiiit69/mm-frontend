import type { Gender } from '../types/matrimony'

export function getOppositeGender(gender?: Gender) {
  if (gender === 'MALE') return 'FEMALE' as const
  if (gender === 'FEMALE') return 'MALE' as const
  return undefined
}