import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { CONSENT_POINTS, CONSENT_VERSION } from '@/constants/consent';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { recordConsent } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function ConsentScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const theme = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.consent_version === CONSENT_VERSION) return <Redirect href="/age" />;

  async function submit() {
    if (!session) return;
    setError(null);
    setBusy(true);
    try {
      await recordConsent(session.user.id, CONSENT_VERSION);
      await refreshProfile();
    } catch {
      setError('Could not save your consent. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle" accessibilityRole="header">
        Your health data
      </ThemedText>
      <View style={styles.points}>
        {CONSENT_POINTS.map((point) => (
          <ThemedText key={point}>{`• ${point}`}</ThemedText>
        ))}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed }}
        accessibilityLabel="I agree to Delta Health collecting and using my health information as described"
        onPress={() => setAgreed((value) => !value)}
        style={styles.checkRow}>
        <View
          style={[
            styles.box,
            { borderColor: theme.tint, backgroundColor: agreed ? theme.tint : 'transparent' },
          ]}>
          {agreed ? <ThemedText style={{ color: theme.onTint }}>{'✓'}</ThemedText> : null}
        </View>
        <ThemedText style={styles.checkLabel}>
          I agree to Delta Health collecting and using my health information as described.
        </ThemedText>
      </Pressable>

      {error ? (
        <ThemedText themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Button label="Agree and continue" onPress={submit} disabled={!agreed} busy={busy} />
      <Button variant="secondary" label="Not now, sign out" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  points: { gap: Spacing.two },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 48 },
  box: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: { flex: 1 },
});
