# AtomQuest Project Context for AI Assistants and Maintainers

## 1. Purpose of This File

This file provides concise but complete project context for AI assistants, contributors, and maintainers working on the AtomQuest Goal Setting and Tracking Portal. Use it as the operating guide for understanding the current prototype, respecting project phases, and making future changes consistently.

## 2. Project Summary

AtomQuest is an in-house web portal for structured goal setting, manager approval, quarterly achievement tracking, and performance governance. The product is intended to replace manual spreadsheet and email workflows with a role-based system that makes goals measurable, approvals traceable, check-ins continuous, and reporting easier for HR and leadership.

The current implementation is a hackathon-ready product prototype with a Phase 5 backend foundation. It is not fully production-ready yet, but goal workflow data now moves through backend APIs backed by Prisma and a PostgreSQL schema. Mock users remain available for local development, and Microsoft Entra ID SSO is scaffolded for enterprise authentication.

## 3. Current Technical Stack

| Area | Current Choice |
| --- | --- |
| Frontend framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| State management | React Context API |
| Persistence | Backend API with Prisma/PostgreSQL foundation |
| Styling | CSS and inline component styles |
| Backend | Fastify, Prisma, PostgreSQL schema, JWT auth |
| Authentication | Mock user selection with backend JWTs; Microsoft Entra ID SSO scaffold |

## 4. Project Structure

Important files and folders:

```text
.
+-- 6a06fcd06885a_AtomQuest_Hackathon_1.0_Problem_Statement_.md
+-- GEMINI.md
+-- PRD.md
+-- package.json
+-- frontend
    +-- README.md
    +-- package.json
    +-- index.html
    +-- src
    |   +-- App.tsx
    |   +-- main.tsx
    |   +-- types/index.ts
    |   +-- utils/scoreCalculator.ts
    |   +-- context/AuthProvider.tsx
    |   +-- context/DataProvider.tsx
    |   +-- pages/Login.tsx
    |   +-- pages/EmployeeDashboard.tsx
    |   +-- pages/ManagerDashboard.tsx
    |   +-- pages/AdminDashboard.tsx
    |   +-- components
    |       +-- GoalForm.tsx
    |       +-- ManagerReview.tsx
    |       +-- EmployeeCheckIn.tsx
    |       +-- ManagerCheckInReview.tsx
    |       +-- Layout.tsx
    +-- public
```

## 5. Commands

From the project root:

```bash
npm run install
npm run dev
npm run build
npm run lint
```

From `frontend`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Use `npm run build` to type-check and build the frontend. Use `npm run lint` to run ESLint.

## 6. Mock Users

The login screen allows selecting a mock user. No password is required.

| User | Role | Purpose |
| --- | --- | --- |
| Alice (Employee) | Employee | Create goals, submit approval requests, log quarterly achievements |
| Bob (Employee) | Employee | Additional employee for manager workflow testing |
| Charlie (Manager L1) | Manager | Review goal sheets and quarterly check-ins |
| Diana (Admin) | Admin | View organization-level completion overview |

Mock users are defined in `frontend/src/types/index.ts`.

## 7. LocalStorage Keys

The frontend stores auth session state locally, while workflow data is loaded from the backend API.

| Key | Purpose |
| --- | --- |
| `auth_access_token` | Stores the backend JWT access token for local development |
| `auth_current_user` | Stores the last signed-in user so protected routes can restore the session |

When testing from a clean state, clear these keys in the browser dev tools or clear site data.

## 8. Standard Project Phase Model

Use this phase model whenever updating documentation, roadmaps, issues, or implementation plans.

| Phase | Name | Status |
| --- | --- | --- |
| Phase 0 | Discovery, Problem Definition, and Solution Design | Complete for hackathon |
| Phase 1 | Prototype Foundation and Role-Based Shell | Implemented |
| Phase 2 | Goal Creation, Validation, and Manager Approval | Implemented |
| Phase 3 | Achievement Tracking, Quarterly Check-ins, and Scoring | Complete for prototype scope |
| Phase 4 | Reporting, Analytics, and Governance | Complete |
| Phase 5 | Backend, Security, and Enterprise Authentication | In progress |
| Phase 6 | Integrations, Notifications, and Workflow Automation | Planned |
| Phase 7 | Intelligence, Scale, and Continuous Improvement | Planned |

Do not describe the current prototype as production-ready. It is a functional frontend prototype with the core workflow implemented.

## 9. Implemented Capabilities by Phase

### Phase 0 - Discovery, Problem Definition, and Solution Design

Implemented through documentation:

