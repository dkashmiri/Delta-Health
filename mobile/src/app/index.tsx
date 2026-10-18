import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

// Placeholder home until the onboarding questionnaire (M2) and plan (M3) exist.
export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <Screen>
      <ThemedText type="subtitle" accessibilityRole="header">
        Welcome
      </ThemedText>
      <ThemedText themeColor="textSecondary">Signed in as {session?.user.email}</ThemedText>
      <ThemedText>
        Next up: a short questionnaire about where you are now and where you want to be. Your
        personal plan is built from it.
      </ThemedText>
      <Button variant="secondary" label="Sign out" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}
