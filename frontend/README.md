# AtomQuest Goal Setting and Tracking Portal - Frontend

## 1. Overview

This folder contains the frontend prototype for the AtomQuest Goal Setting and Tracking Portal. The application demonstrates a structured performance goal lifecycle with mock users, role-based dashboards, goal validation, manager approval, quarterly check-ins, scoring, multi-format exports, persistent local audit events, and a Phase 4 admin reporting dashboard.

The frontend is built with React, TypeScript, Vite, React Router, and Context API. Phase 5 has started: auth and workflow data now call the backend API, which is backed by Prisma and a PostgreSQL schema. It is not yet fully production-ready because production SSO tenant configuration, deployment hardening, and enterprise integrations still need completion.

## 2. Current Status

| Area | Status |
| --- | --- |
| Role-based prototype shell | Implemented |
| Employee goal creation | Implemented |
| Goal validation | Implemented |
| Manager review and approval | Implemented |
| Return for rework with feedback | Implemented |
| Approved goal lock behavior | Implemented |
| Quarterly employee check-ins | Implemented |
| Manager check-in comments | Implemented |
| Score calculation | Implemented with baseline, lower-is-better, weighted overall, and override support |
| Admin completion overview | Implemented |
| Phase 4 reporting dashboard | Complete |
| Reporting exports | Detailed CSV, Excel-compatible XLS, printable PDF, and audit CSV implemented |
| Backend database | Phase 5 foundation implemented |
| Enterprise authentication | Microsoft Entra ID SSO scaffold implemented |
| Notifications and integrations | Planned |
| Advanced analytics | Planned |

## 3. Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| State management | React Context API |
| Persistence | Backend API for workflow data; browser storage for auth session token |
| Styling | CSS and inline component styles |
| Linting | ESLint |

## 4. Getting Started

### 4.1 Prerequisites

Install the following before running the project:

- Node.js 18 or later.
- npm.

### 4.2 Install Dependencies

From the project root:

```bash
npm run install
```

Or from the `frontend` directory:

```bash
npm install
```

### 4.3 Configure Backend API

Copy `../backend/.env.example` to `../backend/.env`, set `DATABASE_URL`, and keep `ALLOWED_ORIGINS` pointed at the frontend dev URL. Then run Prisma migrations or database push from `../backend` for the target database.

### 4.4 Run the Development Servers

Start the backend API from the project root:

```bash
npm run dev:backend
```

Start the frontend from the project root:

```bash
npm run dev:frontend
```

Or from the frontend folder:

```bash
npm run dev
```

Vite will print the local URL, usually:

```text
http://localhost:5173
```

The frontend uses `VITE_API_BASE_URL` when provided and defaults to:

```text
http://localhost:3001/api
```

### 4.5 Build the Frontend

From the project root:

```bash
npm run build
```

Or from the `frontend` directory:

```bash
npm run build
```

The build command runs TypeScript project build and then creates a Vite production build.

### 4.6 Run Linting

From the project root:

```bash
npm run lint
```

Or from the `frontend` directory:

```bash
npm run lint
```

### 4.7 Preview Production Build

From the `frontend` directory:

```bash
npm run preview
```

## 5. Demo Users

The current prototype uses mock login through user selection on the login screen. No password is required.

| User | Role | Recommended Demo Use |
| --- | --- | --- |
| Alice (Employee) | Employee | Create a goal sheet, submit it, log quarterly achievements |
| Bob (Employee) | Employee | Test a second employee under the same manager |
| Charlie (Manager L1) | Manager | Review employee goal sheets and quarterly check-ins |
| Diana (Admin) | Admin | View organization-level reporting, compliance, audit rows, and CSV export |

## 6. Recommended Demo Flow

Use this sequence for the clearest end-to-end demonstration:

1. Log in as Alice.
2. Create goals with thrust areas, targets, UoM values, and weightage.
3. Try submitting with an invalid total weightage to show validation.
4. Correct weightage to exactly 100 percent and submit for approval.
5. Log out and log in as Charlie.
6. Review Alice's submitted goal sheet.
7. Return it for rework with feedback, or approve it to lock the sheet.
8. If returned, log back in as Alice, read the feedback, correct the sheet, and submit again.
9. Log in as Charlie and approve the corrected sheet.
10. Log in as Alice and submit a Q1 quarterly check-in.
11. Log in as Charlie and save a manager check-in comment, with an override score if required.
12. Log in as Diana and inspect the admin overview, thrust-area alignment, check-in compliance, approval turnaround, audit rows, and CSV export.

