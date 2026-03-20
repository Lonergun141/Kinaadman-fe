# Kinaadman Frontend

Next.js frontend integrated against the existing Django backend in `../Kinaadman-be` without backend code changes.

## Frontend Runtime Setup
- Backend origin is proxied through Next.js rewrites via `KINAADMAN_BACKEND_ORIGIN`.
- The browser talks to `/api/backend/v1/*`, so local development avoids CORS issues from the frontend side.
- Default tenant bootstrap is prefilled through `NEXT_PUBLIC_DEFAULT_TENANT_ID`.

Current local env:
- `KINAADMAN_BACKEND_ORIGIN=http://127.0.0.1:8000`
- `NEXT_PUBLIC_DEFAULT_TENANT_ID=3fec168e-2c39-46f3-8734-462d8562d9d7`

## Live Backend Features Wired To The UI
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/tenants/bootstrap`
- `GET /v1/users/memberships`
- `POST /v1/users/invites`
- `POST /v1/users/invites/{raw_token}/accept`
- `GET|POST /v1/departments/`
- `GET|POST /v1/programs/`
- `GET|POST|PUT /v1/theses/`
- `GET /v1/theses/{id}`
- `POST /v1/theses/{id}/submit`
- `POST /v1/theses/{id}/review`
- `POST /v1/theses/{id}/publish`
- `POST /v1/theses/{id}/unpublish`
- `POST /v1/theses/{id}/authors`
- `POST /v1/theses/{id}/advisers`
- `PUT /v1/tenants/branding`
- `PUT /v1/tenants/policy`
- `GET /v1/core/audit`

## Database State
- The connected backend database is not empty.
- Existing local data was confirmed for tenants, users, memberships, departments, programs, and theses, so no seed step is required before using the frontend.

If you ever need to populate an empty database, use the backend seed command from `Kinaadman-be`:

```powershell
.\.venv\Scripts\python.exe manage.py populate_mock
```

The seed command creates sample campus accounts such as `admin@uok.edu.ph`, `librarian@uok.edu.ph`, `adviser1@uok.edu.ph`, and `student1@uok.edu.ph`, with password `password123` when those users are created by the command.

## Notes
- Repository search and status filtering are live.
- Department and program filtering are applied client-side after fetching the tenant catalogue.
- The backend does not expose thesis ownership in list responses, invite listing, or review history feeds, so the frontend surfaces those gaps honestly instead of fabricating data.
