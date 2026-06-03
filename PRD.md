# Product Requirements Document: AtomQuest Goal Setting and Tracking Portal

## 1. Document Control

| Field | Value |
| --- | --- |
| Product | AtomQuest Goal Setting and Tracking Portal |
| Document Type | Product Requirements Document |
| Version | 2.0 |
| Prepared For | AtomQuest Hackathon 1.0 and post-hackathon product handoff |
| Current Prototype Status | Phase 1 through Phase 4 complete; Phase 5 foundation in progress |
| Primary Platform | Web application |
| Current Persistence | Backend API with Prisma/PostgreSQL foundation; browser storage only keeps auth session tokens |

## 2. Product Overview

AtomQuest is a role-based web portal for goal setting, manager approval, quarterly achievement tracking, and performance visibility. It helps an organization move from manual goal tracking to a structured digital workflow where goals are measurable, validated, reviewed, locked, tracked, and eventually reported.

The current implementation is a React and TypeScript web application with a Phase 5 backend foundation. The frontend uses React, Vite, React Router, and Context API, while goal sheets, check-ins, audit events, and reports are moving behind a Fastify, Prisma, and PostgreSQL API. Mock users remain available for local development while Microsoft Entra ID SSO is scaffolded for enterprise authentication.

## 3. Problem Statement

Manual goal management creates fragmentation, delayed feedback, inconsistent scoring, and heavy HR administration. Employees may not know whether their goals are aligned. Managers may not review goals consistently. HR may struggle to know which teams have submitted, which managers are blocking approvals, and whether check-ins are happening on time.

AtomQuest solves this by creating a governed workflow for:

- Goal creation.
- Goal validation.
- Manager review.
- Approval or return for rework.
- Goal lock after approval.
- Quarterly achievement updates.
- Manager check-in feedback.
- Admin completion visibility.
- Future reporting, authentication, audit, and integrations.

## 4. Goals and Non-Goals

### 4.1 Product Goals

- Provide one structured system for employee goal sheets.
- Enforce consistent goal validation rules.
- Give managers a clear approval and feedback workflow.
- Enable quarterly progress tracking after approval.
- Calculate achievement scores from actuals and targets.
- Give admins visibility into completion and approval status.
- Create a scalable foundation for backend persistence, enterprise authentication, reporting, and analytics.

### 4.2 Current Prototype Goals

- Demonstrate the end-to-end role-based journey.
- Validate business rules through frontend behavior.
- Prove the data model and workflow before backend implementation.
- Support a polished hackathon demo with mock users and local persistence.

### 4.3 Non-Goals for Current Prototype

- Production authentication.
- Real database persistence.
- Server-side authorization.
- Server-side immutable audit log implementation.
- Enterprise SSO.
- HRIS integration.
- Notification delivery.
- Scheduled or backend-governed report delivery.
- Advanced analytics or AI recommendations.

## 5. Personas and Role Responsibilities

| Role | Description | Responsibilities | Current Implementation |
| --- | --- | --- | --- |
| Employee | Individual contributor who owns goals | Create goals, save drafts, submit for approval, update quarterly achievements, view feedback | Implemented |
| Manager L1 | Direct manager of employees | Review submitted goals, edit targets and weightage, approve, return with feedback, review check-ins | Implemented |
| Admin / HR | Process owner and governance stakeholder | Monitor submissions, approvals, completion, alignment, check-in compliance, exports, score rollups, returned sheets, summaries, and audit events | Implemented for prototype scope |
| Leadership | Strategic stakeholder | Review alignment, trends, and risk across teams | Planned |
| System Admin | Technical and operational owner | Configure cycles, users, roles, integrations, and data retention | Planned |

## 6. Project Phase Roadmap

