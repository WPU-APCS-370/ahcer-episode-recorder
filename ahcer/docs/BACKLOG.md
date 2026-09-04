# Backlog

This is an index of active initiatives. Individual stories are tracked as
GitHub issues; this document groups them into epics and records the
reasoning behind sequencing decisions that don't fit in an issue body.

`ROADMAP.md` describes the 30/60/90-day plan and priorities. `ARCHITECTURE.md`
maps the current codebase. This document tracks what's actually in flight.

---

## Epic: Test & Dev Environment Setup

### Why this is first

Picking up this project from a prior developer means every change currently
ships on trust: there is no environment where new code can be exercised
without touching production data, no automated test gate before merge, and
no versioned record of who can access what. Before adding features or
continuing the security work in `ROADMAP.md`, the team needs to be able to
test changes with confidence.

Evaluating "what exists" for this epic surfaced findings worth recording
here rather than losing in an issue thread:

- **There is no automated deploy today — production deploys are manual FTP.**
  `.github/workflows/main_ahcer.yml`, which attempts to build and SCP `dist/`
  to `ahcer.org` on every push to `main`, is not the real deploy path and
  never has been in practice; it's a leftover automation attempt that fails
  on every recent run (including the last two merges, #39 and #40) with an
  empty `dist/` output. Nobody noticed because it was never load-bearing —
  the actual production deploy step has been building locally and copying
  the output up by hand. `DECISIONS.md`'s release process currently states
  that merging a PR "initiates the production deployment," which isn't true
  today; that line is corrected pending this work. `ahcer.org` itself runs on
  the repo owner's **personal** Linode slice, not project- or org-owned
  infrastructure. Decision made: migrate to Firebase Hosting — see #41 and
  the epic below.
- **`acher-sandbox` is inaccessible — resolved.** Verified directly:
  `firebase projects:list` under the repo owner's account does not include
  it, and every commit that created or wired it up belongs to a former
  contributor (Arsalan Javed), never the owner. It was created under his
  personal Google account and isn't reachable today. Retiring it rather than
  chasing access. See #43 (closed) and #44.
- **`wpu-ahcer-b5e94`, the project the default dev environment pointed at,
  was also unregistered and unreachable — resolved.** In the same
  verification pass, a genuinely accessible project turned up:
  `ahcer-dev`, sitting in the account unused by this codebase. It turned out
  to be the backend for a separate, earlier mobile-app effort (only
  Android/iOS apps registered, a live Firestore database, matches the
  repo's `mobile-app` branch) rather than a spare copy of the web app. A web
  app was registered under it and `environment.ts`/`.firebaserc` now point
  at `ahcer-dev` instead of the dead reference. See #43 (closed).
- **No Firestore or Storage security rules exist in the repo at all** —
  authorization today is enforced client-side. This is the top item in
  `ROADMAP.md`'s Days 1-30 plan. See #46.
- **`ng test` cannot run in CI as configured** — `karma.conf.js` assumes an
  interactive, non-headless Chrome session and would hang indefinitely in a
  runner. Neither CI pipeline runs it. See #45.

### Stories

| # | Story | Status |
|---|---|---|
| [#41](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/41) | Automate production deploys — decision made, see the Firebase Hosting migration epic below | Open — umbrella issue |
| [#42](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/42) | Set up a local Firebase Emulator dev environment | Open — now builds on a real, confirmed-accessible `ahcer-dev` project |
| [#43](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/43) | Spike: identify the `wpu-ahcer-b5e94` and `ahcr-38258` Firebase projects | Closed — resolved, see above |
| [#44](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/44) | Retire `acher-sandbox`; consolidate on `ahcer-dev` | Open — scope revised |
| [#45](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/45) | Make unit tests runnable in CI and add a test gate | Open |
| [#46](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/46) | Add versioned Firestore/Storage security rules with emulator-based tests | Open |
| [#47](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/47) | Document the environment map (dev / sandbox / production) | Open |

Suggested order: #41 is independent of the rest and can start immediately —
it's the biggest gap, since every other story assumes deploys are something
the system does, not something done by hand. #43 is resolved, which
unblocks #42 and #46 to proceed against a known-good project rather than a
dangling reference; #45 doesn't depend on it. #44 (retiring `acher-sandbox`)
is independent. #47 documents the outcome of all of the above, so it comes
last.

### Superseded issues

#22 ("Set up unit tests"), #23 ("Set firebase rules to lock down data"),
and #36 ("Finish automating deploy") were short, undated notes from earlier
in the project with no acceptance criteria. Closed in favor of #45, #46, and
#41 respectively, which carry the detail found during this evaluation.

---

## Epic: Migrate Production Hosting to Firebase

### Why

`ahcer.org` currently runs on the repo owner's personal Linode slice
(#41), reached only by manual FTP, with no working deploy automation. The
`wpu-ahcer` Firebase project already exists, already has a Hosting site
provisioned, already has production-ready config in `firebase.json` (SPA
rewrite, immutable caching on hashed assets, no-cache on the Angular
service worker files), and already has a working `deploy-prod` npm script.
Most of the destination is already built — what's missing is connecting
the domain and automating the deploy, not building a new environment from
scratch.

The repo owner has full control of `ahcer.org`'s DNS (hosted at DNS Made
Easy — verified 2026-09-04: a single A record at the apex pointing to the
Linode server `45.79.42.31`, with `www.ahcer.org` set up as a CNAME that
follows the apex rather than its own A record, no MX records so no email
depends on this domain, no existing TXT records). That's what makes this
move tractable now rather than blocked on someone else's infrastructure,
unlike the `acher-sandbox` situation in the epic above.

### Sequencing

The two early stories are independent of each other and can run in either
order, or in parallel:

- **#54** (verify parity) and **#55** (automate deploys) both target
  `wpu-ahcer.web.app` directly and touch zero production DNS. Doing #55
  before the DNS cutover means that by the time `ahcer.org` actually points
  at Firebase, deploys are already flowing to the exact thing being cut
  over to — the cutover itself becomes a pure DNS change, not a deploy
  change.
- **#56** (connect the custom domain) can start any time — it's
  verification and preparation only, and doesn't move any traffic.
- **#57** (the actual DNS cutover) depends on #56 being complete, and
  should not start until #54 has confirmed parity.
- **#58** (decommission Linode) only happens after #57's rollback grace
  period passes with no issues.
- **#59** (docs) closes the loop once the rest is done.

### Stories

| # | Story | Status |
|---|---|---|
| [#54](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/54) | Verify Firebase Hosting parity before touching DNS | Open |
| [#55](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/55) | Automate deploys to Firebase Hosting (wpu-ahcer) | Open |
| [#56](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/56) | Connect ahcer.org as a custom domain on Firebase Hosting | Open |
| [#57](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/57) | Cut DNS over from Linode to Firebase Hosting | Open |
| [#58](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/58) | Decommission the Linode deploy path | Open |
| [#59](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/59) | Update docs to reflect Firebase Hosting as canonical production | Open |

#41 stays open as the umbrella/decision record until all six close.

### Backup options (must retain — non-negotiable)

Two separate layers, both required, neither optional:

1. **App-version rollback, ongoing, forever.** Verified directly:
   `firebase hosting:channel:list --project wpu-ahcer` shows the site
   already runs on Firebase's standard release-history model. Every deploy
   becomes a numbered release; any previous release can be restored with
   `firebase hosting:clone wpu-ahcer:<version> wpu-ahcer:live`, or with the
   "Rollback" action in the console's Release History — no rebuild, no
   redeploy, takes effect immediately. This is a genuine improvement over
   today: manual FTP has **no** rollback at all — an overwritten file on
   the Linode server is just gone. #55 (automate deploys) should confirm
   this release history keeps accumulating through CI-driven deploys, not
   just manual ones, and #59 (docs) should record how to actually perform
   a rollback so it isn't tribal knowledge.
2. **Infrastructure-level rollback, temporary, migration-only.** Covered
   already in #57/#58: the Linode server stays fully intact and untouched
   through an agreed grace period after DNS cutover, so `ahcer.org` can be
   pointed back at `45.79.42.31` immediately if something is wrong at a
   level Firebase's own rollback can't fix (DNS/cert issue, Firebase outage,
   etc). Only decommissioned once that window passes clean.

### Cost

Not evaluated yet — parked deliberately, not forgotten. Before #57 (DNS
cutover), compare the Linode slice's ongoing cost against Firebase
Hosting's pricing (free tier covers a meaningful amount of bandwidth/storage;
costs scale with traffic beyond that) so the decision is made with real
numbers, not just infrastructure-ownership reasoning. Worth a line in #59
once known, or its own quick spike if the answer isn't obvious from
Firebase's pricing page.

### Risks

- **DNS propagation and SSL provisioning aren't instant.** Firebase issues
  a certificate automatically once DNS is verified as pointing correctly,
  but this can take anywhere from minutes to about a day. #57 accounts for
  this by lowering the A record's TTL in advance and treating the cutover
  as a monitored window, not an instant flip.
- **`www.ahcer.org` needs a deliberate decision, not an assumption.**
  Today it's a CNAME that just follows the apex. Firebase's custom-domain
  flow handles a second domain with a redirect either direction — #56
  calls out confirming the current options in the console rather than
  guessing, since getting this wrong breaks `www` access.
- **Returning visitors have an existing service worker registered for
  `ahcer.org`.** The domain doesn't change, only the backend serving it
  does, so the existing Angular service worker should self-update via its
  no-cache `ngsw.json` version check — but #57 calls for an explicit
  hard-refresh test on the live domain rather than assuming this works.
