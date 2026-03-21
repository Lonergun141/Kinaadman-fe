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
  department?: DepartmentOption | null;
  program?: ProgramOption | null;
}

export interface ThesisDetail extends ThesisListItem {
  abstract: string;
  authors: ThesisAuthor[];
  advisers: ThesisAdviser[];
  rights_license: string;
  panel_members: string[];
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
  user: TenantMembershipUser;
}

export interface InvitationRecord {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