- Problem statement.
- Product requirements.
- Phase roadmap.
- MVP boundaries.
- Demo flow.
- Known limitations and future path.

### Phase 1 - Prototype Foundation and Role-Based Shell

Implemented in the app:

- Vite and React frontend.
- TypeScript app structure.
- React Router routes.
- Protected dashboard route.
- Mock login and logout.
- Role-based dashboard routing.
- Auth context.
- Data context.
- Backend-backed workflow persistence after Phase 5; frontend session restore through browser storage.

Key files:

- `frontend/src/App.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/context/AuthProvider.tsx`
- `frontend/src/context/DataProvider.tsx`
- `frontend/src/types/index.ts`

### Phase 2 - Goal Creation, Validation, and Manager Approval

Implemented in the app:

- Employee goal form.
- Draft saving.
- Submission for approval.
- Goal count validation.
- Minimum weightage validation.
- Total weightage validation.
- Required title and target validation.
- Manager pending approval list.
- Manager target and weightage edits.
- Approval and lock behavior.
- Return for rework with required feedback.
- Employee display of submitted, approved, and returned states.

Key files:

- `frontend/src/components/GoalForm.tsx`
- `frontend/src/components/ManagerReview.tsx`
- `frontend/src/pages/EmployeeDashboard.tsx`
- `frontend/src/pages/ManagerDashboard.tsx`

### Phase 3 - Achievement Tracking, Quarterly Check-ins, and Scoring

Implemented in the app:

- Quarterly check-in selector for Q1, Q2, Q3, and Q4.
- Employee actual achievement entry.
- Employee progress status entry.
- Check-in submission.
- Check-in submission timestamp.
- Manager check-in review.
- Manager check-in comments.
- Manager override score and override justification capture.
- Weighted overall score display in the employee check-in view.
- Score calculation for Numeric, Percentage, Timeline, and Zero-based goals.
- Baseline-aware numeric and percentage scoring.
- Lower-is-better numeric and percentage scoring.

Key files:

- `frontend/src/components/EmployeeCheckIn.tsx`
- `frontend/src/components/ManagerCheckInReview.tsx`
- `frontend/src/utils/scoreCalculator.ts`

### Phase 4 - Reporting, Analytics, and Governance

Implemented in the app:

- Admin dashboard.
- Total employee count.
- Submitted goal sheet count.
- Approved goal sheet count.
- Average approval turnaround.
- Goal alignment counts by thrust area.
- Check-in compliance counts by quarter.
- Report filters by manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- Manager and department summaries.
- Returned goal analysis.
- Weighted score roll-ups.
- Detailed goal, check-in, score, override, and manager comment report.
- Persistent audit event model backed by the backend audit API.
- Audit event logging for submit, edit, return, approve, check-in, check-in review, and export actions.
- Detailed CSV export.
- Excel-compatible XLS export.
- Printable PDF export.
- Audit CSV export.

Key file:

- `frontend/src/pages/AdminDashboard.tsx`

### Phase 5 - Backend, Security, and Enterprise Authentication

Implemented foundation:

- Fastify backend API under `backend/src`.
- Prisma PostgreSQL schema under `backend/prisma/schema.prisma`.
- Backend routes for auth, users, goal sheets, check-ins, audit events, and reports.
- Server-side validation with Zod.
- JWT authentication and backend role checks.
- Manager hierarchy authorization for manager-owned workflow actions.
- Server-side audit event writes for workflow and export actions.
- Microsoft Entra ID SSO route scaffold with MSAL.
- Frontend API client in `frontend/src/services/api.ts`.
- Frontend `AuthProvider` and `DataProvider` use backend APIs for auth and workflow data.
- CI workflow in `.github/workflows/ci.yml`.
- Environment template in `backend/.env.example`.

Remaining Phase 5 hardening:

- Run against a real PostgreSQL instance in the target deployment environment.
- Complete production SSO tenant configuration and callback registration.
- Expand report APIs to cover every frontend dashboard rollup and export format.
- Add migration/deployment runbooks and recovery steps.
- Add broader API integration tests and security tests.

### Phase 6 - Integrations, Notifications, and Workflow Automation

Planned:

- HRIS or employee master data sync.
- Manager hierarchy sync.
- Email notifications.
- Microsoft Teams or Slack notifications.
- Check-in window reminders.
- Escalation workflows.
- Appraisal system import and export.

### Phase 7 - Intelligence, Scale, and Continuous Improvement

Planned:

- Goal recommendations.
- Alignment quality checks.
- Risk signals.
- Achievement trend analysis.
- Scoring anomaly detection.
- Executive dashboards.
- Performance optimization for larger organizations.

