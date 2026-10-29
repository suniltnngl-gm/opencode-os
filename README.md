# OpenCode OS v0.1

> A developer workstation standard combining Git version control, Windows File History versioning, and automated exclusion management.

## Scope

This project implements the six frozen commands and v0.1 acceptance criteria for the OpenCode OS personal GitOps workstation standard.

## Six Frozen Commands

1. `bootstrap` — Establish workspace environment
2. `doctor` — Diagnose system state
3. `repair` — Recover from known failure modes
4. `start` — Begin operational session
5. `colab create` — Scaffold a new colab notebook
6. `colab connect` — Establish a provider tunnel

## Acceptance Criteria (Sprint 1)

- Bootstrap generates environment config
- Doctor checks Git, File History, dependencies
- Repair restores from last verified backup
- Start opens session without credential leakage
- Colab create/pro connect with provider schema
- Tests pass against scaffolded project

## Protection Model

- **Git**: committed history
- **File History**: uncommitted working files
- **E: drive**: local backup store (configured destination verified; recoverability pending)

## Status

Scaffold complete. Sprint 1 acceptance tests pending. See AGENTS.md for backup verification requirements.