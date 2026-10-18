# Decisions

## 2026-10-19: Build the agent team with Claude Code sub-agents, not MetaGPT/CrewAI/AutoGen
Borrow MetaGPT's role-and-handoff pattern; implement roles as `.claude/agents/*.md`.
Rejected: running MetaGPT/CrewAI as dependencies (extra Python runtime, OpenAI-first defaults,
nothing they add that sub-agents plus a backlog do not cover for one developer).

## 2026-10-19: Expo + Supabase + Claude API (server-side only)
One TypeScript codebase for both platforms; EAS builds iOS without a Mac; Supabase gives
Postgres + Auth + RLS + edge functions on a free tier. Rejected: Flutter (second language),
Firebase (weaker relational model and SQL for plan versioning).

## 2026-10-19: Safety rules enforced in code, not only in prompts
Deterministic checks cannot be talked around by user text or model drift.

## 2026-10-19: Session in expo-secure-store (chunked), not expo-sqlite localStorage
Expo's Supabase guide uses expo-sqlite localStorage, which is unencrypted on disk. Health-app
tokens go in the Keychain/Keystore; values are split into 600-char chunks to stay under
SecureStore's per-item limit.

## 2026-10-19: Consent notice before date of birth
APP 5 wants the collection notice at or before collection, so consent comes first and the age
gate second. Under-18 dates are never stored; the database trigger rejects them independently.

## 2026-10-19: npm audit is reported, not blocking, in CI
All current high advisories are in Expo/Metro build tooling, not the shipped bundle, and the
suggested fixes downgrade Expo. Revisit at each SDK upgrade.
