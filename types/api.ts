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
}

export interface ThesisAdviserDto {
  id: string;
  adviser_email: string | null;
}

export interface ThesisListItemDto {
  id: string;
  title: string;
  year: number;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  department?: DepartmentDto | null;
  program?: ProgramDto | null;
}

export interface ThesisDetailDto extends ThesisListItemDto {
  abstract: string;
  authors: ThesisAuthorDto[];
  advisers: ThesisAdviserDto[];
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
