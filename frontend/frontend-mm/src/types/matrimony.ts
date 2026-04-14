export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'AWAITING_DIVORCE'

export type InterestStatus = 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN'

export type DietType =
  | 'VEGETARIAN'
  | 'EGGETARIAN'
  | 'NON_VEGETARIAN'
  | 'VEGAN'
  | 'JAIN'
  | 'OCCASIONALLY_NON_VEG'

export type EmploymentType =
  | 'PRIVATE'
  | 'GOVERNMENT'
  | 'BUSINESS'
  | 'SELF_EMPLOYED'
  | 'NOT_WORKING'
  | 'STUDENT'

export type FamilyType = 'NUCLEAR' | 'JOINT' | 'EXTENDED'

export type FamilyValues = 'TRADITIONAL' | 'MODERATE' | 'LIBERAL'

export type ProfileVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'HIDDEN'

export type PhotoVisibility = 'VISIBLE_TO_ALL' | 'MEMBERS_ONLY' | 'ON_REQUEST'

export type ContactVisibility = 'VISIBLE_TO_MATCHES' | 'ON_ACCEPTED_INTEREST' | 'HIDDEN'

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
  preferredOccupation?: string
  preferredLocation?: string
  preferredHeightMinCm?: number
  preferredHeightMaxCm?: number
  preferredDiet?: DietType
  preferredSmoking?: boolean
  preferredDrinking?: boolean
  mustHaves?: string[]
  dealBreakers?: string[]
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
  shortlisted?: boolean
  interestSentStatus?: InterestStatus
  interestReceivedStatus?: InterestStatus
}

export interface MatrimonyProfileDetail extends MatrimonyProfileSummary {
  gender: Gender
  dateOfBirth?: string
  motherTongue?: string
  languagesKnown?: string[]
  caste?: string
  subCaste?: string
  gothra?: string
  manglik?: boolean
  horoscopeAvailable?: boolean
  country?: string
  state?: string
  areaCode?: string
  workLocation?: string
  heightCm?: number
  bodyType?: string
  complexion?: string
  annualIncome: number
  employmentType?: EmploymentType
  companyName?: string
  diet?: DietType
  smoking?: boolean
  drinking?: boolean
  fitnessLevel?: string
  hobbies?: string[]
  willingToRelocate?: boolean
  bio?: string
  biodataIdentifier?: string
  biodataUrl?: string
  relationToUser?: string
  familyType?: FamilyType
  familyValues?: FamilyValues
  fatherOccupation?: string
  motherOccupation?: string
  siblingsCount?: number
  familyLocation?: string
  aboutFamily?: string
  profileVisibility?: ProfileVisibility
  photoVisibility?: PhotoVisibility
  contactVisibility?: ContactVisibility
  idVerified?: boolean
  profileCompletion: number
  galleryPhotos?: Photo[]
  preference?: PartnerPreference
}

export interface ProfileConnection {
  shortlisted: boolean
  interestSentStatus?: InterestStatus
  interestReceivedStatus?: InterestStatus
}

export interface ProfileDetailWithConnection {
  profile: MatrimonyProfileDetail
  connection: ProfileConnection
}

export interface Interest {
  id: number
  fromProfileId: string
  toProfileId: string
  fromReferenceId?: string
  toReferenceId?: string
  fromProfileFullName?: string
  toProfileFullName?: string
  fromProfileImageThumbnailDataUrl?: string
  toProfileImageThumbnailDataUrl?: string
  fromProfileImageThumbnailBlob?: string
  toProfileImageThumbnailBlob?: string
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
  languagesKnown?: string[]
  religion?: string
  caste?: string
  subCaste?: string
  gothra?: string
  manglik?: boolean
  horoscopeAvailable?: boolean
  maritalStatus?: MaritalStatus
  education?: string
  occupation?: string
  employmentType?: EmploymentType
  companyName?: string
  annualIncome?: number
  city?: string
  state?: string
  country?: string
  areaCode?: string
  workLocation?: string
  heightCm?: number
  bodyType?: string
  complexion?: string
  diet?: DietType
  smoking?: boolean
  drinking?: boolean
  fitnessLevel?: string
  hobbies?: string[]
  willingToRelocate?: boolean
  bio?: string
  profilePhotoIdentifier?: string
  relationToUser?: string
  familyType?: FamilyType
  familyValues?: FamilyValues
  fatherOccupation?: string
  motherOccupation?: string
  siblingsCount?: number
  familyLocation?: string
  aboutFamily?: string
  profileVisibility?: ProfileVisibility
  photoVisibility?: PhotoVisibility
  contactVisibility?: ContactVisibility
  idVerified?: boolean
  preference?: PartnerPreference
}

export type UpdateBasicDetailsRequest = Pick<
  UpsertMyProfileRequest,
  | 'fullName'
  | 'gender'
  | 'dateOfBirth'
  | 'maritalStatus'
  | 'city'
  | 'state'
  | 'country'
  | 'areaCode'
  | 'relationToUser'
  | 'bio'
  | 'profilePhotoIdentifier'
>

export type UpdateCommunityDetailsRequest = Pick<
  UpsertMyProfileRequest,
  'religion' | 'motherTongue' | 'caste' | 'subCaste' | 'languagesKnown'
>

export type UpdateProfessionalDetailsRequest = Pick<
  UpsertMyProfileRequest,
  | 'education'
  | 'occupation'
  | 'employmentType'
  | 'companyName'
  | 'workLocation'
  | 'annualIncome'
  | 'heightCm'
  | 'bodyType'
  | 'complexion'
  | 'diet'
  | 'smoking'
  | 'drinking'
  | 'fitnessLevel'
  | 'hobbies'
  | 'willingToRelocate'
>

export type UpdateHoroscopeDetailsRequest = Pick<UpsertMyProfileRequest, 'gothra' | 'manglik' | 'horoscopeAvailable'>

export type UpdateFamilyDetailsRequest = Pick<
  UpsertMyProfileRequest,
  'familyType' | 'familyValues' | 'fatherOccupation' | 'motherOccupation' | 'siblingsCount' | 'familyLocation' | 'aboutFamily'
>

export type UpdatePartnerPreferencesRequest = Pick<UpsertMyProfileRequest, 'preference'>

export type UpdatePrivacyVerificationRequest = Pick<
  UpsertMyProfileRequest,
  'profileVisibility' | 'photoVisibility' | 'contactVisibility' | 'idVerified'
>