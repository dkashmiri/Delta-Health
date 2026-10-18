import { ageOn, isAdult, parseDateOfBirth } from '@/lib/age';

const today = new Date(Date.UTC(2026, 9, 19)); // 2026-10-19

describe('parseDateOfBirth', () => {
  test.each(['1998-04-23', ' 2000-02-29 '])('accepts %p', (input) => {
    expect(parseDateOfBirth(input, today)).not.toBeNull();
  });

  test.each(['', '23/04/1998', '1998-4-23', '1998-02-30', '2001-02-29', '1899-12-31', '2027-01-01'])(
    'rejects %p',
    (input) => {
      expect(parseDateOfBirth(input, today)).toBeNull();
    },
  );
});

describe('age gate', () => {
  test('turns 18 exactly on the birthday', () => {
    expect(isAdult(parseDateOfBirth('2008-10-19', today)!, today)).toBe(true);
    expect(isAdult(parseDateOfBirth('2008-10-20', today)!, today)).toBe(false);
  });

  test('counts whole years', () => {
    expect(ageOn(parseDateOfBirth('1998-04-23', today)!, today)).toBe(28);
    expect(ageOn(parseDateOfBirth('1998-12-01', today)!, today)).toBe(27);
  });
});
