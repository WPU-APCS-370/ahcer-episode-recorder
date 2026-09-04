# AHCER Engineering Decisions

## 2026-09-04: Restore `main` as the production branch

### Context

Production deployments had been made from `improvements-phase-2` while `main`
remained behind. Pull request #39 reconciles that production branch into `main`
without rewriting history.

### Decision

`main` is the canonical branch for production deployments. Future production
changes must be merged into `main` through a pull request.

### Main Branch Ruleset

- Active ruleset targets the `main` branch.
- Pull requests are required before merging.
- Required approvals are set to zero while there is one maintainer.
- Stale approvals are dismissed when new commits are pushed.
- All pull-request conversations must be resolved before merging.
- Force pushes and branch deletion are blocked.
- The bypass list is empty.
- Status checks are not required until a reliable CI test suite exists.
- Copilot code review may be requested, but its review does not count as a
  required human approval. Copilot coding-agent tasks must not be used for
  review-only work because they can push commits to a pull-request branch.

### Release Process

1. Create a feature branch for each change.
2. Open a pull request into `main`.
3. Review the complete diff and resolve all conversations.
4. Run the available production build and manual validation appropriate to the
   change.
5. Merge the pull request into `main` to initiate the production deployment.

### Follow-Up

Establish a sandbox/emulator environment and a CI baseline. When a trusted
human collaborator is available, require one approving review for `main`.