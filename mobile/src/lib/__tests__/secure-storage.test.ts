import * as SecureStore from 'expo-secure-store';

import { CHUNK_SIZE, chunkedSecureStorage, splitIntoChunks } from '@/lib/secure-storage';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      if (value.length > 2048) throw new Error('value too large');
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const store = (SecureStore as unknown as { __store: Map<string, string> }).__store;

beforeEach(() => store.clear());

test('returns null for a missing key', async () => {
  expect(await chunkedSecureStorage.getItem('session')).toBeNull();
});

test('round-trips a value larger than one SecureStore entry', async () => {
  const big = 'x'.repeat(CHUNK_SIZE * 3 + 17);
  await chunkedSecureStorage.setItem('session', big);
  expect(store.get('session.chunks')).toBe('4');
  expect(await chunkedSecureStorage.getItem('session')).toBe(big);
});

test('overwriting with a shorter value leaves no stale chunks', async () => {
  await chunkedSecureStorage.setItem('session', 'y'.repeat(CHUNK_SIZE * 2 + 1));
  await chunkedSecureStorage.setItem('session', 'short');
  expect(await chunkedSecureStorage.getItem('session')).toBe('short');
  expect([...store.keys()].sort()).toEqual(['session.0', 'session.chunks']);
});

test('removeItem deletes every chunk and the count', async () => {
  await chunkedSecureStorage.setItem('session', 'z'.repeat(CHUNK_SIZE + 1));
  await chunkedSecureStorage.removeItem('session');
  expect(store.size).toBe(0);
});

test('a missing chunk reads as absent rather than a corrupt session', async () => {
  await chunkedSecureStorage.setItem('session', 'a'.repeat(CHUNK_SIZE + 1));
  store.delete('session.1');
  expect(await chunkedSecureStorage.getItem('session')).toBeNull();
});

test('a corrupt chunk count reads as absent', async () => {
  store.set('session.chunks', 'garbage');
  expect(await chunkedSecureStorage.getItem('session')).toBeNull();
});

test('never splits an emoji across two chunks', () => {
  const value = 'a'.repeat(CHUNK_SIZE - 1) + '\u{1F4AA}' + 'b';
  const chunks = splitIntoChunks(value);
  expect(chunks.join('')).toBe(value);
  expect(chunks[0]).toHaveLength(CHUNK_SIZE - 1);
  expect(chunks[1].startsWith('\u{1F4AA}')).toBe(true);
});
