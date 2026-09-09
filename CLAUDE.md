# Instructions for Claude Code

## Time tracking

Keep `ahcer/docs/TIME_LOG.md` up to date across sessions:

- **At the start of a session's active work**, run `date` and note the
  timestamp — this is the row's Start time.
- **At the end of a session** — the user says they're wrapping up, or a
  natural stopping point is reached — run `date` again, compute the
  elapsed wall-clock time, and append a row: date, start, end, duration,
  a one-line summary of what got done, and any notes (e.g. a long gap
  mid-session, or work that spanned multiple sittings).
- Durations are real elapsed time between two actual `date` calls, never
  estimated or guessed. If a start time wasn't captured for some reason,
  say so in the Notes column rather than backfilling a number.
- If a single continuous conversation spans a long real-world gap (e.g.
  picked up the next day), treat the resumption as a new row with its own
  start/end, rather than one row covering the whole span.
