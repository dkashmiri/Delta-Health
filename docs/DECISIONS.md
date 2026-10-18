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
