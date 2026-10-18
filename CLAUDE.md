# Delta Health

A light Android + iOS app that takes a person's current situation (body, health, schedule,
budget, equipment, food preferences, injuries) and future goals, then builds and keeps
adjusting a 1-to-1 fitness, nutrition and recovery plan for that person only.

## Session protocol (read first, every session)

1. Read `docs/PROGRESS.md` — the last entry says where we stopped and what is next.
2. Read `docs/BACKLOG.md` — pick the top `in progress` / `todo` item of the current milestone.
3. Work the item through the agent loop below.
4. Before the session ends (or the usage limit is near): append a dated entry to
   `docs/PROGRESS.md`, update item statuses in `docs/BACKLOG.md`, commit and push.
   Never leave unpushed work.

## Agent loop (how the team works)

The main Claude session is the **Project Manager**. It owns the backlog, writes acceptance
criteria, routes work, and decides when an item is done. Specialists live in `.claude/agents/`.

```
PM writes item + acceptance criteria
  -> builder (mobile-engineer | backend-engineer | ai-engineer)
  -> qa            (tests pass?)
  -> security      (MASVS checklist, secrets, deps)
  -> domain review (sports-science-reviewer for anything that changes plan logic or advice)
  -> PM checks every acceptance criterion
```

- Any reviewer that fails an item returns it to the builder with **specific, numbered notes**.
- An item that fails **3 rounds** stops and goes to the user with a summary of what keeps failing.
- An item is `done` only when every acceptance criterion is checked off in `docs/BACKLOG.md`
  with evidence (test name, screenshot, command output).
- Design decisions go in `docs/DECISIONS.md` (one short entry each, dated, with the reason).

## Product decisions (from the owner, 2026-10-19)

- **Audience v1:** the owner only (private testing via Expo dev builds / TestFlight internal).
  Build privacy and safety to public standard anyway so we can open up later.
- **Scope v1 (core five):** onboarding questionnaire, AI plan generation, daily check-in,
  weekly auto-adjust, progress charts. No social features.
- **Business model:** freemium later. v1 is free; keep an `entitlements` concept in the
  data model so paid features can be gated without a rewrite.
- **Reference test case:** the owner's own 12-week roadmap (see `docs/spec/`) is the first
  case the plan engine must reproduce.

## Stack

- **App:** React Native + Expo (TypeScript, Expo Router). EAS Build for iOS/Android.
- **Backend:** Supabase — Postgres, Auth, Row-Level Security, Edge Functions.
- **AI:** Claude API, called **only** from Supabase Edge Functions. The API key lives in
  Supabase secrets, never in the app, the repo, or chat.
- **Tests:** Jest + React Native Testing Library (app), Deno tests (edge functions),
  pgTAP or SQL tests for RLS, Maestro for end-to-end flows.

## In-app coaching agents (Team 2, runs inside the product)

Intake -> Nutrition / Training / Recovery drafters -> Safety reviewer -> Plan composer.
Weekly review agent adjusts the plan from logged data. The safety reviewer's hard rules are in
`.claude/skills/fitness-safety-rules/SKILL.md` and are enforced in code, not only in prompts.

## Non-negotiable rules

- No secrets in the repo. `.env*` is git-ignored; use `.env.example` for names only.
- Every table has RLS enabled with per-user policies before it holds data.
- Health data is sensitive information (Australian Privacy Act): explicit consent at onboarding,
  data export and account deletion must exist before any non-owner user.
- 18+ age gate. Plans never go below the calorie floors or ignore injury flags.
- The app never diagnoses. Red-flag answers (eating-disorder signs, chest pain, pregnancy,
  serious conditions) route to "see a professional" instead of a plan.
- Commits: small, descriptive, on `main` until the app exists; feature branches after M1.
