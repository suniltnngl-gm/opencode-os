# AGENTS.md — opencode-os v0.1

## Bootstrap

**Status: VERIFIED** — all acceptance tests pass.

The deterministic, idempotent workspace initializer (`bootstrap/workspace.ts`,
`cli/bootstrap.ts`, `tests/bootstrap.test.ts`) has been implemented and
executed:

| Check                     | Result            |
|---------------------------|-------------------|
| Dependency installation   | Successful        |
| Lockfile generated        | `package-lock.json` |
| Bootstrap tests           | All pass (4 of 4) |
| Idempotency               | Second run `changed=false` |
| Preservation of unrelated files | Confirmed   |
| Preservation of user config | Confirmed       |

No model downloads, provider credentials, global installations, Git
initialization, unrelated source edits, or changes to `delta-ops` were made
during bootstrap implementation.

## File History Recovery — OPEN / BLOCKED

**Status: UNVERIFIED — blocked.**

Windows File History is configured and running in this environment, but
recoverability has **not been demonstrated**. Do not assume a backup exists
until actual filesystem evidence is produced.

### Observed evidence

| Item | Observation |
|------|-------------|
| File History service (`fhsvc`) | Running, Automatic |
| E: drive | Healthy, NTFS, ~10.2 GB free |
| Configured destination | `E:\` (Config1.xml `TargetUrl`) |
| Expected store | `E:\sunilkr\DESKTOP-0AM7VDP\Data` |
| Staging area | `C:\Users\...\AppData\Local\Microsoft\Windows\FileHistory\Data` — empty |
| `fhmanagew.exe -backupnow` | Exit code 0, but no versioned data produced |
| Event log (last 7 days) | 175 × Event ID 100 (Information); no error events |
| Recoverable versioned copy | None found |

### Interpretation

Exit code `0` does **not** establish that a recoverable version of any
workspace file exists. The backup command succeeds silently while producing no
stored data in either the staging area or the E: store.

This does **not** imply that Windows File History is universally broken.
It means File History recovery is unproven **in this environment**, under
these conditions.

### Conditions required for closure

Before treating File History as a verified protection layer, at least one of
the following must be demonstrated:

1. A versioned copy of a workspace file appears under
   `E:\sunilkr\DESKTOP-0AM7VDP\Data` after a successful backup run.
2. `fhmanagew.exe -backupnow` produces new items in the File History staging
   area (`C:\Users\...\AppData\Local\Microsoft\Windows\FileHistory\Data`).
3. A manual restore test succeeds against a known file in the backup store.
4. Windows Settings / Control Panel File History shows a successful backup
   with the Projects directory included as a protected folder.

Until closure, File History recovery remains documented but unverified.
Doctor's File History check should report `warn` or `skip` (not `pass`) when
run in this environment.

### Do NOT

- Do not manually create the expected backup-store directory to make the check pass.
- Do not reset File History configuration during diagnosis.
- Do not remove existing backup data.
- Do not initialize Git for `opencode-os` until explicitly authorized.
- Do not modify `delta-ops` during opencode-os documentation work.

## Policy Determination — Doctor-Only Exception (recorded)

**Date:** 2026-10-29  
**Authority:** Project's own policy (per AGENTS.md § Doctor/Repair gate)  
**Scope:** Doctor implementation only; does not extend to Repair, dependency changes, Git initialization, or unrelated modifications.

**Determination:** Recovery protection is **not a prerequisite for read-only Doctor implementation**, provided the work remains within existing project scope and safeguards. Recovery protection **remains a prerequisite** for Repair and any operation that could modify or remove user data until separately resolved or explicitly excepted.

**Conditions (must be satisfied):**
- File History status reported as `WARN` or `SKIP`; never `PASS` while recoverability unverified.
- No File History configuration changes; no backup-store manipulation; no removal of existing backup data.
- No Git initialization.
- No changes to `delta-ops`.
- Doctor diagnoses and reports; must not perform repair actions.
- Bootstrap source, tests, and `package-lock.json` preserved.
- Implementation follows existing pre-change safeguards.

**Status:** Exception granted — Doctor implementation eligible. Repair remains blocked. Checkpoint advances from paused-pending-determination to eligible-implementation.

---

## Doctor / Repair — PENDING

Not yet implemented. Will resume only after this documentation update is
verified, or when the project's own policy determines recovery protection is
not a prerequisite.

## Protection Model

| Layer | Scope | Status |
|-------|-------|--------|
| Git | committed history | Not initialized for `opencode-os` |
| File History | uncommitted working files | Configured; recoverability unverified |
| E: drive store | local backup store | Destination verified; store unpopulated |
