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
    membership_id: string | null;
    is_super_admin: boolean;
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

export interface TenantEmailDomainDto {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantHostAliasDto {
  id: string;
  hostname: string;
  is_active: boolean;
  created_at: string;
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

export interface PublicationReadinessCheckDto {
  id: string;
  label: string;
  status: string;
  detail: string;
  blocking: boolean;
}

export interface PublicationReadinessDto {
  can_publish_now: boolean;
  readiness_score: number;
  blocker_count: number;
  blockers: string[];
  adviser_recommendation_status: string;
  adviser_review_decision: string | null;
  adviser_recommendation_note: string | null;
  adviser_recommendation_by: string | null;
  adviser_recommendation_at: string | null;
  panel_approval_status: string;
  panel_approval_note: string | null;
  checklist: PublicationReadinessCheckDto[];
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

export interface AnalyticsCountBucketDto {
  label: string;
  count: number;
}

export interface AnalyticsValueBucketDto {
  label: string;
  value: number;
}

export interface RepositoryAnalyticsMonthDto {
  key: string;
  month: string;
  created: number;
  submitted: number;
  published: number;
}

export interface RepositoryAnalyticsSummaryDto {
  total_records: number;
  published_count: number;
  active_workflow_count: number;
  ready_count: number;
  blocked_count: number;
}

export interface RepositoryAnalyticsOverviewDto {
  as_of: string;
  window_months: number;
  summary: RepositoryAnalyticsSummaryDto;
  monthly_activity: RepositoryAnalyticsMonthDto[];
  status_data: AnalyticsCountBucketDto[];
  department_data: AnalyticsCountBucketDto[];
  active_department_data: AnalyticsCountBucketDto[];
  visibility_data: AnalyticsValueBucketDto[];
  blocker_data: AnalyticsCountBucketDto[];
  pipeline_data: AnalyticsCountBucketDto[];
  readiness_split: AnalyticsValueBucketDto[];
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
  publication_readiness: PublicationReadinessDto;
  department?: DepartmentDto | null;
  program?: ProgramDto | null;
}

export interface ThesisDetailDto extends ThesisListItemDto {
  abstract: string;
  authors: ThesisAuthorDto[];
  advisers: ThesisAdviserDto[];
  rights_license: string;
  panel_members: string[];
  panel_approval_status: string;
  panel_approval_note: string;
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
  updated_at: string;
  user: TenantMembershipUserDto;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  accept_url?: string | null;
}

export interface AuditLogDto {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
