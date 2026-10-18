import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { CONSENT_VERSION } from '@/constants/consent';
import { fetchProfile, type Profile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** The profile could not be fetched (e.g. offline). Distinct from "not onboarded". */
  profileError: boolean;
  /** True once the user has agreed to the current consent and given a date of birth. */
  onboarded: boolean;
  refreshProfile: () => Promise<void>;
};

type LoadedProfile = { userId: string | null; profile: Profile | null; failed: boolean };

const AuthContext = createContext<AuthState | null>(null);

async function loadProfile(userId: string | null): Promise<LoadedProfile> {
  if (!userId) return { userId, profile: null, failed: false };
  try {
    return { userId, profile: await fetchProfile(userId), failed: false };
  } catch {
    return { userId, profile: null, failed: true };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  // Remembers which user the profile was loaded for, so a user switch reads as loading.
  const [loaded, setLoaded] = useState<LoadedProfile>();
  const userId = session?.user.id ?? null;
  const currentUserId = useRef(userId);

  useEffect(() => {
    currentUserId.current = userId;
  }, [userId]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      // An unreadable stored session is treated as signed out rather than hanging on the splash.
      .catch(() => setSession(null))
      .finally(() => setSessionLoaded(true));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionLoaded) return;
    let cancelled = false;
    loadProfile(userId).then((result) => {
      if (!cancelled) setLoaded(result);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionLoaded, userId]);

  const refreshProfile = useCallback(async () => {
    const result = await loadProfile(userId);
    // Drop the result if the user signed out or switched while it was in flight.
    if (currentUserId.current === result.userId) setLoaded(result);
  }, [userId]);

  const profileLoaded = loaded?.userId === userId;
  const profile = profileLoaded ? (loaded?.profile ?? null) : null;
  const onboarded = profile?.consent_version === CONSENT_VERSION && Boolean(profile?.date_of_birth);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading: !sessionLoaded || !profileLoaded,
        profileError: profileLoaded && Boolean(loaded?.failed),
        onboarded,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
