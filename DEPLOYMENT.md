# AtomQuest Deployment Runbook

This document outlines the steps required to deploy the AtomQuest platform to a production or pilot environment, satisfying the Phase 5 backend hardening and security requirements.

## 1. Environment Configuration

Copy the `backend/.env.example` file to `backend/.env` and update the values for the target environment.

```bash
cp backend/.env.example backend/.env
```

**Key Variables:**
- `DATABASE_URL`: Connection string to your PostgreSQL instance.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secure, random keys for JWT signing.
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs (e.g., `https://atomquest.yourdomain.com`).

## 2. Microsoft Entra ID (SSO) Configuration

To complete the SSO tenant configuration:
1. Register a new application in the Microsoft Entra admin center.
2. In the **Authentication** tab, add a Web platform configuration with the Redirect URI matching `AZURE_REDIRECT_URI` (e.g., `https://api.yourdomain.com/api/auth/callback/sso`).
3. Set the variables in `backend/.env`:
   - `AZURE_CLIENT_ID`: The Application (client) ID.
   - `AZURE_TENANT_ID`: The Directory (tenant) ID.
   - `AZURE_CLIENT_SECRET`: A client secret generated in the **Certificates & secrets** tab.

## 3. Database Provisioning

For local development or pilot testing, you can use the provided Docker Compose file:
```bash
cd backend
docker-compose up -d
```

For production, provision a managed PostgreSQL database (e.g., AWS RDS, Azure Database for PostgreSQL) and update the `DATABASE_URL`.

**Run Migrations:**
Once the database is running, apply the Prisma migrations to set up the schema:
```bash
cd backend
npx prisma migrate deploy
```

## 4. Audit Immutability Policy

The system is designed with immutable audit events.
- Audit events are written using `prisma.auditEvent.create`.
- There are no APIs or service methods that allow `UPDATE` or `DELETE` on the `AuditEvent` table.
- **Database Hardening:** In a production database, you may enforce this at the database level by granting the application role `INSERT` and `SELECT` privileges only on the `AuditEvent` table.

## 5. Build and Run

**Backend:**
```bash
cd backend
npm run build
npm run start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the built /dist folder using an HTTP server like Nginx, Apache, or a static hosting service.
```

## 6. Recovery Steps

In case of a database failure:
1. Restore the PostgreSQL database from the latest automated backup.
2. Ensure the backend application restarts and reconnects to the restored database instance.
3. The frontend application is stateless and relies on JWT tokens. Users may need to log in again if refresh tokens are invalid or expired.
