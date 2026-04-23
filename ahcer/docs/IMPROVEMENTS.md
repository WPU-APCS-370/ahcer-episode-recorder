# Immediate Improvements

## 1. Critical Security

### Remove plaintext password storage from Firestore
- Current behavior writes user-entered passwords into user documents.
- Improvement: rely only on Firebase Auth for credential handling and remove password from all Firestore writes.

### Stop trusting localStorage for admin authorization
- Admin checks currently read from browser localStorage, which is client-editable.
- Improvement: derive role from trusted backend data and enforce with Firestore Security Rules.

## 2. Routing and Access Control

### Apply the admin guard to admin-only routes
- Guard is imported but not used on routes.
- Improvement: add `canActivate` with admin guard to routes like `users`, `add-user`, and `settings` if intended admin-only.

### Remove duplicate route declarations
- Duplicates exist for `patients` and `add-patient`.
- Improvement: keep a single source of truth per route path.

## 3. Reliability and Runtime Bugs

### Fix subscription misuse in app root
- `uid` is assigned a `Subscription`, then later reassigned to emitted values.
- Improvement: store subscription in a dedicated field and unsubscribe properly, or use async pipe.

### Ensure currentUser stream is always initialized before use
- `currentUser` is subscribed in Settings but may be undefined if get current user has not run.
- Improvement: expose `currentUser` as a stable observable initialized in the service constructor.

### Avoid repeated Firebase app initialization with the same app name
- Repeated `initializeApp` with `authApp` can cause duplicate-app errors.
- Improvement: initialize once, or use `getApps` and `getApp` checks.

## 4. Tech Debt to Address Soon

### Replace deprecated FirebaseUI Google YOLO helper
- Improvement: remove or replace with supported credential helper options.

### Resolve TypeScript deprecation warnings and functions rootDir warning
- Improvement: update compiler options to TypeScript 6+ compatible settings to avoid future breakage.

## Suggested Priority Order

1. Remove plaintext password writes.
2. Fix authorization trust model and enforce proper guards and security rules.
3. Correct app root subscription bug.
4. Remove duplicate routes.
5. Stabilize currentUser observable and Firebase initialization.
6. Clean up deprecations and config warnings.

## Recommended Tech Stack Changes

### 1. Move privileged actions to backend-only endpoints
- Keep Angular + Firebase, but route admin and study-management actions through verified Cloud Functions or Cloud Run APIs.
- Enforce authorization server-side for user deletion, role updates, and study assignment operations.

### 2. Replace client-trusted role checks with claims and strict rules
- Use Firebase custom claims for roles such as `admin`, `PI`, and `coordinator`.
- Enforce row-level access in Firestore Security Rules instead of relying on client localStorage.

### 3. Migrate from AngularFire compat to modular Firebase SDK
- Move feature-by-feature, starting with Auth, then Firestore and Storage.
- Benefits: better long-term support, smaller bundles, and cleaner APIs.

### 4. Add runtime schema validation for clinical data
- Keep TypeScript interfaces, but add runtime validation before writes and imports.
- Recommended approach: use a validator such as Zod for episode, medication, and patient payloads.

### 5. Add an analytics pipeline outside transactional app reads
- Stream Firestore event data to BigQuery (or equivalent) for study analytics, reproducible reporting, and cohort queries.
- Keep the app focused on operational workflows while analytics run in a dedicated layer.

## Recommended Adoption Path

1. Security and governance first: claims, security rules, backend authorization for privileged actions.
2. Reliability next: modular SDK migration and runtime validation.
3. Research scale next: analytics pipeline and standardized exports.
