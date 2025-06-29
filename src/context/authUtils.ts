// src/contexts/authUtils.ts
import { auth } from '@/firebase/config';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

export const performSignOut = () => {
  return firebaseSignOut(auth);
};