| Phase | Name | Objective | Status |
| --- | --- | --- | --- |
| Phase 0 | Discovery, Problem Definition, and Solution Design | Define problem, users, workflow, rules, and MVP boundaries | Complete |
| Phase 1 | Prototype Foundation and Role-Based Shell | Build app shell, mock auth, role routing, shared state, and local persistence | Implemented |
| Phase 2 | Goal Creation, Validation, and Manager Approval | Enable goal sheet drafting, submission, manager review, return, approval, and lock | Implemented |
| Phase 3 | Achievement Tracking, Quarterly Check-ins, and Scoring | Enable quarterly actuals, status updates, score calculation, weighted scoring, manager comments, and score overrides | Complete for prototype scope |
| Phase 4 | Reporting, Analytics, and Governance | Add exports, richer dashboards, status filters, audit reports, compliance views, rollups, and summaries | Complete |
| Phase 5 | Backend, Security, and Enterprise Authentication | Add APIs, database, server RBAC, audit logs, SSO, and deployment hardening | In progress |
| Phase 6 | Integrations, Notifications, and Workflow Automation | Add HRIS sync, org hierarchy sync, reminders, email, Teams or Slack workflows | Planned |
| Phase 7 | Intelligence, Scale, and Continuous Improvement | Add analytics, recommendations, risk signals, trend analysis, and scale readiness | Planned |

## 7. Functional Requirements by Phase

### 7.1 Phase 0 - Discovery, Problem Definition, and Solution Design

Requirements:

- Define the business problem and stakeholders.
- Identify user roles and permissions.
- Define core workflow states.
- Define goal sheet validation rules.
- Define supported units of measurement.
- Define hackathon MVP and future scope.
- Prepare documentation for delivery and handoff.

Acceptance criteria:

- The product problem is documented.
- The phase roadmap is documented.
- MVP and future scope are clearly separated.
- Demo flow and success criteria are available.

### 7.2 Phase 1 - Prototype Foundation and Role-Based Shell

Requirements:

- The application must run as a React and TypeScript web app.
- The app must support route protection for dashboard access.
- The app must provide mock login without requiring passwords.
- The app must route users by role:
  - Employee to Employee Dashboard.
  - Manager to Manager Dashboard.
  - Admin to Admin Dashboard.
- The Phase 1 prototype persisted active user and goal sheet state in browser localStorage.
- Phase 5 now keeps frontend session state in browser storage while moving goal workflow data to backend APIs.

Current implementation:

- `AuthProvider` manages mock login and logout.
- `DataProvider` manages goal sheet state through backend API persistence.
- `App.tsx` routes users through a protected dashboard route.
- Mock users are defined in `frontend/src/types/index.ts`.

Acceptance criteria:

- Users can log in as Alice, Bob, Charlie, or Diana.
- Each role sees the correct dashboard.
- Refreshing the browser does not immediately clear saved data.
- Logging out clears the active user session.

### 7.3 Phase 2 - Goal Creation, Validation, and Manager Approval

Requirements:

- Employees must be able to create a goal sheet.
- Employees must be able to save a draft.
- Employees must be able to submit goals for approval.
- Goals must include:
  - Title.
  - Thrust area.
  - Unit of measurement.
  - Optional baseline.
  - Target.
  - Weightage.
  - Optional lower-is-better flag.
  - Optional description field in the data model.
- Supported thrust areas must include:
  - Revenue Growth.
  - Operational Efficiency.
  - Customer Satisfaction.
  - Innovation.
  - Safety and Compliance.
- Supported UoM values must include:
  - Numeric.
  - Percentage.
  - Timeline.
  - Zero-based.
- Validation must enforce:
  - Maximum 8 goals.
  - Minimum 10 percent weightage per goal.
  - Total weightage exactly 100 percent.
  - Title required.
  - Target required.
- Managers must be able to view submitted goal sheets for their team members.
- Managers must be able to edit targets and weightage before approval.
- Managers must be able to approve valid sheets.
- Managers must be able to return sheets for rework.
- Return for rework must require feedback.
- Approved sheets must be locked from normal employee editing.
- Returned sheets must be editable by employees.

Current implementation:

- `GoalForm.tsx` handles employee goal creation and validation.
- `ManagerReview.tsx` handles review, target edits, weightage edits, approval, and return.
- `EmployeeDashboard.tsx` displays status and returned feedback.
- `ManagerDashboard.tsx` groups pending and reviewed goal sheets.

Acceptance criteria:

- Invalid weightage totals cannot be submitted.
- Goals below 10 percent weightage cannot be submitted.
- More than 8 goals cannot be added.
- Manager cannot approve an invalid weightage total.
- Manager feedback is required for return.
- Approved goal sheets display as locked to employees.

