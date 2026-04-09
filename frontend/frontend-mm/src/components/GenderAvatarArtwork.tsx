import type { Gender } from '../types/matrimony'
import femaleAvatar from '../assets/images/female_avatar.png'
import maleAvatar from '../assets/images/male_avatar.png'

interface GenderAvatarArtworkProps {
  gender?: Gender | ''
}

export function GenderAvatarArtwork({ gender }: GenderAvatarArtworkProps) {
  const imageSource = gender === 'FEMALE' ? femaleAvatar : maleAvatar
  const imageAlt = gender === 'FEMALE' ? 'Female avatar' : 'Male avatar'

  return (
    <img className="gender-avatar-image" src={imageSource} alt={imageAlt} loading="lazy" />
  )
}