# AHCER Episode Recorder — Architecture Map

Component → Service → Firestore reference for the Angular application under `ahcer/src/app/`.

---

## Authentication & User Setup

| Screen | Component | Service(s) | Firestore |
|---|---|---|---|
| Login | `login/login.component.ts` | `UsersService.loginWithEmail`, `onLoginSuccessful` | `users/{uid}` (read / create) |
| Sign Up | `sign-up/sign-up.component.ts` | `UsersService.createUserByEmailPassword` | `users/{uid}` (create), `users/{parentId}` (update child array) |
| View Profile | `view-profile/view-profile.component.ts` | `UsersService.updateUser`, `updateConsent` | `users/{uid}` (update) |

---

## Patient Management

| Screen | Component | Service(s) | Firestore |
|---|---|---|---|
| View Patients | `view-patient/view-patient.component.ts` | `PatientServices.getPatients` / `getAllRecords` | `users/{uid}/patients` (list) |
| Add Patient | `create-patient/create-patient.component.ts` | `PatientServices.createPatient`, `UsersService.changeLastViewedPatient` | `users/{uid}/patients` (create), `users/{uid}` (update `lastPatientViewed`) |
| Edit Patient | `edit-patient/edit-patient.component.ts` | `PatientServices.updatePatient` | `users/{uid}/patients/{patientId}` (update) |
| Delete Patient | `delete-patient/delete-patient.component.ts` | `PatientServices.deletePatient` | `users/{uid}/patients/{patientId}` (delete) |

> **"Last viewed" pointer**: every patient context-switch writes `lastPatientViewed` + `lastPatientViewdUserId` to `users/{uid}`. All episode and medication screens read this pointer instead of relying on route params.

---

## Episode Recording & Browsing

| Screen | Component | Service(s) | Firestore |
|---|---|---|---|
| Home Dashboard | `home/home.component.ts` | `EpisodeService.getLastFiveEpisodesByPatient`, `PatientServices.getPatientById`, `PatientServices.updatePatient` (start-episode timer) | `users/{uid}/patients/{patientId}/episodes` (list 5), `users/{uid}/patients/{patientId}` (update `startEpisode`) |
| Record Episode | `create-episode/create-episode.component.ts` | `EpisodeService.createEpisode`, `MedicationService.getMedicationsByType`, `VideoService.addUserVideoArray`, `updateUserVideo` | `users/{uid}/patients/{patientId}/episodes` (create), `users/{uid}` (update videos array) |
| View Episodes (paginated) | `view-episodes/view-episodes.component.ts` | `EpisodeService.get20EpisodesByPatient` (cursor-based paging) | `users/{uid}/patients/{patientId}/episodes` (list 20 + `startAfter`) |
| View Episode Detail | `view-episode/view-episode.component.ts` | `MedicationService.getMedicationsByIds`, `VideoService.getUserVideos` | `users/{uid}/patients/{patientId}/medications` (by ID batch), `users/{uid}` (videos array) |
| Edit Episode | `edit-episode/edit-episode.component.ts` | `EpisodeService.updateEpisode` | `users/{uid}/patients/{patientId}/episodes/{episodeId}` (update) |
| Edit Free Day | `edit-episode-free-day/edit-episode-free-day.component.ts` | `EpisodeService.updateEpisode` | `users/{uid}/patients/{patientId}/episodes/{episodeId}` (update) |
| Delete Episode | `delete-episode/delete-episode.component.ts` | `EpisodeService.deleteEpisode` | `users/{uid}/patients/{patientId}/episodes/{episodeId}` (delete) |

**Episode status values** (`models/freeday.enum.ts`):

| Value | Meaning |
|---|---|
| `Recorded` | Full symptom/med capture |
| `Off day` | Patient was not being monitored |
| `No episodes today` | Patient was monitored but had no episodes |

---

## Medication Management

| Screen | Component | Service(s) | Firestore |
|---|---|---|---|
| View Medications | `view-medication/view-medication.component.ts` | `MedicationService.getMedicationsByPatient` | `users/{uid}/patients/{patientId}/medications` (where `archived == false`) |
| Add Medication | `create-medication/create-medication.component.ts` | `MedicationService.createMedication` | `users/{uid}/patients/{patientId}/medications` (create) |
| Edit Medication | `edit-medication/edit-medication.component.ts` | `MedicationService.updateMedication` | `users/{uid}/patients/{patientId}/medications/{medId}` (update) |
| Delete / Archive Medication | `delete-medication/delete-medication.component.ts` | `MedicationService.archiveMedication` | Sets `archived = true`, `archiveDate` (soft delete) |

**Medication types**: `Rescue` medications are selected during episode capture with a per-use dose and timestamp override. Non-rescue prescription meds are snapshotted by name + dose at the moment the episode is saved.

---

## Reporting & Analytics

| Screen | Component | Service(s) | Firestore / Logic |
|---|---|---|---|
| Episode Report | `episode-report/episode-report.component.ts` | `EpisodeService.getAllEpisodesByPatient`, `MedicationService.getMedicationsByType`, `PatientServices.getAllRecords` / `getPatients`, `UsersService.getUserVideos` | Fetches all episodes for selected patient(s) via `forkJoin`; filters by date range client-side; exports CSV / XLSX |
| Statistics | `statistics/statistics.component.ts` | `EpisodeService.getAllEpisodesByPatient`, `PatientServices` | Passes all episodes into `episode-utils.analyzeEpisodes()` which computes frequency, average duration, and symptom breakdown for 4 time windows (last 7 days, last month, last 6 months, last year); rendered as `ng2-charts` line and pie charts |

---

## User & Study Administration

| Screen | Component | Service(s) | Firestore |
|---|---|---|---|
| View Users | `view-users/view-users.component.ts` | `UsersService.getUserChilds` / `getAllUser`, `deleteAccount` (Cloud Function), `deleteUserDoc` | `users` (list / delete), Cloud Function `deleteAccount` (Firebase Auth deletion) |
| Add User | `sign-up/sign-up.component.ts` (also used for `/add-user`) | Same as sign-up, but adds `parentId` link | `users/{childId}` (create with `parentId`), `users/{parentId}` (push `childId` to child array) |
| Settings | `settings/settings.component.ts` | `StudyService.getStudies`, `addStudy`, `updateStudy`, `updateUsersAndPI`, `removeUsersAndPI`, `PatientServices.getFCMToken` | `studies` collection, batch-updates `users` with `study` / `PI` assignments |

---

## Roles & Access Control

| Role flag | Scope |
|---|---|
| `isAdmin` | Reads across **all** user documents — patients, episodes, reports |
| `piUser` (has `PI` field) | Reads patients scoped to their study (`users.where(study == piUser)`) |
| `isParent` | Can create and manage child sub-users under their account |
| child (has `parentId`) | Their data lives under the parent's `userId` path in Firestore |

Route guards:
- Firebase `canActivate(redirectUnauthorizedToLogin)` applied to almost every route (`app-routing.module.ts`).
- `adminGuard` (`services/admin.guard.ts`) for admin-only screens — checks `localStorage` for `isAdmin` flag.

---

## Firestore Schema
