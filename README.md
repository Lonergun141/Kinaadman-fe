# Kinaadman (MVP)
Campus-only, multi-tenant thesis/capstone repository for universities. Each university (tenant) has isolated data, users, roles, and policies—**no public pages**.

## MVP Scope
- Multi-tenant (single platform, tenant-scoped data via `tenant_id`)
- Private repository workflow: **DRAFT → SUBMITTED → REVIEW → APPROVED → PUBLISHED** (still private)
- Thesis records: metadata + PDF + attachments
- Search & filters (Postgres FTS + structured filters)
- RBAC: Student, Adviser, Librarian, Tenant Admin, Super Admin
- Secure file access via **pre-signed URLs** (upload/download)

## Tenancy & Campus-Only Rules (per diagrams)
- Single app entry: `app.kinaadman.com` (white-label per tenant)
- Tenant context resolution supports:
  - email-domain mapping
  - tenant picker
  - `/t/{tenant_slug}` (optional UI route)
  - host aliases (optional/custom mapping)
- “Campus-only” enforced by tenant policy (MVP):
  - login required for everything
  - invite-only + allowed email domains
  - optional email OTP + lockout rules

## Core API Flows (high level)
- Bootstrap tenant context: `GET /v1/bootstrap`
- Auth: `POST /v1/auth/login` → (optional) `POST /v1/auth/otp/verify`
- Token lifecycle: `POST /v1/auth/refresh`, `POST /v1/auth/logout`
- Theses: `GET /v1/theses`, `GET /v1/theses/{id}`, `POST /v1/theses/{id}/submit`
- Files: `POST /v1/files/presign-upload` → `POST /v1/files/complete`
  - Downloads: `POST /v1/files/presign-download`

## Tech Stack (MVP)
- **Frontend:** Next.js (TypeScript, App Router) + Tailwind + shadcn/ui
- **Backend:** Django + Django Ninja (REST API) + Django Admin (backoffice)
- **DB:** PostgreSQL (single DB; all rows scoped by `tenant_id`)
- **Storage:** S3-compatible (AWS S3 / DigitalOcean Spaces) via pre-signed URLs
- **Optional later:** Redis + Celery (thumbnails, extraction, async jobs)

## Diagrams (Mermaid source)
- System Architecture: `docs/diagrams/Kinaadman-system-architecture.mmd`
- Sequence Diagram: `docs/diagrams/Kinaadman-sequence-diagram.mmd`
- Use Case Diagram: `docs/diagrams/Kinaadman-usecase-diagram.mmd`
- ERD: `docs/diagrams/Kinaadman-erd.mmd`

## Scaling Path (no rewrite)
- Stronger isolation: Postgres RLS or schema-per-tenant
- Better search: OpenSearch/Elasticsearch
- Enterprise access: OIDC/SAML SSO + IP allowlisting
- Performance: Redis caching + CDN for file delivery