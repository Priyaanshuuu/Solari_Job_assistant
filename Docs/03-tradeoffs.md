# Tradeoffs

Built against a one-week deadline. Every cut below was a deliberate
scope decision, not an oversight — listed here so a reviewer sees the
reasoning instead of just the gap.

## No auto-apply

The agent finds and prepares; it never submits a real application on its
own. Filling third-party forms unsupervised risks the wrong resume
version or an unreviewed submission going out silently. Keeping a human
in the loop for the actual submit step costs a little convenience and
buys a lot of safety. Voice commands like "mark this as applied" update
status *after* a manual submission, they don't trigger one.

## Resume file format: Markdown first, PDF as a stretch goal

Template-based PDF/DOCX rendering (fonts, layout edge cases) tends to
eat far more time than it looks like from the outside. The sandbox
renders clean Markdown/plain text first — still real code, still
scoreable against the job description — with polished PDF output as a
follow-up rather than something to fight with the night before a
deadline.

## No authentication, single fixed profile

This is a personal tool built for one user with one resume inventory,
not a general product. Skipping login/account infrastructure is an
accurate match to actual scope, not a corner cut for a product that
needs it.

## No telephony / SIP trunk

Browser-only voice input trades "call in from any phone" for zero SIP
trunk cost and zero dial-in friction for a reviewer clicking a demo
link. The tradeoff would flip if this became a real product aimed at
non-technical daily use — worth flagging as a known limitation, not
hiding it.

## No RAG pipeline

Dropped in favor of deterministic sandbox-side filtering (regex/keyword
scoring, hash-based dedup) instead of embeddings + vector search. Faster
to build, cheaper to run, and a more legible sandbox use case for a
review — "runs a filter script" is easier to verify correct than "trust
the retrieval."

## Known risk, stated plainly

Job boards and ATS pages change their anti-bot posture over time.
Stealth mode and proxying reduce the odds of getting blocked, but
scraping targets are inherently a moving target — this isn't a solved
problem, just a mitigated one. Worth monitoring rather than assuming
solved.

## What reviewers should read as "not built," not "missing"

No multi-user accounts, no production-grade retry/backoff beyond the
basics, no rate-limiting protection for the scraping targets themselves.
All in-scope decisions given the timeline, called out here rather than
left for someone to discover and wonder about.
