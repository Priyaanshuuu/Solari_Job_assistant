# Stack, and why

## Voice layer: LiveKit (browser client) + Groq Whisper

Carried over from an existing, already-working voice pipeline
(ElevateBox), stripped of its telephony layer. The STT/TTS/session
plumbing doesn't care whether a participant joined via a SIP trunk or a
browser tab — LiveKit's audio track handling is identical either way.
Only the *joining* mechanism changes: a browser client needs a signed
join token from a small API route; a phone call needed an expensive SIP
trunk. For a demo that just needs to work when someone clicks a link,
browser-only is strictly better — no telephony cost, no dial-in friction
for whoever's reviewing it.

## Job discovery: Solari Browser + Solari Sandbox, in sequence

**Browser** handles the fetch: stealth mode and residential proxying
matter here because job boards and ATS pages actively rate-limit or
block naive scrapers, and this needs to run repeatedly, not once.

**Sandbox** handles everything downstream of the raw scrape: dedup via a
stable `job_id` hash, filtering by title/location/recency (porting logic
that already exists in the YAML pre-filter), and cross-checking against
previously-seen jobs in the database. This is deliberately *not* left to
the LLM. An LLM asked to "read this list and tell me what's new" is slow,
non-reproducible on long lists, and prone to just being wrong about
duplicates. A parser running as real code isn't.

## Resume tailoring: LLM for judgment, Sandbox for execution

The split here is the same principle applied to a different task.
Deciding *what to say* — which bullets to lead with, how to phrase them
against a specific job description — is a language and judgment problem;
that's the LLM's job, constrained to only select and reword from a real,
truthful inventory (`resume.yaml`), never invent content.

Deciding *how it looks and how well it scores* is deterministic: filling
a template and computing keyword coverage against the job description is
exactly the kind of task that should run as code in a sandbox, not be
eyeballed by a model. It's also a stronger technical story for a review —
"the sandbox renders a real file and returns a real score" beats "the
sandbox holds some JSON."

## Storage: one shared Postgres, no internal API between services

`agent/` (a long-running worker) and `web/` (a Next.js app) deploy to
different hosts by necessity — a worker needs a host that keeps a
process alive (Render/Railway/Fly), while a mostly-static app with one
API route belongs on Vercel. Rather than build an internal API for one
service to reach the other, both import the same `lib-db/client.ts` and
talk directly to one shared database (Neon or Supabase free tier). One
fewer moving part, one fewer thing to keep in sync.

## What was deliberately left out

- **RAG / pgvector** — considered for resume grounding, dropped. The
  sandbox-based deterministic filtering does the actual job better and
  doesn't need an embeddings pipeline to demonstrate value.
- **Auth** — this is a single-user personal tool, not a product with
  accounts. Skipping it isn't a shortcut so much as an accurate reflection
  of scope.
