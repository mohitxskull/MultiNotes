# MultiNotes

This is a multi-tenant SaaS Notes Application.

## Multi-Tenancy Approach

The application uses a **shared schema with a tenant ID column** approach for multi-tenancy. The following tables have a `tenantId` column to ensure data isolation:

- `users`
- `notes`

This approach was chosen for its simplicity and efficiency at the scale of this application. It avoids the complexity of managing multiple schemas or databases while still providing strong data isolation at the application layer.

## Test Accounts

The following test accounts are available. The password for all accounts is `password`.

| Email              | Role  | Tenant |
| ------------------ | ----- | ------ |
| admin@acme.test    | Admin | Acme   |
| user@acme.test     | Member| Acme   |
| admin@globex.test  | Admin | Globex |
| user@globex.test   | Member| Globex |

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Create a new tenant and an admin user.
- `POST /api/auth/sign_in`: Sign in a user.
- `POST /api/auth/logout`: Sign out a user.
- `GET /api/auth/me`: Get the current user session.

### Notes

- `POST /api/notes`: Create a new note.
- `GET /api/notes`: Get all notes for the current tenant.
- `GET /api/notes/:id`: Get a specific note.
- `PUT /api/notes/:id`: Update a specific note.
- `DELETE /api/notes/:id`: Delete a specific note.

### Tenants

- `POST /api/tenants/invite`: Invite a new user to the tenant (admin only).
- `POST /api/tenants/:slug/upgrade`: Upgrade a tenant to the "pro" plan (admin only).

### Health

- `GET /api/health`: Health check endpoint.
