import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import AgeScreen from '@/app/age';
import ConsentScreen from '@/app/consent';
import { CONSENT_VERSION } from '@/constants/consent';
import { recordConsent, saveDateOfBirth } from '@/lib/profile';

const mockRefreshProfile = jest.fn(async () => {});
let mockProfile: { consent_version: string | null } | null = null;

jest.mock('@/lib/supabase', () => ({ supabase: { auth: { signOut: jest.fn() } } }));
jest.mock('@/lib/profile', () => ({
  saveDateOfBirth: jest.fn(async () => {}),
  recordConsent: jest.fn(async () => {}),
}));
jest.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } }, profile: mockProfile, refreshProfile: mockRefreshProfile }),
}));
jest.mock('expo-router', () => ({ Redirect: () => null }));

beforeEach(() => {
  jest.clearAllMocks();
  mockProfile = null;
});

describe('age gate', () => {
  beforeEach(() => {
    mockProfile = { consent_version: CONSENT_VERSION };
  });

  test('an adult date of birth is saved', async () => {
    await render(<AgeScreen />);
    await fireEvent.changeText(screen.getByLabelText('Date of birth'), '1998-04-23');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(saveDateOfBirth).toHaveBeenCalledWith('user-1', '1998-04-23'));
    expect(mockRefreshProfile).toHaveBeenCalled();
  });

  test('an under-18 date is blocked and never stored', async () => {
    await render(<AgeScreen />);
    await fireEvent.changeText(screen.getByLabelText('Date of birth'), '2015-01-01');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Delta Health is for adults')).toBeOnTheScreen();
    expect(saveDateOfBirth).not.toHaveBeenCalled();
  });

  test('a malformed date shows the expected format', async () => {
    await render(<AgeScreen />);
    await fireEvent.changeText(screen.getByLabelText('Date of birth'), '23/04/1998');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText(/for example 1998-04-23/)).toBeOnTheScreen();
    expect(saveDateOfBirth).not.toHaveBeenCalled();
  });
});

describe('consent', () => {
  test('cannot continue until the box is ticked', async () => {
    await render(<ConsentScreen />);
    const button = screen.getByRole('button', { name: 'Agree and continue' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(recordConsent).not.toHaveBeenCalled();
  });

  test('records the current consent version once agreed', async () => {
    await render(<ConsentScreen />);
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Agree and continue' }));

    await waitFor(() => expect(recordConsent).toHaveBeenCalledWith('user-1', CONSENT_VERSION));
    expect(mockRefreshProfile).toHaveBeenCalled();
  });
});
