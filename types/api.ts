export interface TokenResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginResponseDto {
  tokens: TokenResponseDto;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TenantBrandingDto {
  display_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme_tokens: Record<string, unknown>;
  updated_at: string;
}

export interface TenantPolicyDto {
  campus_only: boolean;
  invite_only: boolean;
  enforce_email_domains: boolean;
  enforce_ip_allowlist: boolean;
  max_login_attempts: number;
  lockout_minutes: number;
  otp_ttl_seconds: number;
  access_token_ttl_seconds: number;
  refresh_token_ttl_seconds: number;
  require_2fa_email_otp: boolean;
  allow_remember_device: boolean;
  updated_at: string;
}

export interface TenantContextDto {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  branding: TenantBrandingDto | null;
  policy: TenantPolicyDto | null;
}

export interface DepartmentDto {
  id: string;
  name: string;
  is_active: boolean;
}

export interface ProgramDto {
  id: string;
  name: string;
  is_active: boolean;
  department_id: string;
}

export interface ThesisAuthorDto {
  id: string;
  display_name: string;
  sort_order: number;
  user_id?: string | null;
}

export interface ThesisAdviserDto {
  id: string;
  adviser_email: string | null;
}

export interface KeywordDto {
  id: string;
  value: string;
}

export interface ThesisStatusHistoryDto {
  id: string;
  from_status: string;
  to_status: string;
  note: string;
  changed_at: string;
  changed_by_email: string | null;
  changed_by_role: string | null;
}

export interface ThesisReviewDto {
  id: string;
  decision: string;
  comment: string;
  created_at: string;
  reviewer_email: string | null;
  reviewer_role: string | null;
}

export interface ThesisFileDto {
  id: string;
  kind: string;
  access_level: string;
  version_number: number;
  is_current: boolean;
  label: string;
  created_at: string;
  filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  checksum: string | null;
}

export interface ThesisMetadataVersionDto {
  id: string;
  version_number: number;
  snapshot: Record<string, unknown>;
  note: string;
  created_at: string;
}

export interface CitationExportDto {
  format: string;
  filename: string;
  content: string;
}

export interface CollectionBucketDto {
  value: string;
  label: string;
  count: number;
}

export interface PublicCollectionSummaryDto {
  thesis_types: CollectionBucketDto[];
  departments: CollectionBucketDto[];
  programs: CollectionBucketDto[];
  years: CollectionBucketDto[];
}

export interface ThesisListItemDto {
  id: string;
  title: string;
  year: number;
  status: string;
  visibility: string;
  thesis_type: string;
  language: string;
  research_category: string;
  methodology: string;
  college_name: string;
  campus_name: string;
  public_slug: string;
  submitted_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  defense_date: string | null;
  embargo_until: string | null;
  created_at: string;
  updated_at: string;
  authors: ThesisAuthorDto[];
  keywords: KeywordDto[];
  department?: DepartmentDto | null;
  program?: ProgramDto | null;
}

export interface ThesisDetailDto extends ThesisListItemDto {
  abstract: string;
  authors: ThesisAuthorDto[];
  advisers: ThesisAdviserDto[];
  rights_license: string;
  panel_members: string[];
  status_history: ThesisStatusHistoryDto[];
  reviews: ThesisReviewDto[];
  files: ThesisFileDto[];
  metadata_versions: ThesisMetadataVersionDto[];
  is_embargo_active: boolean;
}

export interface PublicThesisListItemDto extends ThesisListItemDto {
  tenant_slug: string;
  tenant_name: string;
  public_url: string;
}

export interface PublicThesisDetailDto extends ThesisDetailDto {
  tenant_slug: string;
  tenant_name: string;
  public_url: string;
  citation_formats: Record<string, string>;
  can_download_public_files: boolean;
}

export interface TenantMembershipUserDto {
  id: string;
  email: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at: string | null;
  email_verification_status: string;
}

export interface TenantMembershipDto {
  id: string;
  role: string;
  status: string;
  created_at: string;
  user: TenantMembershipUserDto;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface AuditLogDto {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
