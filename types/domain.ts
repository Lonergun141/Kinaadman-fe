export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  membershipId: string | null;
  isSuperAdmin: boolean;
}

export interface TenantBranding {
  display_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  theme_tokens: Record<string, unknown>;
  updated_at: string;
}

export interface TenantPolicy {
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

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  branding: TenantBranding | null;
  policy: TenantPolicy | null;
}

export interface TenantEmailDomain {
  id: string;
  domain: string;
  is_active: boolean;
  created_at: string;
}

export interface TenantHostAlias {
  id: string;
  hostname: string;
  is_active: boolean;
  created_at: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  is_active: boolean;
}

export interface ProgramOption {
  id: string;
  name: string;
  is_active: boolean;
  department_id: string;
}

export interface ThesisAuthor {
  id: string;
  display_name: string;
  sort_order: number;
  user_id?: string | null;
}

export interface ThesisAdviser {
  id: string;
  adviser_email: string | null;
}

export interface Keyword {
  id: string;
  value: string;
}

export interface ThesisStatusHistory {
  id: string;
  from_status: string;
  to_status: string;
  note: string;
  changed_at: string;
  changed_by_email: string | null;
  changed_by_role: string | null;
}

export interface ThesisReview {
  id: string;
  decision: string;
  comment: string;
  created_at: string;
  reviewer_email: string | null;
  reviewer_role: string | null;
}

export interface ThesisFile {
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

export interface ThesisMetadataVersion {
  id: string;
  version_number: number;
  snapshot: Record<string, unknown>;
  note: string;
  created_at: string;
}

export interface PublicationReadinessCheck {
  id: string;
  label: string;
  status: string;
  detail: string;
  blocking: boolean;
}

export interface PublicationReadiness {
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
  checklist: PublicationReadinessCheck[];
}

export interface CitationExport {
  format: string;
  filename: string;
  content: string;
}

export interface CollectionBucket {
  value: string;
  label: string;
  count: number;
}

export interface PublicCollectionSummary {
  thesis_types: CollectionBucket[];
  departments: CollectionBucket[];
  programs: CollectionBucket[];
  years: CollectionBucket[];
}

export interface AnalyticsCountBucket {
  label: string;
  count: number;
}

export interface AnalyticsValueBucket {
  label: string;
  value: number;
}

export interface RepositoryAnalyticsMonth {
  key: string;
  month: string;
  created: number;
  submitted: number;
  published: number;
}

export interface RepositoryAnalyticsSummary {
  total_records: number;
  published_count: number;
  active_workflow_count: number;
  ready_count: number;
  blocked_count: number;
}

export interface RepositoryAnalyticsOverview {
  as_of: string;
  window_months: number;
  summary: RepositoryAnalyticsSummary;
  monthly_activity: RepositoryAnalyticsMonth[];
  status_data: AnalyticsCountBucket[];
  department_data: AnalyticsCountBucket[];
  active_department_data: AnalyticsCountBucket[];
  visibility_data: AnalyticsValueBucket[];
  blocker_data: AnalyticsCountBucket[];
  pipeline_data: AnalyticsCountBucket[];
  readiness_split: AnalyticsValueBucket[];
}

export interface ThesisListItem {
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
  authors: ThesisAuthor[];
  keywords: Keyword[];
  publication_readiness: PublicationReadiness;
  department?: DepartmentOption | null;
  program?: ProgramOption | null;
}

export interface ThesisDetail extends ThesisListItem {
  abstract: string;
  authors: ThesisAuthor[];
  advisers: ThesisAdviser[];
  rights_license: string;
  panel_members: string[];
  panel_approval_status: string;
  panel_approval_note: string;
  status_history: ThesisStatusHistory[];
  reviews: ThesisReview[];
  files: ThesisFile[];
  metadata_versions: ThesisMetadataVersion[];
  is_embargo_active: boolean;
}

export interface PublicThesisListItem extends ThesisListItem {
  tenant_slug: string;
  tenant_name: string;
  public_url: string;
}

export interface PublicThesisDetail extends ThesisDetail {
  tenant_slug: string;
  tenant_name: string;
  public_url: string;
  citation_formats: Record<string, string>;
  can_download_public_files: boolean;
}

export interface PlaceholderRouteState {
  title: string;
  summary: string;
  blockers: string[];
  nextPhase: string;
}

export interface TenantMembershipUser {
  id: string;
  email: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at: string | null;
  email_verification_status: string;
}

export interface TenantMembership {
  id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: TenantMembershipUser;
}

export interface InvitationRecord {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  accept_url?: string | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
