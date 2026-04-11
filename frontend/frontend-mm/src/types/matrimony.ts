export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE'

export type InterestStatus = 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN'

export type VerificationStatus = 'PENDING_EMAIL' | 'PENDING_PHONE' | 'PENDING_PROFILE' | 'PROFILE_NOT_CREATED' | 'VERIFIED'

export interface PicklistItem {
  name: string
  value: string
}

export interface PartnerPreference {
  minAge?: number
  maxAge?: number
  preferredReligion?: string
  preferredCaste?: string
  preferredCity?: string
  preferredMotherTongue?: string
  preferredMaritalStatus?: MaritalStatus
  preferredEducation?: string
}

export interface MatrimonyProfileSummary {
  profileId: string
  referenceId: string
  fullName: string
  age: number
  city: string
  gender?: Gender
  religion: string
  maritalStatus: MaritalStatus
  education?: string
  occupation?: string
  profilePhotoIdentifier?: string
  profilePhotoUrl?: string
  verified?: boolean
  compatibilityScore?: number
}

export interface MatrimonyProfileDetail extends MatrimonyProfileSummary {
  gender: Gender
  dateOfBirth?: string
  motherTongue?: string
  caste?: string
  country?: string
  state?: string
  annualIncome: number
  diet?: string
  smoking?: boolean
  drinking?: boolean
  bio?: string
  biodataIdentifier?: string
  biodataUrl?: string
  relationToUser?: string
  profileCompletion: number
  galleryPhotos?: Photo[]
  preference?: PartnerPreference
}

export interface Interest {
  id: number
  fromProfileId: string
  toProfileId: string
  status: InterestStatus
  message?: string
  createdAt: string
  updatedAt?: string
}

export interface SuccessMessageResponse {
  timestamp: string
  status: number
  message: string
}

export interface DashboardStats {
  totalUsers: number
  totalProfiles: number
  verifiedProfiles: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  profilesByGender: Record<string, number>
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string
  active: boolean
  verificationStatus: VerificationStatus
  createdAt: string
}

export interface AdminUsersQuery {
  page: number
  size: number
  email?: string
  name?: string
  verificationStatus?: VerificationStatus
  active?: boolean
}

export interface AdminProfilesQuery {
  page: number
  size: number
  fullName?: string
  gender?: Gender
  religion?: string
  city?: string
  verified?: boolean
}

export interface PicklistEntry {
  id: number
  picklistName: string
  name: string
  value: string
  lang: string
  sortOrder: number
  active: boolean
}

export interface AdminPicklistEntriesQuery {
  page: number
  size: number
  picklistName?: string
  lang?: string
}

export interface UpsertPicklistEntryRequest {
  picklistName: string
  name: string
  value: string
  lang?: string
  sortOrder?: number
  active?: boolean
}

export interface Photo {
  id?: number
  photoIdentifier: string
  photoUrl?: string
  displayOrder: number
}

export interface DiscoveryQuery {
  page: number
  size: number
  gender?: Gender
  maritalStatus?: MaritalStatus
  religion?: string
  caste?: string
  motherTongue?: string
  city?: string
  education?: string[]
  occupation?: string[]
  minAge?: number
  maxAge?: number
}

export interface CreateInterestRequest {
  toProfileId: number
  message?: string
}

export interface UpsertMyProfileRequest {
  fullName?: string
  gender?: Gender
  dateOfBirth?: string
  motherTongue?: string
  religion?: string
  caste?: string
  maritalStatus?: MaritalStatus
  education?: string
  occupation?: string
  annualIncome?: number
  city?: string
  state?: string
  country?: string
  bio?: string
  biodataUrl?: string
  profilePhotoIdentifier?: string
  profilePhotoUrl?: string
  relationToUser?: string
  preference?: PartnerPreference
}