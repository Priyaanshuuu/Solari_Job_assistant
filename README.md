# Job Copilot Solari

A production-grade voice-first job search automation platform with resume tailoring.

## What It Does

**Two core workflows, both voice-triggered:**

1. **Job Discovery** — "What's new for me?" → Voice command → Scrape ATS boards → Filter & dedupe → Smart ranking → Spoken results
2. **Resume Tailoring** — "Tailor for that one" → Voice command → LLM rewrites resume → Renders document → ATS keyword scoring → Download

## Architecture

This is a **monorepo** (pnpm workspaces) with three main packages:

- **`agent/`** — LiveKit voice agent backend (Node.js + TypeScript)
  - STT via Groq Whisper
  - Intent parsing (LLM)
  - Solari browser + sandbox orchestration
  - Resume tailoring pipeline
  
- **`web/`** — Next.js frontend
  - Voice UI (LiveKit client)
  - Results display
  - Resume download
  - Settings & profile management

- **`lib-db/`** — Shared database client
  - Tracks job postings (dedup, seen/new/applied state)
  - Stores tailored resumes & ATS scores
  - Imported by both `agent/` and `web/`

## Quick Start

```bash
# Install dependencies across all workspaces
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys (Groq, LiveKit, Solari, DB)

# Run agent in dev
pnpm -F agent dev

# Run web in dev
pnpm -F web dev

# Run tests
pnpm test
```

## Pipeline at a Glance

### Job Discovery Branch
```
Voice Input 
  → STT (Groq Whisper)
  → Intent Parsing (job-intent.ts)
  → Solari Browser Scrape
  → Sandbox Filter & Score (Python)
  → DB Upsert
  → LLM → TTS → Spoken Result
```

### Resume Tailoring Branch
```
Voice Input
  → STT + Intent Parse (tailor_resume)
  → Fetch Job Description + Resume Profile
  → LLM Tailor (resume/tailor.ts)
  → Sandbox Render (Python)
  → ATS Keyword Scoring
  → DB Store + TTS Result
```

## Configuration Files

- **`profile.yaml`** — Your profile (location, desired roles, experience level, keywords to exclude)
- **`resume.yaml`** — Your resume as structured data (work history, skills, projects with descriptions)
- **`resume-templates/base.docx`** — Docx template (placeholders for sections)

## Documentation

- [01-problem-statement.md](docs/01-problem-statement.md) — The problem this solves
- [02-stack-and-why.md](docs/02-stack-and-why.md) — Technology decisions
- [03-tradeoffs.md](docs/03-tradeoffs.md) — Design tradeoffs

## Production Deployment

Deploy the agent directly on Render, Railway, or Fly.io, and deploy the web frontend to Vercel, Netlify, or another Node.js-compatible host. Use a managed PostgreSQL provider such as Neon or AWS RDS.

---

**Status**: Production build in progress.
