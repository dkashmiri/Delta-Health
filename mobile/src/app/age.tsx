import { Redirect } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { CONSENT_VERSION } from '@/constants/consent';
import { isAdult, MINIMUM_AGE, parseDateOfBirth } from '@/lib/age';
import { saveDateOfBirth } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function AgeScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [underage, setUnderage] = useState(false);

  if (profile?.consent_version !== CONSENT_VERSION) return <Redirect href="/consent" />;

  if (underage) {
    return (
      <Screen>
        <ThemedText type="subtitle" accessibilityRole="header">
          Delta Health is for adults
        </ThemedText>
        <ThemedText>
          You need to be {MINIMUM_AGE} or older to use Delta Health. If you want help with fitness or
          nutrition, a parent, school PE teacher or your GP is a good place to start.
        </ThemedText>
        <Button label="Sign out" onPress={() => supabase.auth.signOut()} />
      </Screen>
    );
  }

  async function submit() {
    setError(null);
    const dateOfBirth = parseDateOfBirth(input);
    if (!dateOfBirth) {
      setError('Enter your date of birth as YYYY-MM-DD, for example 1998-04-23.');
      return;
    }
    // Under-18 dates are not stored.
    if (!isAdult(dateOfBirth)) {
      setUnderage(true);
      return;
    }
    if (!session) return;

    setBusy(true);
    try {
      await saveDateOfBirth(session.user.id, input.trim());
      await refreshProfile();
    } catch {
      setError('Could not save your date of birth. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle" accessibilityRole="header">
        When were you born?
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Delta Health is for adults {MINIMUM_AGE} and over. Your age also sets your energy needs and
        training limits.
      </ThemedText>
      <TextField
        label="Date of birth"
        hint="YYYY-MM-DD"
        placeholder="1998-04-23"
        value={input}
        onChangeText={setInput}
        keyboardType="numbers-and-punctuation"
        autoComplete="birthdate-full"
        maxLength={10}
      />
      {error ? (
        <ThemedText themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Button label="Continue" onPress={submit} busy={busy} />
    </Screen>
  );
}
