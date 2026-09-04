## 30/60/90-Day Roadmap (AHCER Episode Tracking)

### Roadmap Goals
1. Reduce immediate security and compliance risk for medical-study workflows.
2. Improve runtime reliability and maintainability without a full rewrite.
3. Add research-scale analytics and export capabilities with governance controls.

---

## Days 1-30: Security and Governance First

| Task | Concrete implementation tasks | Deliverable | Exit criteria |
|---|---|---|---|
| Remove plaintext password storage | Remove all `password` fields from Firestore user writes and backfill cleanup script for existing docs | No password field persisted in user docs | Verified in code search and sampled Firestore docs |
| Replace localStorage-trusted authorization | Introduce Firebase custom claims (`admin`, `PI`, `coordinator`) and refactor role checks to claim/server-verified sources | Role checks no longer depend on client-editable storage | Unauthorized role changes in browser cannot escalate access |
| Enforce Firestore Security Rules by role and scope | Write and deploy rules for user/patient/episode/medication/study boundaries | Versioned ruleset and test matrix | Rules tests pass for allowed and denied scenarios |
| Secure privileged actions behind backend endpoints | Move user deletion, role updates, and study assignment operations to callable/HTTP backend endpoints with auth checks | Hardened backend admin API surface | Privileged operations fail from unauthorized clients |
| Fix route-level access boundaries | Apply admin guard where intended and remove duplicate route declarations | Clean route config with explicit access intent | Route duplication removed and admin-only pages blocked for non-admins |

### Verification for Days 1-30
1. Security regression checklist executed.
2. Role spoofing attempt via localStorage fails.
3. Firestore rules tests pass in CI.
4. Manual smoke test for admin/non-admin navigation passes.

---

## Days 31-60: Reliability and Maintainability

| Task | Concrete implementation tasks | Deliverable | Exit criteria |
|---|---|---|---|
| Fix root subscription misuse | Refactor app root subscription handling (dedicated subscription fields or async pipe pattern) | Stable lifecycle-safe subscription management | No subscription leaks in core shell flow |
| Stabilize current user observable | Make current user stream eagerly initialized and consistently available to dependents | Deterministic user context behavior across screens | Settings/profile screens load without undefined stream errors |
| Prevent duplicate Firebase app initialization | Centralize auth app init using `getApps/getApp` guard pattern | Single initialization pattern | No duplicate-app runtime errors |
| Start AngularFire compat migration | Migrate Auth first to modular SDK, keep behavior parity | First modularized service slice merged | Auth regression suite passes |
| Add runtime schema validation for writes | Add validators for episode/patient/medication payloads before persistence | Validation layer in service write paths | Invalid payloads blocked with user-safe error handling |
| Address compiler deprecations | Update TypeScript config settings and functions config warnings | Cleaner build configuration | Build warnings reduced/eliminated for flagged config items |

### Verification for Days 31-60
1. Runtime error rate reduced in logs.
2. Auth and core CRUD regression tests pass.
3. Type checks and build pipelines are clean for updated configs.
4. Validation tests confirm malformed inputs are rejected.

---

## Days 61-90: Research-Scale Data and Reporting

| Task | Concrete implementation tasks | Deliverable | Exit criteria |
|---|---|---|---|
| Introduce analytics pipeline | Export Firestore event data to BigQuery (or equivalent) with scheduled transforms | Study analytics dataset and documented schema | Cohort-level queries run without impacting app reads |
| Create governed export workflows | Add PHI-aware export options, role-restricted export permissions, and audit records for exports | Controlled CSV/XLSX export workflow | Export attempts are permission-checked and auditable |
| Add data quality monitoring | Implement missing-data and outlier checks (episodes, meds, consent metadata) | Data quality dashboard/report | Coordinators can identify and resolve data issues quickly |
| Improve study operations visibility | Add operational metrics (adherence, lag, completeness by site/user/study) | Research operations dashboard | Stakeholders can track trial execution health |
| Prepare interoperability path | Define standardized schema package for external collaboration (de-identified where needed) | Interop-ready extract spec | Pilot extract validated by research stakeholders |

### Verification for Days 61-90
1. Analytics pipeline jobs run reliably on schedule.
2. Export governance and audit logging tested end-to-end.
3. Study ops dashboard validated with real historical data.
4. Data quality alerts produce actionable coordinator workflow.

---

## Ownership Model (Recommended)

| Workstream | Primary owner | Secondary owner |
|---|---|---|
| Frontend access/routing/refactors | Frontend engineer | QA |
| Claims, rules, privileged endpoints | Backend/Firebase engineer | Security/compliance lead |
| Validation and data quality | Backend/Firebase engineer | Study operations lead |
| Analytics pipeline and dashboards | Data engineer | Product/research lead |
| Verification and release gates | QA lead | Engineering lead |

---

## Milestones

1. Day 30 milestone: Security baseline complete and verified.
2. Day 60 milestone: Reliability baseline complete, modular migration underway.
3. Day 90 milestone: Research analytics and governed exports live.

---

## Immediate Next Sprint (Week 1)

1. Remove password writes and add data cleanup script.
2. Implement claim-based role checks and first pass of Firestore rules.
3. Lock privileged operations behind backend endpoints.
4. Add route guard corrections and remove duplicate routes.
5. Add tests for role access and critical CRUD permissions.

---

## Dependencies and Risks

- **Security rule changes may block existing workflows**: Tightening access can break currently functioning screens for admins, PI users, or child accounts.
	Mitigation: stage rules in emulator first, run role-based test matrix, then deploy progressively.

- **Claims rollout depends on token refresh behavior**: Users may keep stale claims until re-authentication.
	Mitigation: force refresh after role changes and add clear user messaging for re-login requirements.

- **Data cleanup may affect historical integrity**: Removing sensitive fields and normalizing old records can introduce accidental data drift.
	Mitigation: export backup snapshots first and validate with sampled before/after checks.

- **SDK migration can cause regressions in auth and Firestore flows**: Compat-to-modular migration touches central services.
	Mitigation: migrate one service at a time with smoke tests and rollback-ready releases.

- **Analytics pipeline requires governance decisions**: PHI handling, retention, and access policy must be defined before wider data distribution.
	Mitigation: finalize data classification and access controls before enabling production exports.
