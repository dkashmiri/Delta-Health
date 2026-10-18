// Bump the version whenever the wording changes; users are asked to agree again.
export const CONSENT_VERSION = '2026-10-19';

// Shown before any health question or date of birth is collected (APP 3 and 5 collection notice).
export const CONSENT_POINTS = [
  'Delta Health collects your email (to sign you in), your date of birth (to confirm you are 18 or over and to set your energy needs), and health information you choose to share: body measurements, goals, food preferences, training, sleep, injuries and medical conditions.',
  'It is used only to build and adjust your personal plan. It is never sold or used for advertising.',
  'Your answers are sent to Anthropic, in the United States, whose AI model (Claude) generates your plan. Anthropic does not use them to train its models.',
  'Your data is stored with Supabase in Australia (Sydney). Access is limited to you and the systems that build your plan.',
  'You can ask for all of your data to be exported or deleted at any time.',
  'Delta Health gives general fitness and nutrition guidance, not medical advice. See a doctor before starting if you have a medical condition, injury or are pregnant.',
] as const;
