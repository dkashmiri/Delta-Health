import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  date_of_birth: string | null;
  consent_version: string | null;
  consent_at: string | null;
};

const COLUMNS = 'id, date_of_birth, consent_version, consent_at';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

/** The database also rejects anyone under 18, so a modified client cannot skip the gate. */
export async function saveDateOfBirth(userId: string, dateOfBirth: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: userId, date_of_birth: dateOfBirth });
  if (error) throw error;
}

/** consent_at is set by the database, so the client cannot backdate it. */
export async function recordConsent(userId: string, version: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: userId, consent_version: version });
  if (error) throw error;
}
