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
5. Merge the pull request into `main`.
6. Deploy to production. As of 2026-09-04 this step is manual: build
   locally and upload the output via FTP. No automation currently connects a
   merge to `main` with a production deploy — see
   [BACKLOG.md](BACKLOG.md#epic-test--dev-environment-setup) and issue #41.
   Update this section once that lands.

### Follow-Up

Establish a sandbox/emulator environment and a CI baseline. When a trusted
human collaborator is available, require one approving review for `main`.
## 2026-09-04: Remove legacy branch protection blocking `main`

### Context

Pull request #39 stayed blocked with `REVIEW_REQUIRED` even though the
`Protect Main` ruleset set required approvals to zero. Three independent
controls were enforcing a review requirement, only one of which was visible on
the ruleset screen:

1. A legacy **classic branch protection rule** on `main`, entirely separate
   from the ruleset, carrying `required_approving_review_count: 1`. GitHub
   enforces classic branch protection and rulesets simultaneously and applies
   the most restrictive outcome, so this silently overrode the ruleset's zero.
2. `require_last_push_approval: true` in the ruleset, which requires the most
   recent push to be approved by somebody other than the person who pushed it.
   With a single reviewer this can never be satisfied.
3. `require_extra_approval_for_unattributed_changes: true` in the ruleset.
   Roughly fifteen commits in #39 come from `a.javed@sltn.net`, an address not
   linked to any GitHub account, so those changes count as unattributed and
   demand an extra approval.

Any one of the three was sufficient to block the merge, so fixing only the
classic rule would not have unblocked the pull request.

### Decision

The legacy classic branch protection rule on `main` was deleted. Rulesets are
the single source of branch governance for this repository. Classic branch
protection must not be reintroduced: it is configured on a different screen and
does not appear next to the ruleset it silently overrides, which is precisely
what made this failure invisible.

`require_last_push_approval` and
`require_extra_approval_for_unattributed_changes` were both set to false,
consistent with the standing decision to require zero approvals while there is
one maintainer. The bypass list remains empty and enforcement remains active,
so the pull-request requirement itself is unchanged.

Reinstate all three settings when a trusted human collaborator joins.

## 2026-09-04: Retire `improvements-phase-2` after reconciliation

### Context

`main` was verified to be a strict ancestor of `improvements-phase-2`: no
commits exist on `main` that are absent from the feature branch. A simulated
merge completed with no conflicts and produced tree `ddaf364f`, identical to
the tree at the branch tip. Merging #39 therefore leaves `main`
content-identical to `improvements-phase-2`.

### Decision

Pull request #39 is merged with a merge commit rather than a squash or rebase.
Both alternatives rewrite commit SHAs, which would leave `improvements-phase-2`
no longer an ancestor of `main`; squashing would additionally collapse the
attribution of six contributors across seventy commits into one commit. A merge
commit satisfies the earlier decision to reconcile without rewriting history.

Once #39 is merged, `improvements-phase-2` is retired and deleted. The branch
must not be deleted beforehand, because deleting the head branch of an open
pull request closes that pull request. `main` becomes the only long-lived
branch; later work uses short-lived feature branches opened against `main`.

### Known Gap

Commits `e1df70f` and `1dea4d7`, which added auth safeguards and hardened the
account deletion and user creation flows, were reverted by `a1275fd` and
`8cd68f3`. Their net effect on the merged tree is zero, confirmed by an empty
diff across the four commits. `main` consequently ships without that hardening.
This is an accepted, deliberate gap; restoring the safeguards is near-term
follow-up work.