## 10. Business Rules to Preserve

Current enforced rules:

- A goal sheet may contain a maximum of 8 goals.
- Each goal must have at least 10 percent weightage.
- Total goal sheet weightage must equal exactly 100 percent.
- Goal title is required.
- Goal target is required.
- Manager feedback is required when returning a goal sheet.
- Approved sheets are locked from normal employee editing.
- Check-ins are available only for approved sheets.
- Check-in data is stored by quarter.
- Check-in submissions store a timestamp.
- Optional baselines are supported for numeric and percentage scoring.
- Lower-is-better metrics are supported for numeric and percentage scoring.
- Manager override scores and override justifications are supported during check-in review.
- Goal sheets carry a prototype cycle value.
- Mock users carry department values for Phase 4 department summaries.
- Audit events are persisted through backend audit storage.

Future business rules to consider:

- Add start and end dates.
- Add formal amendment workflow after approval.
- Add check-in open and close windows.
- Require override justification when an override score is entered.
- Add audit entries for every material change.

## 11. Current Scoring Rules

Current implementation in `frontend/src/utils/scoreCalculator.ts`:

- `ZERO`: actual value of 0 scores 100 percent; any other value scores 0 percent.
- `TIMELINE`: actual date on or before target date scores 100 percent; later date scores 0 percent.
- `NUMERIC` and `PERCENTAGE` without baseline: score is `actual / target * 100`.
- `NUMERIC` and `PERCENTAGE` with baseline: score is calculated as progress from baseline to target.
- Lower-is-better metrics reverse the numeric or percentage scoring direction.
- Manager override score takes priority over the calculated score.
- Numeric and percentage scores are clamped from 0 percent to 200 percent.
- Missing or invalid data returns no score.

Important limitation:

- Phase 3 is complete for prototype scope, but check-in windows, late submission states, trend indicators, and mandatory override-justification validation are still future work.

## 12. Development Guidance

When changing code:

- Prefer existing React Context patterns unless the change justifies a new state model.
- Keep TypeScript types in `frontend/src/types/index.ts` aligned with UI behavior.
- Keep validation rules consistent between employee and manager workflows.
- Update documentation when phase scope or business rules change.
- Be explicit about prototype limitations.
- Avoid describing localStorage as a production workflow data store.
- Preserve the mock demo flow unless replacing it with a complete alternative.

When changing documentation:

- Use the standard phase model from this file.
- Distinguish implemented features from planned features.
- Keep terminology consistent:
  - Goal sheet.
  - Thrust area.
  - Unit of Measurement or UoM.
  - Weightage.
  - Approval.
  - Return for rework.
  - Quarterly check-in.
  - Manager feedback.
- Keep Markdown ASCII-only unless there is a clear reason to add special characters.

## 13. Recommended Manual QA Flow

Use this flow after significant changes:

1. Start the app with `npm run dev`.
2. Log in as Alice.
3. Create a goal sheet with invalid total weightage and confirm validation appears.
4. Correct total weightage to 100 percent and submit.
5. Log out and log in as Charlie.
6. Confirm Alice appears in pending approvals.
7. Return the sheet with feedback.
8. Log back in as Alice and confirm feedback appears.
9. Submit a corrected sheet.
10. Log in as Charlie and approve it.
11. Log in as Alice and submit a Q1 check-in.
12. Log in as Charlie and save a Q1 manager comment, with an override score if needed.
13. Log in as Diana and confirm filters, counts, alignment, compliance, turnaround, manager summaries, department summaries, returned-goal analysis, weighted rollups, persistent audit rows, CSV export, Excel export, PDF print export, and audit CSV export are available.

## 14. Known Limitations

- Backend API foundation exists, but production deployment hardening is still in progress.
- No database.
- No password or SSO.
- No server-side RBAC.
- Audit events are backend-backed, but production immutability and retention policy still need deployment hardening.
- No notification system.
- No formal cycle configuration.
- No check-in window or late submission enforcement.
- PDF export uses the browser print flow.
- No automated tests currently documented in the app.

## 15. Documentation Set

Use the documents as follows:

- `6a06fcd06885a_AtomQuest_Hackathon_1.0_Problem_Statement_.md`: Strategic problem statement, value proposition, phase roadmap, risks, demo flow, and long-term direction.
- `PRD.md`: Product requirements, user journeys, business rules, phase-specific requirements, and acceptance criteria.
- `GEMINI.md`: AI assistant and maintainer context for working on the codebase.
- `frontend/README.md`: Setup, frontend architecture, feature guide, and operator instructions for running the prototype.
