---
name: fitness-safety-rules
description: Hard safety rules every Delta Health plan must pass (age gate, calorie floors, rate limits, injury flags, red-flag referrals). Use when writing or reviewing plan generation, weekly adjustment, onboarding questions, or the in-app safety reviewer.
---
# Fitness safety rules

STATUS: DRAFT v0. Values must be signed off by the `sports-science-reviewer` (with citations)
before M3. Change values only via `docs/DECISIONS.md`.

These rules are enforced **in code** (`safety/` module, deterministic, unit-tested). The model
may add caution but can never relax a rule. A plan that fails any rule is blocked and regenerated
or replaced by a referral screen.

## Gate: do not generate a plan, show a referral instead
- Age under 18.
- Pregnant or up to 6 months postpartum (refer to GP / midwife).
- Any PAR-Q+ "yes" on chest pain, fainting, dizziness with exertion, known heart condition,
  or doctor-restricted activity (refer to GP before exercise).
- Eating-disorder screen positive (SCOFF-style, 2+ yes) or current/past ED diagnosis
  (refer to GP; show Butterfly Foundation 1800 33 4673 in Australia).
- BMI under 18.5 with a weight-loss goal.

## Nutrition limits
- Daily calories never below the higher of: estimated BMR, or 1500 kcal (male) / 1200 kcal (female / unspecified).
- Planned weight loss at most 1% of body weight per week; at most 0.5% when BMI < 25.
- Planned weight gain at most 0.5% of body weight per week.
- Protein target 1.2 to 2.2 g/kg; flag kidney disease answers for GP referral instead.
- No supplement doses beyond label guidance; no prescription drugs, ever.

## Training limits
- Weekly training volume increases at most 10% week on week.
- Deload week at least every 4 to 6 weeks of progressive load.
- Active injury flag: no loading of that body region; suggest physiotherapist review.
- Beginners: no maximal (1RM) testing in the first 4 weeks.
- At least 1 full rest day per week.

## Weekly auto-adjust limits
- Change calories by at most 10% per week.
- Never adjust based on fewer than 3 logged days in the week.
- Sudden loss over 2% body weight in a week, or logged pain score 7+/10: pause progression and
  show a check-in prompt to see a professional.

## Language
- Never diagnose, never say "treat" or "cure". Say "general guidance, not medical advice".
