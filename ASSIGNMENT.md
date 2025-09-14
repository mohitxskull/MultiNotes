Objective: Develop and deploy a multi-tenant SaaS Notes Application hosted on Vercel. The application should allow multiple tenants (companies) to securely manage their users and notes, while enforcing role-based access and subscription limits.

Requirements:

1. Multi-Tenancy
   a. Support at least two tenants: Acme and Globex.
   b. Ensure strict isolation: data belonging to one tenant must never be accessible to another.
   c. You may select one of the following approaches: shared schema with a tenant ID column, schema-per-tenant, or database-per-tenant.
   d. Document your chosen approach in the README.

2. Authentication and Authorization
   a. Implement JWT-based login.
   b. Roles: ---Admin: can invite users and upgrade subscriptions. ---Member: can only create, view, edit, and delete notes.
   c. Provide the following mandatory test accounts (all with password: password):
   admin@acme.test (Admin, tenant: Acme)
   user@acme.test (Member, tenant: Acme)
   admin@globex.test (Admin, tenant: Globex)
   user@globex.test (Member, tenant: Globex)

3. Subscription Feature Gating
   a. Free Plan: Tenant limited to a maximum of 3 notes.
   b. Pro Plan: Unlimited notes.
   c. Provide an upgrade endpoint: POST /tenants/:slug/upgrade (accessible only by Admin).
   After upgrade, the tenant’s note limit must be lifted immediately.

4. Notes API (CRUD)
   Implement endpoints with tenant isolation and role enforcement:
   POST /notes – Create a note
   GET /notes – List all notes for the current tenant
   GET /notes/:id – Retrieve a specific note
   PUT /notes/:id – Update a note
   DELETE /notes/:id – Delete a note

5. Deployment
   a. The backend and frontend must be hosted on Vercel.
   b. CORS must be enabled so that automated scripts and dashboards can access your API.
   c. Provide a health endpoint: GET /health → { "status": "ok" }.

6. Frontend
   a. Provide a minimal frontend hosted on Vercel.
   b. Must support: login using the predefined accounts, listing/creating/deleting notes, and showing “Upgrade to Pro” when a Free tenant reaches the note limit.

Evaluation Method:
Your submission will be validated using automated test scripts. The tests will verify:

a. Health endpoint availability.
b. Successful login for all predefined accounts.
c. Enforcement of tenant isolation.
d. Role-based restrictions (for example, Member cannot invite users).
e. Enforcement of the Free plan note limit, and removal of the limit after upgrade.
f. Correct functioning of all CRUD endpoints.
g. Presence and accessibility of the frontend.
