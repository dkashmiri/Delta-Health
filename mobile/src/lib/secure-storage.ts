import * as SecureStore from 'expo-secure-store';

// Supabase sessions can exceed what SecureStore accepts for one value (about 2 KB on some
// devices), so each value is split into chunks and a count key records how many there are.
// 600 UTF-16 units is at most 1800 UTF-8 bytes, so non-ASCII metadata stays under the limit.
export const CHUNK_SIZE = 600;

const countKey = (key: string) => `${key}.chunks`;
const chunkKey = (key: string, index: number) => `${key}.${index}`;
const indexes = (count: number) => Array.from({ length: count }, (_, i) => i);

/** Splits into chunks of at most CHUNK_SIZE without cutting a surrogate pair (e.g. an emoji) in half. */
export function splitIntoChunks(value: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < value.length) {
    let end = Math.min(start + CHUNK_SIZE, value.length);
    const lastCode = value.charCodeAt(end - 1);
    if (end < value.length && lastCode >= 0xd800 && lastCode <= 0xdbff) end -= 1;
    chunks.push(value.slice(start, end));
    start = end;
  }
  return chunks;
}

export const chunkedSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(countKey(key));
    if (count === null || !/^\d+$/.test(count)) return null;

    const parts = await Promise.all(
      indexes(Number(count)).map((i) => SecureStore.getItemAsync(chunkKey(key, i))),
    );
    // A missing chunk means a write was interrupted; treat the value as absent.
    if (parts.some((part) => part === null)) return null;
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    await chunkedSecureStorage.removeItem(key);
    const chunks = splitIntoChunks(value);
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(chunkKey(key, i), chunk)));
    // Written last so a reader never sees a count whose chunks are not all stored yet.
    await SecureStore.setItemAsync(countKey(key), String(chunks.length));
  },

  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(countKey(key));
    await SecureStore.deleteItemAsync(countKey(key));
    if (count === null || !/^\d+$/.test(count)) return;
    await Promise.all(indexes(Number(count)).map((i) => SecureStore.deleteItemAsync(chunkKey(key, i))));
  },
};