## 7. Project Phase Model

The frontend documentation follows the same phase model as the main project documentation.

| Phase | Name | Frontend Meaning | Status |
| --- | --- | --- | --- |
| Phase 0 | Discovery, Problem Definition, and Solution Design | Requirements, product framing, demo flow, and roadmap | Complete |
| Phase 1 | Prototype Foundation and Role-Based Shell | React app, routing, mock login, role dashboards, context, session restore | Implemented |
| Phase 2 | Goal Creation, Validation, and Manager Approval | Goal form, validation, submission, manager review, approval, return | Implemented |
| Phase 3 | Achievement Tracking, Quarterly Check-ins, and Scoring | Q1-Q4 actuals, progress status, manager comments, scoring, weighted score, overrides | Complete for prototype scope |
| Phase 4 | Reporting, Analytics, and Governance | Admin reporting dashboard, filters, compliance, alignment, turnaround, persistent audit, exports, summaries, rollups | Complete |
| Phase 5 | Backend, Security, and Enterprise Authentication | API integration, database persistence, SSO, server RBAC | In progress |
| Phase 6 | Integrations, Notifications, and Workflow Automation | HRIS sync, email or Teams reminders, escalation flows | Planned |
| Phase 7 | Intelligence, Scale, and Continuous Improvement | Advanced analytics, recommendations, risk detection, scale readiness | Planned |

## 8. Features by Phase

### 8.1 Phase 1 - Prototype Foundation and Role-Based Shell

Implemented:

- Login page with selectable mock users.
- Protected dashboard route.
- Role-based dashboard routing.
- Shared authentication context.
- Shared data context.
- Backend-backed workflow persistence after Phase 5 and frontend session restore through browser storage.
- Basic logout flow through the layout.

Primary files:

- `src/App.tsx`
- `src/pages/Login.tsx`
- `src/components/Layout.tsx`
- `src/context/AuthProvider.tsx`
- `src/context/DataProvider.tsx`
- `src/types/index.ts`

### 8.2 Phase 2 - Goal Creation, Validation, and Manager Approval

Implemented:

- Employee goal form.
- Goal draft saving.
- Goal submission for approval.
- Strategic thrust area selection.
- UoM selection.
- Target entry.
- Weightage entry.
- Validation for maximum 8 goals.
- Validation for minimum 10 percent weightage per goal.
- Validation for total weightage exactly 100 percent.
- Validation for required title and target.
- Manager pending approval list.
- Manager target and weightage editing.
- Manager approval and lock.
- Manager return for rework with required feedback.
- Employee display of submitted, approved, and returned states.

Primary files:

- `src/components/GoalForm.tsx`
- `src/components/ManagerReview.tsx`
- `src/pages/EmployeeDashboard.tsx`
- `src/pages/ManagerDashboard.tsx`

### 8.3 Phase 3 - Achievement Tracking, Quarterly Check-ins, and Scoring

Implemented:

- Quarterly selector for Q1, Q2, Q3, and Q4.
- Employee actual achievement input.
- Employee progress status input.
- Check-in submission per quarter.
- Check-in submission timestamp.
- Manager quarterly check-in review.
- Manager check-in feedback.
- Manager override score input.
- Manager override justification input.
- Weighted overall score display for the selected quarter.
- Baseline-aware numeric and percentage scoring.
- Lower-is-better numeric and percentage scoring.
- Score display for valid actuals.

Primary files:

- `src/components/EmployeeCheckIn.tsx`
- `src/components/ManagerCheckInReview.tsx`
- `src/utils/scoreCalculator.ts`

### 8.4 Phase 4 - Reporting, Analytics, and Governance

Implemented:

- Admin dashboard.
- Total employee count.
- Submitted goal sheet count.
- Approved goal sheet count.
- Average approval turnaround.
- Goal alignment by thrust area.
- Check-in compliance by quarter.
- Report filters by manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- Manager-level status and score summaries.
- Department-level status and score summaries.
- Returned goal analysis.
- Weighted score rollups.
- Detailed goal, check-in, score, override, and comment report.
- Backend audit events for submit, edit, return, approve, check-in, check-in review, and export actions.
- Detailed CSV export.
- Excel-compatible XLS export.
- Printable PDF report export.
- Audit CSV export.

