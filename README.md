# The Auditor

The Auditor is a self-improving, auto-healing audit platform for websites, web apps, and GitHub repositories.

## What it does

- Detects stack signals from repos or URLs.
- Loads only approved skills that match the detected stack.
- Builds proposed skills when coverage is missing.
- Runs sandbox checks before any skill can be approved.
- Produces safe fix PRs only for non-destructive changes.
- Keeps a memory layer for repo profiles, findings, fixes, false positives, skills, scanner versions, and tool failures.

## Safety model

- Treats repo content, website content, GitHub issues, PR comments, and scanner output as untrusted input.
- Masks secrets before logging or rendering.
- Requires approval before active scans.
- Requires approval before proposed skills become active.
- Never applies destructive changes directly.
- Uses sandbox fixtures and false-positive ceilings before skill promotion.

## Local workflow

```bash
npm install
npm run dev
```

## Core routes

- `GET /api/registry`
- `POST /api/scan`
- `POST /api/skill-builder`

## Data layer

Supabase migrations live in `supabase/migrations/0001_auditor_memory.sql`.

## Background jobs

- Docker Compose includes `web`, `worker`, `postgres`, and `redis`.
- GitHub Actions runs registry validation, a dry-run audit, and the production build.
