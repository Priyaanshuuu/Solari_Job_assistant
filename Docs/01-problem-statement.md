# Problem statement

## The manual version of this, today

Job hunting at the pace this campaign runs at means, for every target company:

1. Check 5-10 job boards and ATS pages by hand for new postings
2. Filter by role, location, recency, and whether the listing even mentions
   remote/visa terms worth reading further
3. Rewrite resume bullets to mirror that specific job description's language
4. Repeat, daily, across dozens of companies

Some of this is already automated (a YAML-configured pre-filter pipeline
with verified ATS slugs, running through Apify). But two steps still eat
real time every day: **finding what's actually new and relevant**, and
**tailoring the resume per target** — both done by hand, both repetitive
in a way that a voice-triggered agent can compress into a spoken request.

## What this project solves

Two jobs-to-be-done, both voice-first:

**1. "Find me what's new"** — ask out loud, get back only the roles that
are (a) actually new since last check, (b) match stated filters, and
(c) not already applied to. No manual board-hopping.

**2. "Tailor this for me"** — pick a role by voice, get back a resume
that's honestly reworded to mirror that job description's language,
plus a concrete number (ATS keyword coverage) instead of a vibe.

## What this is explicitly not

- Not a multi-tenant SaaS. One person, one profile, one resume inventory.
- Not an auto-apply bot. It finds and prepares; a human still submits.
- Not a replacement for the existing Apify/YAML pipeline — it's a voice
  front-end for the same underlying discovery problem, built to double as
  the demo project for Solari's hiring challenge (browsers + sandboxes,
  used for something with a genuine daily use, not a toy scrape).

## Why voice specifically

Beyond satisfying the challenge brief, voice fits how this workflow
actually happens: it's a check done between other tasks, not a sit-down
session. "Anything new?" said out loud while doing something else beats
opening five tabs.