### 7.4 Phase 3 - Achievement Tracking, Quarterly Check-ins, and Scoring

Requirements:

- Employees must be able to access check-ins after goal sheet approval.
- Employees must be able to select Q1, Q2, Q3, or Q4.
- Employees must be able to enter actual achievement for each goal.
- Employees must be able to set progress status:
  - Not Started.
  - On Track.
  - Completed.
- Employees must be able to submit check-ins per quarter.
- Managers must be able to review submitted check-ins.
- Managers must be able to view target, actual, UoM, status, and score.
- Managers must be able to save quarterly check-in comments.
- The system must calculate achievement scores for supported UoM types.
- The system should support weighted overall score display.
- Managers should be able to override calculated scores with a justification.

Current scoring rules:

- Zero-based: score is 100 percent when actual is 0, otherwise 0 percent.
- Timeline: score is 100 percent when actual date is on or before target date, otherwise 0 percent.
- Numeric and percentage without baseline: score is `actual / target * 100`, clamped between 0 percent and 200 percent.
- Numeric and percentage with baseline: score is calculated as progress from baseline to target.
- Lower-is-better numeric and percentage goals are supported.
- Manager override score takes priority over calculated score when provided.
- Empty or invalid actuals return no score.

Current implementation:

- `EmployeeCheckIn.tsx` supports quarterly actual entry and submission.
- `EmployeeCheckIn.tsx` displays weighted overall score for the selected quarter.
- `ManagerCheckInReview.tsx` supports quarterly review, comments, override score, and override justification capture.
- `scoreCalculator.ts` computes achievement scores, baseline-aware scores, lower-is-better scores, and override scores.
- `GoalForm.tsx` captures optional baseline and lower-is-better configuration.

Acceptance criteria:

- Check-ins appear only for approved goal sheets.
- Employees can submit Q1 through Q4 check-ins.
- Managers can inspect submitted check-ins.
- Manager comments persist with the selected quarter.
- Scores appear consistently for valid actuals.
- Prototype Phase 3 is complete. Remaining production gaps include check-in windows, late submission handling, trend indicators, and mandatory override justification validation.

### 7.5 Phase 4 - Reporting, Analytics, and Governance

Requirements:

- Admins must be able to monitor goal sheet completion.
- Admins must be able to monitor approval status.
- Admins should be able to inspect audit activity.
- Managers should be able to view team-level summaries.
- HR should be able to export data for analysis.
- Reports should support filtering by manager, department, employee, status, cycle, quarter, thrust area, and audit action.

Implemented capabilities:

- `AdminDashboard.tsx` shows total employees, submitted goal sheets, approved sheets, and average approval turnaround.
- `AdminDashboard.tsx` shows goal alignment counts by thrust area.
- `AdminDashboard.tsx` shows check-in compliance by quarter.
- `AdminDashboard.tsx` provides filters for manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- `AdminDashboard.tsx` provides manager-level summaries.
- `AdminDashboard.tsx` provides department-level summaries.
- `AdminDashboard.tsx` provides returned-goal analysis.
- `AdminDashboard.tsx` provides weighted score rollups.
- `AdminDashboard.tsx` provides detailed goal, check-in, score, override, and comment report rows.
- `AdminDashboard.tsx` provides detailed CSV export.
- `AdminDashboard.tsx` provides Excel-compatible XLS export.
- `AdminDashboard.tsx` provides printable PDF export.
- `AdminDashboard.tsx` provides audit CSV export.
- `DataProvider.tsx` reads audit events from the backend audit API.
- `DataProvider.tsx` logs submit, edit, return, approve, check-in, check-in review, and export events.

Acceptance criteria:

- HR can identify missing submissions and pending manager approvals from status metrics and filters.
- HR can export detailed goal, check-in, score, comment, and audit data.
- Admins can inspect persistent local audit history for critical prototype workflow changes.
- Leadership can inspect thrust-area alignment, compliance, manager summaries, department summaries, and weighted score rollups.
- Phase 4 prototype scope is 100% complete. (Production immutability, scheduled exports, and backend governance are tracked in Phase 5).

### 7.6 Phase 5 - Backend, Security, and Enterprise Authentication

Requirements:

