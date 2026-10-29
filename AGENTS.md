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

## File History Recovery - VERIFIED FOR ONE ARTIFACT (2026-10-30)

**Current status: LIMITED VERIFICATION PASSED.** One archived version of `cli/doctor.ts` was restored to a temporary directory and its Git blob ID matched `HEAD:cli/doctor.ts`. This verifies that artifact/version under the recorded conditions only; it does not establish recovery for every file, generation, or future backup.

Windows File History is configured and running. Limited recoverability has been demonstrated for one archived `cli/doctor.ts` version. Broader recoverability remains unverified; do not generalize the single-file result to other files or generations.

### Current verification (2026-10-30)

| Item | Observation |
|------|-------------|
| Actual archive path | `E:\FileHistory\sunilkr\DESKTOP-0AM7VDP\Data` (accessible and enumerated) |
| Archived version tested | `cli\doctor (2026_10_29 11_58_34 UTC).ts` |
| Archived / restored size | 3,529 bytes each |
| Restored file SHA-256 | `2d145811c1903a4666b7c26363ef55f61c9c64805e504f8addd00bfc2f8b4941` |
| Git blob comparison | Restored blob and `HEAD:cli/doctor.ts` both `4de9fd9edce84d00f8605cd79eb7dce4d0c0554b` |
| Result | Exact content match; source working copy not overwritten |

### Historical observations before path correction (2026-10-29)

| Item | Observation |
|------|-------------|
| File History service (`fhsvc`) | Running, Automatic |
| E: drive | Healthy, NTFS, ~10.2 GB free |
| Configured destination | `E:\` (Config1.xml `TargetUrl`) |
| Expected store (historical, incorrect path) | `E:\sunilkr\DESKTOP-0AM7VDP\Data` — superseded by actual path above |
| Staging area | `C:\Users\...\AppData\Local\Microsoft\Windows\FileHistory\Data` — empty |
| `fhmanagew.exe -backupnow` | Exit code 0, but no versioned data produced |
| Event log (last 7 days) | 175 × Event ID 100 (Information); no error events |
| Recoverable versioned copy | None found |

### Historical interpretation before path correction and restore test

Exit code `0` does **not** establish that a recoverable version of any
workspace file exists. The backup command succeeds silently while producing no
stored data in either the staging area or the E: store.

This does **not** imply that Windows File History is universally broken.
It means File History recovery is unproven **in this environment**, under
these conditions.

### General verification limits and remaining criteria

Before treating File History as a verified protection layer, at least one of
the following must be demonstrated:

1. A versioned copy of a workspace file appears under the actual observed path `E:\FileHistory\sunilkr\DESKTOP-0AM7VDP\Data` after a backup run.
2. `fhmanagew.exe -backupnow` produces new items in the File History staging
   area (`C:\Users\...\AppData\Local\Microsoft\Windows\FileHistory\Data`).
3. A manual restore test succeeds against a known file in the backup store.
4. Windows Settings / Control Panel File History shows a successful backup
   with the Projects directory included as a protected folder.

Verification is closed only for the single tested artifact and archived version above. General File History recovery remains unverified for untested files, generations, and future backups.
Doctor's File History check should report `warn` or `skip` (not `pass`) when
run in this environment.

### Do NOT

- Do not manually create the expected backup-store directory to make the check pass.
- Do not reset File History configuration during diagnosis.
- Do not remove existing backup data.
- Do not reset or reinitialize Git, rewrite history, or discard the verified baseline. OpenCode OS is initialized on `master` at `2aebcd7f9d1f45515981d835b6a71c2bf97261da`.
- Keep WFH OS (`wfh-os`) outside OpenCode OS scope; do not modify its files as part of OpenCode OS documentation work.

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
| Git | committed history | Initialized; baseline `2aebcd7f9d1f45515981d835b6a71c2bf97261da` on `master` |
| File History | uncommitted working files | One archived `cli/doctor.ts` version restored and matched to Git; broader recovery unverified |
| E: drive store | local backup store | Actual archive path accessible; `opencode-os` source files present; one-file restore verified |