Primary file:

- `src/pages/AdminDashboard.tsx`

### 8.5 Phase 5 - Backend, Security, and Enterprise Authentication

Implemented foundation:

- Frontend API client in `src/services/api.ts`.
- Backend-backed login through mock users for local development.
- JWT session token storage under `auth_access_token`.
- Goal sheets, manager review, check-ins, and audit reads routed through backend APIs.
- PostgreSQL schema, server-side validation, RBAC middleware, manager hierarchy checks, audit writes, scheduled export scaffold, and Microsoft Entra ID SSO scaffold in `../backend`.

Remaining hardening:

- Configure a real PostgreSQL database for the deployment environment.
- Complete Microsoft Entra ID tenant/client registration.
- Expand backend-backed report APIs and export formats.
- Add production deployment and recovery runbooks.

### 8.6 Phase 6 - Integrations, Notifications, and Workflow Automation

Planned:

- HRIS or employee master sync.
- Manager hierarchy sync.
- Email notifications.
- Microsoft Teams or Slack notifications.
- Check-in opening reminders.
- Overdue reminders and escalations.
- Integration with performance review systems.

### 8.7 Phase 7 - Intelligence, Scale, and Continuous Improvement

Planned:

- Goal templates and recommendations.
- Goal alignment quality checks.
- Risk detection for likely missed targets.
- Achievement trend analytics.
- Scoring anomaly detection.
- Executive dashboards.
- Performance optimization for larger user volumes.

## 9. Business Rules

Current enforced rules:

- A goal sheet can contain a maximum of 8 goals.
- Each goal must have at least 10 percent weightage.
- The total weightage across a submitted or approved sheet must equal exactly 100 percent.
- Each goal must have a title.
- Each goal must have a target.
- Manager feedback is required when returning a sheet for rework.
- Approved goal sheets are locked from normal employee editing.
- Quarterly check-ins are available only after approval.
- Quarterly check-in submissions store timestamps.
- Numeric and percentage goals can use optional baselines.
- Numeric and percentage goals can be marked as lower-is-better.
- Managers can enter override scores and override justifications.
- Admin reporting filters support manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- Audit events persist through the backend audit API.

Important planned rules:

- Add cycle start and end dates.
- Add formal amendment flow after approval.
- Add check-in submission windows.
- Require override justification when an override score is entered.
- Add audit trail for every material workflow action.

## 10. Scoring Behavior

Scoring is implemented in `src/utils/scoreCalculator.ts`.

Current behavior:

- Numeric and percentage goals without baseline: `actual / target * 100`.
- Numeric and percentage goals with baseline: progress from baseline to target.
- Lower-is-better numeric and percentage goals reverse the scoring direction.
- Timeline goals: 100 percent if the actual date is on or before the target date; otherwise 0 percent.
- Zero-based goals: 100 percent if the actual value is 0; otherwise 0 percent.
- Manager override score takes priority over calculated score when provided.
- Employee check-in displays a weighted overall score for the selected quarter.
- Numeric and percentage scores are clamped between 0 percent and 200 percent.
- Empty, invalid, or missing actuals return no score.

Known scoring limitations:

- Override justification is captured but not required by validation.
- Weighted overall score is visible in employee check-in and admin rollups.
- Check-in windows, late status, and quarter-over-quarter trends are still planned.

## 11. Data Model Summary

Core types are defined in `src/types/index.ts`.

Important types:

- `Role`: `EMPLOYEE`, `MANAGER`, or `ADMIN`.
- `UoM`: `NUMERIC`, `PERCENTAGE`, `TIMELINE`, or `ZERO`.
- `GoalSheetStatus`: `DRAFT`, `SUBMITTED`, `APPROVED`, or `RETURNED`.
- `Quarter`: `Q1`, `Q2`, `Q3`, or `Q4`.
- `ProgressStatus`: `NOT_STARTED`, `ON_TRACK`, or `COMPLETED`.
- `User`: mock user, department, and manager mapping.
- `Goal`: title, description, thrust area, UoM, optional baseline, target, weightage, shared KPI flag, and lower-is-better flag.
- `GoalSheet`: employee-owned sheet with cycle, status, goals, feedback, and check-ins.
- `CheckIn`: quarter-specific achievements, manager comment, submission status, and submission timestamp.
- `GoalAchievement`: actual value, progress status, override score, and override justification.
- `AuditEvent`: persistent local audit event for governance reporting.

