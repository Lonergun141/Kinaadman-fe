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
}

export interface ThesisAdviser {
  id: string;
  adviser_email: string | null;
}

export interface ThesisListItem {
  id: string;
  title: string;
  year: number;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  department?: DepartmentOption | null;
  program?: ProgramOption | null;
}

export interface ThesisDetail extends ThesisListItem {
  abstract: string;
  authors: ThesisAuthor[];
  advisers: ThesisAdviser[];
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
