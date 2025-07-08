// src/contexts/authUtils.ts
import { supabaseClient } from '@/supabase/config';
import type { Session, User } from '@supabase/supabase-js';
// TODO: Replace Firebase auth logic with Supabase auth logic below.

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Listen to auth state changes
  const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  // Return unsubscribe function
  return () => {
    data.subscription.unsubscribe();
  };
};

export const performSignOut = async () => {
  await supabaseClient.auth.signOut();
};