## 12. LocalStorage Persistence

The frontend stores only session state in browser localStorage. Goal workflow data is loaded from the backend API.

| Key | Description |
| --- | --- |
| `auth_access_token` | Backend JWT access token for local development |
| `auth_current_user` | Last signed-in user used to restore protected routes |

To reset frontend session state, clear these browser keys. To reset workflow data, reseed or reset the backend database.

## 13. Source File Guide

| File | Purpose |
| --- | --- |
| `src/main.tsx` | React application entry point |
| `src/App.tsx` | Routes, protected route, and role-based dashboard routing |
| `src/types/index.ts` | Core types, mock users, and thrust areas |
| `src/context/AuthProvider.tsx` | Mock auth state, login, logout, and user persistence |
| `src/context/DataProvider.tsx` | Goal sheet state, status changes, check-ins, and backend API writes |
| `src/pages/Login.tsx` | Mock user selection screen |
| `src/pages/EmployeeDashboard.tsx` | Employee goal and check-in experience |
| `src/pages/ManagerDashboard.tsx` | Manager approval and check-in navigation |
| `src/pages/AdminDashboard.tsx` | Admin reporting dashboard, filters, exports, compliance, alignment, turnaround, rollups, summaries, and audit trail |
| `src/components/GoalForm.tsx` | Employee goal creation and validation form |
| `src/components/ManagerReview.tsx` | Manager goal review, edit, approve, and return flow |
| `src/components/EmployeeCheckIn.tsx` | Employee quarterly achievement entry |
| `src/components/ManagerCheckInReview.tsx` | Manager quarterly check-in review, comments, score overrides, and justifications |
| `src/utils/scoreCalculator.ts` | Score calculation logic |

## 14. Manual QA Checklist

Run this checklist before demos or after meaningful frontend changes:

1. Start the app with `npm run dev`.
2. Log in as Alice.
3. Create a goal sheet with invalid total weightage and confirm validation appears.
4. Correct total weightage to 100 percent and submit.
5. Log out and log in as Charlie.
6. Confirm Alice appears under pending approvals.
7. Return the sheet with feedback.
8. Log in as Alice and confirm feedback appears.
9. Resubmit the corrected sheet.
10. Log in as Charlie and approve it.
11. Log in as Alice and confirm the sheet is locked.
12. Submit a Q1 check-in.
13. Log in as Charlie and save Q1 check-in feedback, optionally adding an override score and justification.
14. Log in as Diana and confirm admin counts, filters, approval turnaround, thrust-area alignment, check-in compliance, returned-goal analysis, manager and department summaries, weighted rollups, persistent audit rows, CSV export, Excel export, printable PDF export, and audit CSV export.
15. Refresh the browser and confirm backend-backed data is still available after the session restores.

## 15. Known Limitations

- localStorage is used only for frontend session state.
- Mock auth does not provide real security.
- Role access is enforced only by frontend behavior.
- Backend API and database schema foundation exists, but production deployment hardening is still in progress.
- Audit persistence is backend-backed, but production immutability and retention policy still need hardening.
- PDF export uses the browser print flow.
- There are no notifications.
- There is no cycle configuration.
- There is no check-in window or late submission enforcement.
- There is no automated test suite currently included.
- Scoring is functional for prototype use but still needs production policy validation.

## 16. Production Readiness Roadmap

Recommended next implementation order:

1. Complete production database provisioning and migrations.
2. Complete Microsoft Entra ID tenant configuration and callback registration.
3. Expand backend-backed report exports and filters.
4. Harden immutable audit retention and access policy.
5. Add deployment and recovery runbooks.
6. Add check-in windows and reminder states.
7. Add notification integrations.
8. Add advanced scoring configuration.
9. Add automated tests and CI/CD.
10. Add analytics and recommendation capabilities.

## 17. Related Documentation

Project-level documents:

- `../6a06fcd06885a_AtomQuest_Hackathon_1.0_Problem_Statement_.md`
- `../PRD.md`
- `../GEMINI.md`

Read those files for the strategic brief, full PRD, project phase model, and maintainer context.
