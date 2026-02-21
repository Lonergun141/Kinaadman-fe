create a system archtecture out of this idea in mermaid

# Kinaadman (MVP) — Campus-Only Multi-Tenant Thesis Repository

Kinaadman is a multi-tenant SaaS platform for universities to **store, manage, and access thesis/capstone research** in a **private (campus-only)** digital repository. Each university is a **tenant** with isolated data, users, and settings.

---

## What the MVP does
- **Tenant-based system** (multiple universities on one platform)
- **Campus-only access**: everything requires login (no public pages)
- **Research workflow**: Draft → Submitted → Review → Approved → Published (still private)
- **Thesis metadata + file uploads** (PDF + attachments)
- **Search + filters** (title, abstract, keywords, year, department, program, authors/advisers)
- **Roles (RBAC)**: Student, Adviser, Librarian, Tenant Admin, Super Admin

---

## Suggested Tech Stack (fast MVP, scalable later)
**Frontend**
- Next.js (TypeScript, App Router)
- Tailwind + shadcn/ui

**Backend**
- Django + Django Ninja (REST API)
- Django Admin for backoffice ops

**Data**
- PostgreSQL (single DB; tenant scoping via `tenant_id`)

**Files**
- S3-compatible storage (AWS S3 / DigitalOcean Spaces)
- Pre-signed URLs for secure uploads/downloads

**Caching/Jobs (optional MVP, recommended later)**
- Redis (sessions/cache)
- Celery (PDF thumbnails, extraction, async tasks)

---

## Tenancy & Access (MVP rules)
- Tenant resolved via **subdomain**: `{tenant}.kinaadman.com`
- Every tenant-owned record includes `tenant_id`
- **Campus-only** enforced by:
  - Invite-only accounts + allowed email domains (MVP), then
  - Optional upgrade to tenant SSO (OIDC/SAML)

---

## High-level Modules
- **Auth & Users**: login, roles, invitations, tenant membership
- **Thesis Records**: metadata, status workflow, approvals
- **Files**: upload/download with permission checks
- **Repository Search**: Postgres full-text search (upgrade later if needed)
- **Admin Tools**: user management, review queue, tenant settings

---

## Scaling Path (no rewrite)
- Stronger isolation: Postgres RLS or schema-per-tenant
- Better search: OpenSearch/Elasticsearch
- Enterprise access: SSO + optional IP allowlisting
- Performance: Redis caching + CDN for files
