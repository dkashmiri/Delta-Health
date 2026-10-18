import { useState } from 'react';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 8;

// Generic messages so the screen does not reveal whether an email already has an account.
const SIGN_IN_FAILED = 'Email or password is incorrect, or the email is not confirmed yet.';
const SIGN_UP_FAILED = 'Could not create the account. If you already have one, sign in instead.';

export default function SignInScreen() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const signingUp = mode === 'sign-up';

  async function submit() {
    setError(null);
    setNotice(null);
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setBusy(true);
    try {
      if (signingUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: trimmedEmail, password });
        if (signUpError) {
          setError(SIGN_UP_FAILED);
        } else if (!data.session) {
          // With email confirmation on, Supabase returns no session until the link is clicked.
          setNotice('Check your email and tap the confirmation link, then sign in.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (signInError) setError(SIGN_IN_FAILED);
      }
    } catch {
      setError('Could not reach Delta Health. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle" accessibilityRole="header">
        Delta Health
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        A plan built for you alone, from where you are now to where you want to be.
      </ThemedText>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        hint={signingUp ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={signingUp ? 'new-password' : 'current-password'}
        textContentType={signingUp ? 'newPassword' : 'password'}
      />

      {error ? (
        <ThemedText themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      {notice ? <ThemedText accessibilityRole="alert">{notice}</ThemedText> : null}

      <Button label={signingUp ? 'Create account' : 'Sign in'} onPress={submit} busy={busy} />
      <Button
        variant="secondary"
        label={signingUp ? 'I already have an account' : 'Create an account'}
        onPress={() => {
          setMode(signingUp ? 'sign-in' : 'sign-up');
          setError(null);
          setNotice(null);
        }}
      />
    </Screen>
  );
}
