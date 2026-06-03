# AtomQuest Hackathon 1.0 - Problem Statement, Product Strategy, and Roadmap

## 1. Executive Summary

AtomQuest is an in-house Goal Setting and Tracking Portal designed to replace spreadsheet-driven performance planning with a structured, transparent, role-based digital workflow. The portal helps employees define measurable goals, helps managers review and approve those goals, and gives HR or leadership a clearer view of completion, progress, and organizational alignment.

The current hackathon prototype demonstrates the most important workflow: an employee creates a goal sheet, submits it for manager approval, receives approval or rework feedback, logs quarterly achievements after approval, and receives manager check-in comments. The frontend is implemented with React, TypeScript, Vite, React Router, Context API state, and browser localStorage as a mock persistence layer.

This document defines the problem, users, product scope, implementation phases, acceptance criteria, technical direction, risks, and long-term roadmap for turning the prototype into a production-ready enterprise performance enablement platform.

## 2. Background and Problem Context

Many organizations still manage annual goals, quarterly progress, and appraisal inputs through manual tools such as spreadsheets, email threads, shared drives, and informal manager updates. These tools are flexible, but they create operational issues as the organization grows.

Key challenges include:

- Goal fragmentation: Goals live in multiple documents and are difficult to aggregate, compare, audit, or roll up.
- Limited alignment: Employees may not clearly map their work to strategic business thrust areas.
- Delayed feedback: Managers often discover risks late in the cycle, usually near appraisal time.
- Inconsistent scoring: Teams may use different interpretations of achievement, weightage, and progress.
- Low auditability: Approval, return, edit, and check-in decisions are difficult to reconstruct.
- HR overhead: HR teams spend unnecessary time chasing submissions, consolidating sheets, and preparing reports.

The result is a performance process that can feel reactive, subjective, and administratively heavy. AtomQuest solves this by creating one governed system for goal creation, approval, achievement tracking, manager feedback, and reporting.

## 3. Product Vision

AtomQuest should become the organization's trusted operating layer for performance goal management. The product should make goal planning more measurable, progress conversations more continuous, and leadership reporting more reliable.

The long-term vision is to provide:

- A single source of truth for employee goals and achievement history.
- A clear approval and lock workflow for goal baselines.
- Quarterly check-ins that preserve context before the final appraisal cycle.
- Role-specific dashboards for employees, managers, admins, and leadership.
- Reliable scoring rules that reduce ambiguity and manual calculation effort.
- Enterprise readiness through secure authentication, audit trails, integrations, and scalable storage.
- Future intelligence features that identify risk, suggest goals, and highlight alignment gaps.

## 4. Value Proposition

AtomQuest creates value for each stakeholder group.

For employees:

- Clearer expectations and measurable targets.
- Better visibility into approved goals and quarterly achievement history.
- Faster feedback from managers.
- Reduced confusion during performance reviews.

For managers:

- A structured review flow for team goals.
- Ability to edit targets and weightages before approval.
- A simple way to approve, return, lock, and comment on goal sheets.
- Better visibility into team progress across quarters.

For HR and admins:

- Organization-wide completion visibility.
- A stronger audit trail for approvals and status changes.
- Reduced manual consolidation effort.
- A platform foundation for future appraisal and reporting workflows.

For leadership:

- Better insight into strategic alignment.
- More timely signals on execution risk.
- A path toward analytics-driven workforce planning.

## 5. Target Users and Personas

| Persona | Primary Need | Core Actions | Success Measure |
| --- | --- | --- | --- |
| Employee | Define and track measurable goals | Create goals, submit goal sheet, log quarterly actuals, view manager feedback | Goals approved on time and check-ins completed |
| Manager L1 | Review and guide team performance | Review submitted goals, edit target or weightage, approve, return for rework, review check-ins | Team goals are aligned, complete, and reviewed promptly |
| Admin / HR | Monitor process adoption and governance | View completion metrics, inspect status distribution, prepare reports, manage policy | High submission compliance and reliable audit data |
| Leadership | Understand alignment and execution | Review roll-ups, identify risk areas, inspect trends | Strategic thrust areas are measurable and tracked |
| System Owner | Operate and scale the platform | Configure cycles, maintain integrations, monitor quality and uptime | Stable, secure, and supportable system |

