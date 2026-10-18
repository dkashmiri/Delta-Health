import { Text } from 'react-native';
import { Redirect } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import RootLayout from '@/app/_layout';

// The real root layout, driven by a fake auth state that tests can change after render.
type FakeAuth = {
  session: { user: { id: string } } | null;
  loading: boolean;
  profileError: boolean;
  onboarded: boolean;
};

const mockAuth = (() => {
  let state: FakeAuth = { session: null, loading: false, profileError: false, onboarded: false };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: Partial<FakeAuth>) => {
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
})();

jest.mock('@/components/profile-error', () => ({
  ProfileError: () => {
    const { createElement } = jest.requireActual('react');
    const { Text: RNText } = jest.requireActual('react-native');
    return createElement(RNText, null, 'PROFILE-ERROR');
  },
}));
jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));
jest.mock('@/providers/auth-provider', () => {
  const { useSyncExternalStore } = jest.requireActual('react');
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: () => useSyncExternalStore(mockAuth.subscribe, mockAuth.get),
  };
});

const SIGNED_IN = { session: { user: { id: 'user-1' } } };

function routes() {
  return {
    _layout: RootLayout,
    'sign-in': () => <Text>SIGN-IN</Text>,
    // Like the real age screen, which sends anyone without current consent back to consent.
    age: () => <Redirect href="/consent" />,
    consent: () => <Text>CONSENT</Text>,
    index: () => <Text>HOME</Text>,
  };
}

beforeEach(() => mockAuth.set({ session: null, loading: false, profileError: false, onboarded: false }));

test('signed out: deep link to home lands on sign-in', async () => {
  await renderRouter(routes(), { initialUrl: '/' });
  expect(screen.getByText('SIGN-IN')).toBeOnTheScreen();
  expect(screen.queryByText('HOME')).toBeNull();
});

test('signed in but not onboarded: home is unreachable, consent notice shows first', async () => {
  mockAuth.set(SIGNED_IN);
  await renderRouter(routes(), { initialUrl: '/' });
  expect(screen.getByText('CONSENT')).toBeOnTheScreen();
  expect(screen.queryByText('HOME')).toBeNull();
});

test('signed in but not onboarded: deep link to sign-in also lands on consent', async () => {
  mockAuth.set(SIGNED_IN);
  await renderRouter(routes(), { initialUrl: '/sign-in' });
  expect(screen.getByText('CONSENT')).toBeOnTheScreen();
});

test('onboarded: age and consent are unreachable', async () => {
  mockAuth.set({ ...SIGNED_IN, onboarded: true });
  await renderRouter(routes(), { initialUrl: '/consent' });
  expect(screen.getByText('HOME')).toBeOnTheScreen();
  expect(screen.queryByText('CONSENT')).toBeNull();
});

test('finishing consent moves the user to home', async () => {
  mockAuth.set(SIGNED_IN);
  await renderRouter(routes(), { initialUrl: '/consent' });
  expect(screen.getByText('CONSENT')).toBeOnTheScreen();

  await act(async () => mockAuth.set({ onboarded: true }));
  expect(await screen.findByText('HOME')).toBeOnTheScreen();
});

test('signing out from home returns to sign-in', async () => {
  mockAuth.set({ ...SIGNED_IN, onboarded: true });
  await renderRouter(routes(), { initialUrl: '/' });
  expect(screen.getByText('HOME')).toBeOnTheScreen();

  await act(async () => mockAuth.set({ session: null, onboarded: false }));
  expect(await screen.findByText('SIGN-IN')).toBeOnTheScreen();
  expect(screen.queryByText('HOME')).toBeNull();
});

test('signing in goes to consent, not home', async () => {
  await renderRouter(routes(), { initialUrl: '/' });
  await act(async () => mockAuth.set(SIGNED_IN));
  expect(await screen.findByText('CONSENT')).toBeOnTheScreen();
  expect(screen.queryByText('HOME')).toBeNull();
});

test('a profile load error shows the retry screen, not the gate', async () => {
  mockAuth.set({ ...SIGNED_IN, profileError: true });
  await renderRouter(routes(), { initialUrl: '/' });
  expect(screen.getByText('PROFILE-ERROR')).toBeOnTheScreen();
  expect(screen.queryByText('CONSENT')).toBeNull();
});
