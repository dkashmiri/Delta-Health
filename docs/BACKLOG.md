# Backlog

Status: `todo` · `in progress` · `in review (qa|security|science)` · `blocked (owner)` · `done`
Each item: acceptance criteria as checkboxes. Tick only with evidence.

## M0: Foundation  (in progress)
- [x] Repo linked to GitHub, agent team defined, process docs written
- [ ] **M0-2 Owner spec imported** (`blocked (owner)`: waiting for the owner's document)
  - [ ] Document saved in `docs/spec/` and summarised in `docs/spec/README.md`
  - [ ] 12-week roadmap extracted as eval case #1
- [ ] **M0-3 Accounts and connectors ready** (`blocked (owner)`)
  - [ ] Expo account + EAS project
  - [x] Supabase project `ekxhoqafuflyjtkbnqzj` (ap-southeast-2 Sydney, free tier) + connector attached
  - [ ] Anthropic API key stored in Supabase secrets (never in chat or repo)

## M1: App skeleton + login  (in review: blocked on device run)
- [ ] Expo app (TS strict, Expo Router) runs on Android and iOS. Code builds, type-checks and
      passes 42 unit/route tests; NOT yet run on a device (needs Supabase project + Expo Go)
- [x] Email sign-in with Supabase Auth; session in chunked expo-secure-store
      (evidence: `sign-in.test.tsx`, `secure-storage.test.ts`; not yet against a live backend)
- [x] Consent notice, then 18+ age gate, before any health question; enforced again by DB trigger
      (evidence: `routing.test.tsx`, `gate.test.tsx`)
- [x] CI: type-check, lint, tests on every push (`.github/workflows/ci.yml`)
- [x] RLS/trigger pgTAP tests: 9/9 pass against the live project (2026-10-19, run via connector, test data removed)

### M1 follow-ups (from QA/security review 2026-10-19)
- [ ] Owner: Supabase Auth settings: min password length 8, leaked-password protection, email confirm on
- [ ] Privacy policy page + link from consent screen (before any non-owner user)
- [ ] Pin GitHub Actions to commit SHAs
- [ ] Keep the navigator mounted during user switch (QA F4, low)
- [ ] Remember an under-18 block across restarts (QA F8, info; server already rejects)

## M2: Onboarding questionnaire  (todo)
- [ ] Stories and questions approved by owner (product-ux)
- [ ] Profile, goals, foods, budget, equipment, schedule, injuries saved with RLS
- [ ] Red-flag answers route to referral screen (fitness-safety-rules gates)

## M3: Plan generation  (todo)
- [ ] Safety rules signed off by sports-science-reviewer, implemented in code with tests
- [ ] Intake -> nutrition/training/recovery drafts -> safety -> composer pipeline in edge function
- [ ] Eval case #1 (owner roadmap) passes; zero hard-rule violations across eval set

## M4: Daily check-in  (todo)
- [ ] Log weight, meals adherence, workout done, sleep, energy, pain in under 60 seconds

## M5: Weekly auto-adjust  (todo)
- [ ] Weekly review agent creates a new plan version within adjust limits, explains changes

## M6: Progress charts + privacy completeness  (todo)
- [ ] Weight, adherence and training charts
- [ ] Data export and account deletion work end to end
- [ ] Security agent full MASVS pass; internal TestFlight / Play internal track build
- [ ] Contact email in the consent text (next consent version), with the privacy policy
- [ ] Run `supabase test db` in CI (currently run by hand through the Supabase connector)