## 6. Current Prototype Summary

The current implementation is a frontend prototype with mock data and local browser persistence. It demonstrates the core user experience and validates the workflow logic before backend investment.

Implemented capabilities:

- Mock login through user selection.
- Role-based routing for Employee, Manager, and Admin dashboards.
- Employee goal sheet creation and editing.
- Goal validation rules:
  - Maximum of 8 goals per employee.
  - Minimum 10 percent weightage per goal.
  - Total goal sheet weightage must equal exactly 100 percent.
  - Goal title and target are required.
- Strategic thrust area selection.
- Optional baseline capture for numeric and percentage goals.
- Lower-is-better metric configuration for metrics such as defects, incidents, or turnaround time.
- Supported units of measurement:
  - Numeric.
  - Percentage.
  - Timeline.
  - Zero-based.
- Draft save and submit for approval.
- Manager review of submitted goal sheets.
- Manager target and weightage edits before approval.
- Manager approval and lock behavior.
- Return for rework with required manager feedback.
- Employee quarterly check-in submission for Q1, Q2, Q3, and Q4 after approval.
- Achievement actuals and progress status logging.
- Manager quarterly check-in review and structured comments.
- Manager score override and override justification capture during check-in review.
- Automated score calculation for supported UoM types, including baseline-aware and lower-is-better numeric scoring.
- Weighted overall quarterly score display in the employee check-in view.
- Check-in submission timestamp capture.
- Admin overview for total employees, submitted goal sheets, approved goal sheets, average approval turnaround, goal alignment by thrust area, check-in compliance by quarter, filters, manager summaries, department summaries, returned-goal analysis, weighted rollups, persistent local audit events, detailed CSV export, Excel-compatible export, printable PDF export, and audit CSV export.
- localStorage persistence using `app_goal_sheets`, `app_shared_goals`, and `auth_user_id`.

Prototype constraints:

- No real backend or database.
- No password, SSO, or enterprise identity provider.
- No server-side authorization.
- No server-side immutable audit log table; prototype audit events persist in localStorage.
- Exports are implemented in the frontend prototype, but production export governance still requires backend support.
- No notifications or workflow reminders.
- No production-grade test suite.

## 7. Project Phase Model

AtomQuest should be described and delivered through the following phases. This phase model is used consistently across the problem statement, PRD, AI context file, and frontend README.

| Phase | Name | Primary Outcome | Current Status |
| --- | --- | --- | --- |
| Phase 0 | Discovery, Problem Definition, and Solution Design | Align on problem, users, rules, MVP boundaries, and success criteria | Complete for hackathon |
| Phase 1 | Prototype Foundation and Role-Based Shell | Establish frontend app, routing, mock login, role dashboards, shared state, and local persistence | Implemented |
| Phase 2 | Goal Creation, Validation, and Manager Approval | Allow employees to create goal sheets and managers to review, return, approve, and lock them | Implemented |
| Phase 3 | Achievement Tracking, Quarterly Check-ins, and Scoring | Allow employees to submit quarterly actuals and managers to review progress with comments | Complete for prototype scope |
| Phase 4 | Reporting, Analytics, and Governance | Add richer dashboards, exports, compliance views, summaries, rollups, and audit reporting | Complete |
| Phase 5 | Backend, Security, and Enterprise Authentication | Replace localStorage with APIs, database, RBAC, audit logs, and SSO | Planned |
| Phase 6 | Integrations, Notifications, and Workflow Automation | Connect to HRIS, org directory, email, Teams or Slack, reminders, and approval automation | Planned |
| Phase 7 | Intelligence, Scale, and Continuous Improvement | Add advanced analytics, recommendations, trend detection, risk prediction, and production scale | Planned |

## 8. Phase Details

### Phase 0 - Discovery, Problem Definition, and Solution Design

Purpose:

- Convert the hackathon idea into a clear product problem, target workflow, and delivery plan.

Key activities:

- Identify stakeholders and personas.
- Define the goal lifecycle from draft to approval to quarterly review.
- Establish validation rules for goal count and weightage.
- Define UoM categories and scoring expectations.
- Decide the MVP boundary for the hackathon.
- Prepare demo users and a believable organization model.
- Document assumptions, risks, and future scope.

