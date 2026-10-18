import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SignInScreen from '@/app/sign-in';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(async () => ({ data: {}, error: null })),
      signUp: jest.fn(async () => ({ data: { session: null }, error: null })),
    },
  },
}));

const auth = supabase.auth as unknown as {
  signInWithPassword: jest.Mock;
  signUp: jest.Mock;
};

beforeEach(() => jest.clearAllMocks());

test('rejects an invalid email without calling Supabase', async () => {
  await render(<SignInScreen />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'not-an-email');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText('Enter a valid email address.')).toBeOnTheScreen();
  expect(auth.signInWithPassword).not.toHaveBeenCalled();
});

test('rejects a short password', async () => {
  await render(<SignInScreen />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'me@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'short');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText('Password must be at least 8 characters.')).toBeOnTheScreen();
});

test('signs in with a trimmed email', async () => {
  await render(<SignInScreen />);
  await fireEvent.changeText(screen.getByLabelText('Email'), '  me@example.com ');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

  await waitFor(() =>
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'me@example.com', password: 'longenough' }),
  );
});

test('shows a generic message that does not reveal whether the account exists', async () => {
  auth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: new Error('Invalid login credentials') });
  await render(<SignInScreen />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'me@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'wrongpassword');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

  expect(await screen.findByText(/Email or password is incorrect/)).toBeOnTheScreen();
  expect(screen.queryByText('Invalid login credentials')).toBeNull();
});

test('sign-up asks the user to confirm their email', async () => {
  await render(<SignInScreen />);
  await fireEvent.press(screen.getByRole('button', { name: 'Create an account' }));
  await fireEvent.changeText(screen.getByLabelText('Email'), 'me@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));

  expect(await screen.findByText(/Check your email/)).toBeOnTheScreen();
  expect(auth.signUp).toHaveBeenCalledWith({ email: 'me@example.com', password: 'longenough' });
});