- Replace localStorage with persistent backend storage.
- Provide APIs for:
  - Users.
  - Goal sheets.
  - Goals.
  - Check-ins.
  - Manager comments.
  - Audit events.
  - Reports.
- Add PostgreSQL or equivalent relational database.
- Add server-side validation for all business rules.
- Add role-based access control on the backend.
- Add manager hierarchy authorization.
- Add SSO through Microsoft Entra ID or equivalent identity provider.
- Add immutable audit event storage and make events server-enforced.
- Move reports and audit storage from localStorage to backend APIs.
- Add scheduled exports and report-level access controls.
- Add deployment environment configuration.
- Add CI checks for linting, type-checking, tests, and build.

Current implementation:

- `backend/src/app.ts` exposes Fastify API routes for auth, users, goal sheets, check-ins, reports, and audit events.
- `backend/prisma/schema.prisma` defines a PostgreSQL relational schema for users, goal sheets, goals, check-ins, achievements, and audit events.
- `backend/src/validators/index.ts` adds server-side validation for goal sheets, manager review, check-ins, and check-in review.
- `backend/src/middleware/auth.ts` enforces JWT authentication and role checks.
- Manager hierarchy authorization is enforced for manager review and check-in review services.
- Mock-user login issues backend JWTs and upserts local development users into the database.
- Microsoft Entra ID SSO routes are scaffolded through MSAL configuration.
- Audit events are written server-side for submit, edit, return, approve, unlock, check-in, check-in review, and export actions.
- Frontend auth and workflow data now call backend APIs instead of persisting goal workflow data only in browser localStorage.
- `backend/.env.example` documents deployment environment variables.
- `.github/workflows/ci.yml` runs Prisma validation, backend build, backend tests, frontend lint, and frontend build.

Acceptance criteria:

- Data persists across browsers and devices.
- Users authenticate through enterprise identity.
- Employees cannot access other employees' private goal data.
- Managers can only access authorized team members.
- Admin access is controlled and auditable.
- Audit events are written for submit, return, approve, edit, unlock, and check-in actions.

### 7.7 Phase 6 - Integrations, Notifications, and Workflow Automation

Requirements:

- Integrate with HRIS or employee master data source.
- Sync manager hierarchy.
- Send notifications for:
  - Goal submission.
  - Goal return.
  - Goal approval.
  - Pending approval reminders.
  - Quarterly check-in opening.
  - Overdue check-ins.
- Support email notifications.
- Support Microsoft Teams or Slack notifications.
- Support reminder schedules and escalation rules.
- Provide import and export interfaces for appraisal systems.

Acceptance criteria:

- New employees and manager changes sync without manual entry.
- Users receive notifications at key workflow points.
- Admins can configure reminder timing.
- Failed integrations are visible to system owners.

### 7.8 Phase 7 - Intelligence, Scale, and Continuous Improvement

Requirements:

- Provide trend analysis across quarters and cycles.
- Identify goals at risk of missing targets.
- Suggest goal templates based on role or department.
- Highlight weak alignment to thrust areas.
- Detect scoring or weightage anomalies.
- Provide leadership heatmaps and executive summaries.
- Support large organization performance targets.
- Improve accessibility, responsiveness, and observability.

Acceptance criteria:

- Risk signals are explainable.
- Recommendation features are optional and manager-controlled.
- Reporting remains performant for large datasets.
- Data insights improve planning without reducing transparency.

## 8. Core User Journeys

### 8.1 Employee Goal Submission

1. Employee logs in.
2. Employee opens dashboard.
3. Employee creates or edits goals.
4. Employee confirms total weightage equals 100 percent.
5. Employee saves draft or submits for approval.
6. System stores the goal sheet and updates status.
7. Employee sees submitted status while waiting for manager review.

### 8.2 Manager Approval

1. Manager logs in.
2. Manager opens pending approvals.
3. Manager reviews submitted goal sheet.
4. Manager edits target or weightage if needed.
5. Manager approves valid sheet or returns it with feedback.
6. System updates the status and stores manager feedback or approval timestamp.

### 8.3 Employee Quarterly Check-in

1. Employee logs in after goal sheet approval.
2. Employee opens quarterly check-in.
3. Employee selects a quarter.
4. Employee enters actual achievement and status for each goal.
5. System calculates score where possible.
6. Employee submits check-in.
7. System stores check-in data by quarter.