Deliverables:

- Problem statement.
- Product requirements document.
- Phase roadmap.
- Initial data model.
- MVP acceptance criteria.

Acceptance criteria:

- All stakeholders can explain the problem and MVP in the same way.
- Functional scope is divided into completed, in-progress, and future phases.
- The prototype can be judged against specific acceptance criteria.

### Phase 1 - Prototype Foundation and Role-Based Shell

Purpose:

- Build the application foundation needed to demonstrate the core workflow.

Implemented capabilities:

- React, TypeScript, and Vite application structure.
- React Router protected dashboard route.
- Mock authentication through selectable users.
- Role-based dashboard routing:
  - Employee dashboard.
  - Manager dashboard.
  - Admin dashboard.
- Context providers for authentication and goal data.
- localStorage persistence for browser-based demo continuity.
- Mock user hierarchy:
  - Alice and Bob as employees.
  - Charlie as manager.
  - Diana as admin.

Future enhancements:

- Replace mock login with real authentication.
- Add route-level and API-level authorization.
- Add stronger layout, accessibility, and design system consistency.
- Add seeded data reset and demo setup utilities.

Acceptance criteria:

- A user can log in as any mock role without code changes.
- Each role lands on the correct dashboard.
- State persists after browser refresh.
- Users can log out and switch roles for demo flows.

### Phase 2 - Goal Creation, Validation, and Manager Approval

Purpose:

- Digitize the goal setting process and ensure goal sheets follow a consistent structure before approval.

Implemented employee capabilities:

- Create or edit a goal sheet.
- Add up to 8 goals.
- Remove non-shared goals.
- Choose a thrust area.
- Choose a unit of measurement.
- Enter title, description-ready structure, target, and weightage.
- Save as draft.
- Submit for manager approval.
- View submitted or approved goal sheet status.
- View manager feedback when a goal sheet is returned.

Implemented manager capabilities:

- View submitted goal sheets from team members.
- Review employee goal details.
- Edit target and weightage before approval.
- Validate total weightage before approval.
- Approve and lock a goal sheet.
- Return a goal sheet for rework with required feedback.
- View reviewed goal sheets and their statuses.

Business rules:

- Total weightage must equal exactly 100 percent.
- Every goal must carry at least 10 percent weightage.
- A goal sheet may contain no more than 8 goals.
- Goal title and target are required.
- Returned goal sheets become editable by the employee again.
- Approved goal sheets are locked from normal employee editing.

Future enhancements:

- Add timeline start and end dates.
- Add formal amendment workflow after approval.
- Add goal templates and shared KPIs managed by HR.
- Add validation for duplicate goals, invalid dates, and outlier weightages.

Acceptance criteria:

- Employees cannot submit an invalid goal sheet.
- Managers cannot approve invalid weightage distribution.
- Returned sheets include manager feedback.
- Approved sheets become the baseline for Phase 3 check-ins.

### Phase 3 - Achievement Tracking, Quarterly Check-ins, and Scoring

Purpose:

- Move the product from one-time goal capture to continuous performance tracking.

Implemented employee capabilities:

- Access quarterly check-ins only after goal sheet approval.
- Select Q1, Q2, Q3, or Q4.
- Enter actual achievement values for each approved goal.
- Select progress status:
  - Not Started.
  - On Track.
  - Completed.
- Submit the selected quarter check-in.
- View manager feedback for the selected quarter once saved.
- View a weighted overall score for the selected quarter.

Implemented manager capabilities:

- Open quarterly check-in review for approved goal sheets.
- Select the quarter to inspect.
- View submitted actual achievement, status, and computed score.
- Save structured manager feedback for the quarter.
- Enter an override score and justification for individual goal achievements.
- See whether an employee has not yet submitted the selected quarter.

Scoring behavior in the current prototype:

- Zero-based goals score 100 percent when actual achievement equals 0; otherwise 0 percent.
- Timeline goals score 100 percent when the actual date is on or before the target date; otherwise 0 percent.
- Numeric and percentage goals calculate `actual / target * 100` when no baseline is provided.
- Baseline-aware numeric and percentage goals calculate progress from baseline to target.
- Lower-is-better numeric and percentage goals are supported when the goal is marked as lower-is-better.
- Manager override score takes priority over calculated score when provided.
- Numeric and percentage scores are clamped between 0 percent and 200 percent in the current prototype.
- Missing or invalid actuals return no score.

