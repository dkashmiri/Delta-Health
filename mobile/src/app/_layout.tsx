import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { ProfileError } from '@/components/profile-error';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Signed out -> sign-in. Signed in but not onboarded -> consent (the collection notice), then the
// age gate. Otherwise the app.
function RootNavigator() {
  const { session, loading, profileError, onboarded } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;
  if (profileError) return <ProfileError />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !onboarded}>
        <Stack.Screen name="consent" />
        <Stack.Screen name="age" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && onboarded}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}
