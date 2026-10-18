import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { chunkedSecureStorage } from '@/lib/secure-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.',
  );
}

// The publishable key is public by design; row-level security protects the data.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // SecureStore exists only on iOS/Android. On web (a dev preview only) Supabase falls back
    // to localStorage in the browser, or memory during server rendering.
    storage: Platform.OS === 'web' ? undefined : chunkedSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Only refresh tokens while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
