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
  today; that line is corrected pending this work. See #41.
- **Three or four distinct Firebase project identities are referenced across
  the codebase**, but only two (`wpu-ahcer` production, `acher-sandbox`
  sandbox) are registered in `.firebaserc`. The default dev environment file
  points at an unregistered project (`wpu-ahcer-b5e94`), and a fourth ID
  (`ahcr-38258`) appears only in a hardcoded local-emulator URL that nothing
  in the repo actually starts. See #42 and #43.
- **No Firestore or Storage security rules exist in the repo at all** —
  authorization today is enforced client-side. This is the top item in
  `ROADMAP.md`'s Days 1-30 plan. See #46.
- **`ng test` cannot run in CI as configured** — `karma.conf.js` assumes an
  interactive, non-headless Chrome session and would hang indefinitely in a
  runner. Neither CI pipeline runs it. See #45.
- **`acher-sandbox` is real, working infrastructure that already exists**
  from prior work (its own Firebase project, hosting target, and npm
  scripts) but isn't validated, documented, or part of any deploy process
  yet. See #44.

### Stories

| # | Story | Status |
|---|---|---|
| [#41](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/41) | Automate production deploys (deploys are currently manual FTP) | Open |
| [#42](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/42) | Set up a local Firebase Emulator dev environment | Open |
| [#43](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/43) | Spike: identify the `wpu-ahcer-b5e94` and `ahcr-38258` Firebase projects | Open |
| [#44](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/44) | Validate and document the `acher-sandbox` environment | Open |
| [#45](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/45) | Make unit tests runnable in CI and add a test gate | Open |
| [#46](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/46) | Add versioned Firestore/Storage security rules with emulator-based tests | Open |
| [#47](https://github.com/WPU-APCS-370/ahcer-episode-recorder/issues/47) | Document the environment map (dev / sandbox / production) | Open |

Suggested order: #41 is independent of the rest and can start immediately —
it's the biggest gap, since every other story assumes deploys are something
the system does, not something done by hand. #42 unblocks #43, #45, and #46,
which can then run in parallel. #44 is independent. #47 documents the
outcome of all of the above, so it comes last.

### Superseded issues

#22 ("Set up unit tests"), #23 ("Set firebase rules to lock down data"),
and #36 ("Finish automating deploy") were short, undated notes from earlier
in the project with no acceptance criteria. Closed in favor of #45, #46, and
#41 respectively, which carry the detail found during this evaluation.
