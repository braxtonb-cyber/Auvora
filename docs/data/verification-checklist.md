# Data Verification Checklist

## Purpose
Provide concrete pass/fail checks for schema migrations and persistence behavior before release.

## Migration Verification (SQL + Schema)
- `PASS`: Migration runs cleanly on fresh database.
- `PASS`: Migration runs cleanly on existing staging snapshot.
- `PASS`: Expected tables, columns, constraints, and indexes exist.
- `PASS`: Roll-forward path documented (no manual patching required).
- `FAIL`: Migration depends on hidden local state or manual ordering.

## Contract Verification (App <-> Data)
- `PASS`: Required fields exist for all write operations.
- `PASS`: Nullability in DB matches app assumptions.
- `PASS`: Enum/string domain values align with app vocabulary.
- `FAIL`: App writes fields that DB rejects silently or drops.

## Persistence Behavior Checks
- `PASS`: Create flow writes exactly one canonical record.
- `PASS`: Update flow is idempotent when retried.
- `PASS`: Read-after-write is consistent within expected latency.
- `PASS`: Offline/local fallback does not corrupt canonical state.
- `FAIL`: Duplicate records from repeat taps or retries.

## Scent Profile Persistence Checks
- `PASS`: `scentProfile` version is stored and readable.
- `PASS`: Legacy profile versions migrate without data loss.
- `PASS`: Wardrobe items preserve stable ids across refreshes.
- `PASS`: Wear log append updates derived patterns correctly.
- `FAIL`: Profile refresh mutates user-authored fields unexpectedly.

## History/Save Integrity Checks
- `PASS`: Saved aura entries keep immutable generation snapshot.
- `PASS`: Deleting one history item does not affect others.
- `PASS`: Ordering by creation timestamp is stable and correct.
- `FAIL`: Re-opened history renders with missing critical fields.

## Security/Access Checks
- `PASS`: User-scoped reads only return that user’s records.
- `PASS`: Unauthorized writes are rejected.
- `PASS`: Service role keys are never required client-side.
- `FAIL`: Anonymous/session boundaries leak cross-user data.

## Failure Injection Checks
- Force network timeout on write: `PASS` if user sees recoverable state.
- Force 500 on save endpoint: `PASS` if retry path preserves input.
- Force malformed payload: `PASS` if schema validation blocks persist.

## Evidence Required For Signoff
- Migration logs (fresh + staging)
- Query snapshots confirming schema and constraints
- Write/read test runs with timestamps
- At least one retry/timeout capture
- Final signoff: `PASS` / `FAIL` per section