Production enhancements:

- Require override justification when an override score is entered.
- Add trend indicators across quarters.
- Add check-in windows and late submission status.
- Move scoring audit and review events to immutable backend storage.

Acceptance criteria:

- Employees can submit actual values for all approved goals per quarter.
- Managers can review submitted check-ins and save comments.
- Score calculation displays clear results for supported UoM types.
- Check-in history persists locally in the prototype.
- Prototype Phase 3 is complete; remaining items are production governance and analytics enhancements.

### Phase 4 - Reporting, Analytics, and Governance

Purpose:

- Give HR, managers, and leadership reliable visibility into adoption, alignment, and performance progress.

Implemented capabilities:

- Admin dashboard shows total employees.
- Admin dashboard shows submitted goal sheet count.
- Admin dashboard shows approved goal sheet count.
- Admin dashboard shows average approval turnaround time for approved sheets.
- Admin dashboard shows goal alignment counts by thrust area.
- Admin dashboard shows check-in compliance by quarter.
- Admin dashboard filters reports by manager, department, employee, cycle, status, quarter, thrust area, and audit action.
- Admin dashboard shows manager-level summaries.
- Admin dashboard shows department-level summaries.
- Admin dashboard shows returned-goal analysis.
- Admin dashboard shows weighted score rollups.
- Admin dashboard shows a detailed goal, check-in, score, override, and manager comment report.
- Admin dashboard provides detailed CSV export.
- Admin dashboard provides Excel-compatible XLS export.
- Admin dashboard provides printable PDF report export.
- Admin dashboard provides audit CSV export.
- Persistent local audit events are stored in `app_audit_events`.
- Audit events are logged for submit, edit, return, approve, check-in, check-in review, and export actions.

Acceptance criteria:

- HR can identify who has not submitted goals.
- HR can identify which managers have pending reviews.
- Leadership can inspect goal alignment by thrust area. Current implementation satisfies this at prototype level.
- Reports can be exported for offline review as detailed CSV, Excel-compatible XLS, printable PDF, and audit CSV.
- Audit events are filterable and timestamped in persistent localStorage.
- Phase 4 prototype scope is fully complete and verified. (Server-side immutability and enterprise governance are tracked in Phase 5).

### Phase 5 - Backend, Security, and Enterprise Authentication

Purpose:

- Convert the prototype into a secure and reliable application with real persistence.

Planned capabilities:

- REST or GraphQL API for users, goal sheets, goals, check-ins, comments, reports, and audit events.
- PostgreSQL database with migrations.
- Move reports and audit storage from localStorage to backend APIs.
- Make audit events immutable and server-enforced.
- Scheduled exports and report-level access controls.
- Server-side validation matching frontend rules.
- Role-based access control enforced on the server.
- Microsoft Entra ID or equivalent SSO integration.
- Secure session handling.
- Immutable audit log.
- Environment-based configuration.
- Error monitoring and structured logs.
- API tests and CI checks.

Acceptance criteria:

- Users authenticate through enterprise identity.
- Data persists across devices and browsers.
- Authorization prevents cross-role data access.
- Audit events are written for all important workflow changes.
- Production deployment has documented environment variables and recovery steps.

### Phase 6 - Integrations, Notifications, and Workflow Automation

Purpose:

- Reduce manual follow-up by connecting the platform to existing enterprise systems.

Planned capabilities:

- HRIS or employee master data synchronization.
- Org hierarchy and manager mapping sync.
- Email notifications for submission, return, approval, and check-in reminders.
- Microsoft Teams or Slack notifications.
- Calendar-aware check-in windows.
- Automated reminders for pending manager reviews.
- Escalation rules for overdue submissions.
- Import and export APIs for downstream appraisal systems.

Acceptance criteria:

- Employees and managers receive timely workflow notifications.
- Org hierarchy changes are reflected without manual data edits.
- HR can configure reminders and escalation windows.
- Integration failures are logged and recoverable.

### Phase 7 - Intelligence, Scale, and Continuous Improvement