### 8.4 Manager Check-in Review

1. Manager opens reviewed goal sheets.
2. Manager selects quarterly check-in for an approved employee sheet.
3. Manager selects the relevant quarter.
4. Manager reviews submitted actuals, statuses, and scores.
5. Manager adds structured feedback.
6. System saves the manager comment.

### 8.5 Admin Monitoring

1. Admin logs in.
2. Admin views total employees.
3. Admin views submitted and approved goal sheet counts.
4. Admin views average approval turnaround.
5. Admin reviews goal alignment by thrust area.
6. Admin reviews check-in compliance by quarter.
7. Admin exports current goal sheet data to CSV.
8. Admin inspects persistent local audit activity.
9. Future versions add filters, expanded exports, and persistent audit governance.

## 9. Data Model Requirements

### 9.1 User

Required fields:

- `id`
- `name`
- `role`
- `managerId` when the user reports to a manager
- `department`

Allowed roles:

- `EMPLOYEE`
- `MANAGER`
- `ADMIN`

### 9.2 Goal

Required fields:

- `id`
- `title`
- `description`
- `thrustArea`
- `uom`
- `baseline` when available
- `target`
- `weightage`
- `isShared` when the goal is managed as a shared KPI
- `isLowerBetter` when lower actuals should score better

Allowed UoM values:

- `NUMERIC`
- `PERCENTAGE`
- `TIMELINE`
- `ZERO`

### 9.3 Goal Sheet

Required fields:

- `id`
- `employeeId`
- `cycle`
- `status`
- `goals`
- `submittedAt`
- `approvedAt`
- `managerFeedback`
- `checkIns`

Allowed statuses:

- `DRAFT`
- `SUBMITTED`
- `APPROVED`
- `RETURNED`

### 9.4 Check-in

Required fields:

- `quarter`
- `achievements`
- `managerComment`
- `isSubmitted`
- `submittedAt`

Allowed quarters:

- `Q1`
- `Q2`
- `Q3`
- `Q4`

### 9.5 Achievement

Required fields:

- `actual`
- `status`
- `overrideScore`
- `overrideJustification`

Allowed progress statuses:

- `NOT_STARTED`
- `ON_TRACK`
- `COMPLETED`

### 9.6 Audit Event

Required fields:

- `id`
- `timestamp`
- `action`
- `actorId`
- `targetId`
- `details`

Supported prototype actions:

- `SUBMIT`
- `RETURN`
- `APPROVE`
- `EDIT`
- `UNLOCK`
- `CHECK_IN`
- `CHECK_IN_REVIEW`
- `EXPORT`

## 10. Business Rules

- A goal sheet must have no more than 8 goals.
- Every submitted goal must have a title and target.
- Every goal must have at least 10 percent weightage.
- Total goal sheet weightage must equal exactly 100 percent.
- Employees can edit draft and returned goal sheets.
- Submitted goal sheets wait for manager review.
- Approved goal sheets are locked from normal employee editing.
- Returned goal sheets must include manager feedback.
- Check-ins are available only after approval.
- Check-in data is stored by quarter.
- Manager check-in comments are stored by quarter.
- Numeric and percentage goals can use optional baselines.
- Numeric and percentage goals can be marked as lower-is-better.
- Managers can enter override scores and override justifications during check-in review.

## 11. Technical Requirements

### 11.1 Current Frontend

- React 19.
- TypeScript.
- Vite.
- React Router 7.
- Context API.
- Backend API persistence for workflow data.
- Browser localStorage only for frontend auth session state.
- CSS and inline styles.

### 11.2 Current Commands

From the repository root:

```bash
npm run install
npm run dev
npm run build
npm run lint
```

From the frontend folder:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

### 11.3 Production Technical Direction

- Backend API with Node.js and Express or NestJS.
- PostgreSQL database.
- ORM and migrations with Prisma or TypeORM.
- Microsoft Entra ID for SSO.
- Server-side RBAC and manager hierarchy checks.
- Immutable audit event table.
- Reporting jobs or query views for admin dashboards.
- CI/CD pipeline for lint, type-check, test, build, and deploy.
- Monitoring, structured logs, and error tracking.

## 12. Reporting Requirements

Current:

