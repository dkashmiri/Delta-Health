import { useState } from 'react';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

/** Shown when the profile cannot be loaded, so an onboarded user is not sent back through the gate. */
export function ProfileError() {
  const { refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      await refreshProfile();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle" accessibilityRole="header">
        Can&apos;t reach Delta Health
      </ThemedText>
      <ThemedText>Check your internet connection and try again.</ThemedText>
      <Button label="Try again" onPress={retry} busy={busy} />
      <Button variant="secondary" label="Sign out" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}