Purpose:

- Use platform data to improve decision-making, reduce risk, and support a larger user base.

Planned capabilities:

- Goal recommendation templates by role, department, and strategic theme.
- Alignment quality scoring.
- Achievement trend analysis.
- Risk prediction for goals likely to miss targets.
- Anomaly detection for unusual weightage or scoring patterns.
- Executive heatmaps.
- Multi-cycle performance history.
- Multi-tenant or business-unit partitioning if needed.
- Performance optimization for large organizations.

Acceptance criteria:

- Leadership can identify at-risk teams before the end of the cycle.
- Employees receive useful suggestions without losing manager control.
- Analytics are explainable and auditable.
- The system supports production-scale usage targets.

## 9. Functional Scope

### In Scope for Current Hackathon Prototype

- Mock login and role selection.
- Employee goal creation.
- Draft and submit workflow.
- Goal validation.
- Manager goal review.
- Manager approval and return workflow.
- Quarterly employee achievement logging.
- Manager quarterly check-in review.
- Baseline-aware, lower-is-better, override-aware, and weighted score calculation for prototype use.
- Admin reporting dashboard with completion, alignment, compliance, turnaround, filters, summaries, rollups, persistent local audit, and CSV/Excel/PDF/audit exports.
- localStorage persistence.

### Out of Scope for Current Hackathon Prototype

- Production backend.
- Real authentication or password flow.
- Enterprise SSO.
- Server-side immutable audit logging.
- HRIS integration.
- Notifications.
- Backend-governed reporting export suite.
- Advanced analytics.
- Multi-cycle configuration.
- Multi-department hierarchy management.

## 10. Core Data Concepts

| Concept | Description |
| --- | --- |
| User | A person using the portal with a role of Employee, Manager, or Admin |
| Role | Determines dashboard access and allowed actions |
| Goal Sheet | A collection of goals owned by an employee for a performance cycle |
| Goal | A measurable objective with thrust area, UoM, optional baseline, target, weightage, and optional lower-is-better flag |
| Thrust Area | Strategic category such as Revenue Growth or Operational Efficiency |
| UoM | Unit of Measurement: Numeric, Percentage, Timeline, or Zero-based |
| Status | Goal sheet state: Draft, Submitted, Approved, or Returned |
| Quarter | Q1, Q2, Q3, or Q4 check-in period |
| Check-in | Quarterly achievement record for a goal sheet |
| Achievement | Actual value, progress status, optional manager override score, and optional override justification |
| Manager Comment | Structured feedback added during approval or check-in review |

## 11. Recommended Technical Architecture

Current prototype:

- Frontend: React 19, TypeScript, Vite.
- Routing: React Router 7.
- State: React Context API.
- Persistence: browser localStorage.
- Styling: CSS and inline component styles.

Recommended production architecture:

- Frontend: React, TypeScript, Vite, tested component library or design system.
- Backend: Node.js with Express or NestJS.
- Database: PostgreSQL.
- ORM: Prisma or TypeORM.
- Authentication: Microsoft Entra ID using OIDC.
- Authorization: Server-side RBAC with manager hierarchy checks.
- API: REST endpoints or GraphQL schema for goal, check-in, report, and admin workflows.
- Observability: Structured logs, application metrics, and error tracking.
- CI/CD: Lint, type-check, unit test, build, deploy to staging, then production.

## 12. Key Metrics

Adoption metrics:

- Goal sheet submission rate.
- Approval completion rate.
- Check-in submission rate by quarter.
- Active users by role.

Workflow metrics:

- Average approval turnaround time.
- Returned goal sheet rate.
- Average number of manager comments per check-in.
- Overdue submissions by manager or department.

Quality metrics:

- Goals mapped to thrust areas.
- Weightage distribution by employee and department.
- Goals with missing or invalid achievement data.
- Scoring outliers.

Business impact metrics:

- Alignment to strategic thrust areas.
- Achievement trend by quarter.
- Percentage of goals completed on time.
- Reduced HR manual consolidation time.

## 13. Testing and Quality Strategy

Prototype quality checks:

- Verify login for all mock users.
- Verify each role reaches the correct dashboard.
- Validate goal sheet rules with valid and invalid inputs.
- Verify manager approval and return flows.
- Verify approved sheets unlock quarterly check-ins.
- Verify score calculation for numeric, percentage, timeline, zero-based, baseline-aware, lower-is-better, and override cases.
- Verify weighted overall score appears in the employee check-in view.
- Verify admin reporting cards, filters, thrust-area alignment, check-in compliance, manager summaries, department summaries, returned-goal analysis, weighted rollups, persistent audit rows, detailed CSV export, Excel export, printable PDF export, and audit CSV export.
- Verify localStorage persistence after refresh.

Production quality checks:

- Unit tests for scoring and validation logic.
- Component tests for forms and dashboards.
- API integration tests for authorization and workflow transitions.
- End-to-end tests for employee and manager journeys.
- Accessibility checks for keyboard navigation and form labels.
- Security tests for role access and data isolation.
- Load testing for reporting endpoints.

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Users treat goals as administrative compliance only | Low adoption and poor data quality | Provide templates, manager training, and useful feedback loops |
| Scoring rules are not yet governed by production policy | Perceived unfairness | Add configurable scoring policies, required override justification, and persistent audit |
| Manager hierarchy data is inaccurate | Wrong access and reporting | Integrate with HRIS or org directory in Phase 6 |
| localStorage prototype is mistaken for production-ready persistence | Data loss or demo confusion | Clearly document prototype limits and backend phase |
| Goals change after approval without traceability | Audit and trust issues | Add amendment workflow and immutable audit log |
| Reporting grows before data governance is ready | Misleading dashboards | Define metrics, ownership, and data validation rules early |

## 15. Hackathon Demo Flow

Recommended demo sequence:

1. Log in as Alice or Bob.
2. Create a goal sheet with strategic thrust areas and weightage.
3. Try an invalid weightage total to show validation.
4. Correct the sheet to 100 percent and submit for approval.
5. Log in as Charlie.
6. Review the submitted sheet.
7. Edit a target or weightage if needed.
8. Return the sheet once to show feedback, or approve it to lock the baseline.
9. Log back in as the employee.
10. Open the approved sheet and submit a quarterly check-in.
11. Log in as Charlie again and save a manager check-in comment, optionally adding an override score and justification.
12. Log in as Diana to show filters, completion, alignment, compliance, approval turnaround, manager summaries, department summaries, returned-goal analysis, weighted rollups, persistent audit rows, detailed CSV export, Excel export, printable PDF export, and audit CSV export.

## 16. Acceptance Criteria for Hackathon Submission

The hackathon submission is successful when:

- The application runs locally with `npm run dev`.
- At least three roles can be demonstrated: Employee, Manager, and Admin.
- Employees can create, save, submit, and revise goal sheets.
- Validation prevents invalid total weightage and invalid minimum weightage.
- Managers can approve or return submitted goal sheets.
- Approved goal sheets are locked from normal employee editing.
- Employees can submit quarterly check-ins after approval.
- Managers can review check-ins and add comments.
- Managers can apply score overrides with visible justifications.
- The admin dashboard shows completion, approval visibility, filters, alignment, check-in compliance, approval turnaround, manager summaries, department summaries, returned-goal analysis, weighted rollups, persistent audit rows, detailed CSV export, Excel export, printable PDF export, and audit CSV export.
- Documentation clearly explains the phase roadmap and future production path.

## 17. Future Product Enhancements

Priority enhancements after the hackathon:

- Persistent backend and database.
- Real authentication and RBAC.
- Backend immutable audit event model.
- Backend-governed HR reports.
- Goal templates and shared KPIs.
- Configurable cycles and check-in windows.
- Email or Teams notifications.
- Production scoring policy configuration.
- Required override justification and persistent scoring audit.
- Manager and admin weighted score roll-ups.
- Performance review integration.
- Advanced analytics and recommendations.

## 18. Conclusion

AtomQuest addresses a practical and high-value organizational problem: turning goal management from a manual, fragmented process into a structured, measurable, and reviewable workflow. The current prototype proves the core lifecycle and gives the team a strong foundation for expansion. The next step is to harden the product through reporting, backend persistence, authentication, governance, integrations, and analytics while preserving the simple role-based experience demonstrated in the hackathon.
