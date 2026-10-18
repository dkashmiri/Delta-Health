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
  - [ ] Supabase project (Sydney region) + Supabase connector attached
  - [ ] Anthropic API key stored in Supabase secrets (never in chat or repo)

## M1: App skeleton + login  (todo)
- [ ] Expo app (TS strict, Expo Router) runs on Android and iOS
- [ ] Email sign-in with Supabase Auth; session in secure store
- [ ] 18+ age gate and consent screen before any health question
- [ ] CI: type-check, lint, tests on every push (GitHub Actions)

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