- Total employees.
- Submitted goal sheets.
- Approved goal sheets.
- Average approval turnaround.
- Goal alignment by thrust area.
- Check-in compliance by quarter.
- Filters by manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- Manager summary.
- Department summary.
- Returned goal analysis.
- Weighted score rollups.
- Detailed goal, check-in, score, override, and manager comment report.
- Detailed CSV export.
- Excel-compatible XLS export.
- Printable PDF export.
- Audit CSV export.
- Persistent local audit events for submit, edit, return, approve, check-in, check-in review, and export actions.

Planned:

- Backend-backed report queries.
- Immutable server-side audit reporting.
- Scheduled exports and role-protected report access.
- HRIS-backed departments, hierarchy, and cycle management.

## 13. Security and Governance Requirements

Current prototype:

- Role behavior is simulated in the frontend.
- Data is stored in the browser.
- No real password, token, or server-side enforcement exists.
- Audit events are persisted through the backend audit event table. Production immutability and retention enforcement still require deployment hardening.

Production:

- Authenticate all users through enterprise identity.
- Authorize all API requests server-side.
- Prevent employees from reading or editing others' data.
- Restrict manager access to assigned team members.
- Restrict admin actions to approved HR/system admin roles.
- Record audit events for sensitive actions.
- Validate all inputs server-side.
- Protect production deployments with HTTPS and secure environment configuration.

## 14. Success Metrics

Prototype success:

- Demo can complete employee, manager, and admin journeys.
- Validation prevents incorrect submissions.
- Goal approval and check-in flows persist locally.
- Phase 3 is complete for the prototype scope.
- Phase 4 is complete with filters, summaries, rollups, persistent local audit, and CSV/Excel/PDF/audit exports.
- Documentation clearly communicates completed and future phases.

Product success:

- More than 90 percent goal sheet submission by target date.
- More than 90 percent manager approval completion by target date.
- More than 80 percent quarterly check-in completion.
- Reduced HR manual consolidation time.
- Improved visibility into strategic goal alignment.
- Lower number of late-cycle goal disputes due to clearer approval history.

## 15. Dependencies and Assumptions

Dependencies:

- Employee and manager hierarchy source for production.
- HR policy for goal cycles and check-in windows.
- Identity provider for SSO.
- Agreement on scoring rules by UoM.
- Reporting requirements from HR and leadership.

Assumptions:

- Employees have one direct manager for the prototype.
- One active goal sheet per employee is sufficient for the prototype.
- LocalStorage is acceptable only for hackathon demonstration.
- Current score calculation supports baseline, lower-is-better, weighted overall display, and manager overrides, but still needs production policy validation.
- Admin dashboard is a complete Phase 4 prototype, but production HR reporting still requires backend-backed data governance.

## 16. Open Questions

- Should goal cycles be annual, quarterly, project-based, or configurable?
- Should manager score overrides require a justification before saving?
- Should weightage edits after approval require employee acknowledgement?
- What exact server-side audit retention rules are mandatory for HR compliance?
- Which HRIS or employee directory should become the source of truth?
- Should exports be scheduled or only generated on demand?
- Should shared KPIs be mandatory for selected roles or optional templates?

## 17. Release Plan

### Hackathon Release

- Complete prototype flow.
- Polish documentation.
- Demonstrate core user journeys.
- Capture known limitations.

### Pilot Release

- Add backend and database.
- Add real authentication.
- Add role enforcement.
- Move audit events to immutable backend storage.
- Move reports and exports to backend-backed reporting APIs.
- Pilot with a small team.

### Organization Release

- Add HRIS sync.
- Add notifications.
- Add admin reporting.
- Add manager hierarchy support.
- Add production monitoring and support model.

### Scale Release

- Add analytics and recommendations.
- Add multi-cycle history.
- Add executive dashboards.
- Optimize performance and reliability.

## 18. Appendix: Demo Users

| User | Role | Purpose |
| --- | --- | --- |
| Alice (Employee) | Employee | Create goals and submit check-ins |
| Bob (Employee) | Employee | Additional employee for manager view |
| Charlie (Manager L1) | Manager | Review employee goals and check-ins |
| Diana (Admin) | Admin | View organization-level overview |

No password is required in the current prototype. Users are selected from the login screen.
