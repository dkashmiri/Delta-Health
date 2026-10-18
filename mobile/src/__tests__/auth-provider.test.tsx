import { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import { CONSENT_VERSION } from '@/constants/consent';
import { fetchProfile } from '@/lib/profile';
import { AuthProvider, useAuth } from '@/providers/auth-provider';

let mockEmit: (session: unknown) => void = () => {};
const mockGetSession = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        mockEmit = (session) => cb('EVENT', session);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
    },
  },
}));
jest.mock('@/lib/profile', () => ({ fetchProfile: jest.fn() }));

const fetchMock = fetchProfile as jest.Mock;
const session = (id: string) => ({ user: { id } });
const fullProfile = { id: 'u1', date_of_birth: '1990-01-01', consent_version: CONSENT_VERSION, consent_at: 'x' };

const probe = {} as { current: ReturnType<typeof useAuth> };
function Probe() {
  const value = useAuth();
  useEffect(() => {
    probe.current = value;
  });
  const label = value.loading ? 'loading' : value.profileError ? 'error' : value.onboarded ? 'onboarded' : 'not-onboarded';
  return <Text>{label}</Text>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null } });
});

test('stays loading until the session and its profile are both loaded', async () => {
  let resolveProfile: (p: unknown) => void = () => {};
  mockGetSession.mockResolvedValue({ data: { session: session('u1') } });
  fetchMock.mockReturnValue(new Promise((r) => (resolveProfile = r)));

  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(screen.getByText('loading')).toBeOnTheScreen();

  await act(async () => resolveProfile(fullProfile));
  expect(screen.getByText('onboarded')).toBeOnTheScreen();
});

test('an outdated consent version is not onboarded', async () => {
  mockGetSession.mockResolvedValue({ data: { session: session('u1') } });
  fetchMock.mockResolvedValue({ ...fullProfile, consent_version: '2000-01-01' });
  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText('not-onboarded')).toBeOnTheScreen();
});

test('switching user hides the previous user profile while the new one loads', async () => {
  mockGetSession.mockResolvedValue({ data: { session: session('u1') } });
  fetchMock.mockResolvedValueOnce(fullProfile).mockReturnValueOnce(new Promise(() => {}));
  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText('onboarded')).toBeOnTheScreen();

  await act(async () => mockEmit(session('u2')));
  expect(screen.getByText('loading')).toBeOnTheScreen();
  expect(probe.current.profile).toBeNull();
});

// An offline cold start must not send an onboarded user back through the gate.
test('a failed profile fetch is reported as an error, then recovers on retry', async () => {
  mockGetSession.mockResolvedValue({ data: { session: session('u1') } });
  fetchMock.mockRejectedValueOnce(new Error('Network request failed')).mockResolvedValueOnce(fullProfile);
  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText('error')).toBeOnTheScreen();

  await act(async () => probe.current.refreshProfile());
  expect(screen.getByText('onboarded')).toBeOnTheScreen();
});

test('an unreadable stored session counts as signed out instead of hanging', async () => {
  mockGetSession.mockRejectedValue(new Error('keychain unavailable'));
  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText('not-onboarded')).toBeOnTheScreen();
  expect(probe.current.session).toBeNull();
});

// Regression: a refresh that resolves after sign-out must not leave the app loading (blank screen).
test('sign-out during a pending refreshProfile does not leave the app loading', async () => {
  mockGetSession.mockResolvedValue({ data: { session: session('u1') } });
  fetchMock.mockResolvedValueOnce({ ...fullProfile, consent_version: null });
  await render(<AuthProvider><Probe /></AuthProvider>);
  expect(await screen.findByText('not-onboarded')).toBeOnTheScreen();

  let resolveRefresh: (p: unknown) => void = () => {};
  fetchMock.mockReturnValueOnce(new Promise((r) => (resolveRefresh = r)));
  let refresh!: Promise<void>;
  await act(async () => {
    refresh = probe.current.refreshProfile(); // e.g. "Agree and continue" just tapped
  });
  await act(async () => mockEmit(null)); // then "Not now, sign out"
  await act(async () => {
    resolveRefresh(fullProfile);
    await refresh;
  });

  expect(probe.current.session).toBeNull();
  expect(probe.current.loading).toBe(false);
});
