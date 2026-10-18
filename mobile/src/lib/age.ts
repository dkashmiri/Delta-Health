export const MINIMUM_AGE = 18;

/** Today's local calendar date at UTC midnight, comparable with parsed dates of birth. */
function localToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Parses a YYYY-MM-DD date of birth. Returns null for malformed, impossible or future dates. */
export function parseDateOfBirth(input: string, today: Date = localToday()): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) return null;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isRealDate || year < 1900 || date.getTime() > today.getTime()) return null;
  return date;
}

/** Whole years between the date of birth and today. */
export function ageOn(dateOfBirth: Date, today: Date = localToday()): number {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayPassed =
    today.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() >= dateOfBirth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

export function isAdult(dateOfBirth: Date, today: Date = localToday()): boolean {
  return ageOn(dateOfBirth, today) >= MINIMUM_AGE;
}
