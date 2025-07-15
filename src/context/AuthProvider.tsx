// src/contexts/AuthProvider.tsx

import { useEffect, useState, useRef } from "react";
import { performSignOut, subscribeToAuthChanges } from "./authUtils";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps, AuthContextUser } from "./types";
import { supabaseClient } from "@/supabase/config";
import type { User } from '@supabase/supabase-js';

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthContextUser | null>(null);
  const [loading, setLoading] = useState(true); // <- controls ProtectedRoute access
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastAuthUserIdRef = useRef<string | null>(null);

  useEffect(() => {
  let isMounted = true;

  const initializeAuth = async () => {
    console.log('AuthProvider: Initializing auth...');

    // Check existing session manually
    const { data: { session } } = await supabaseClient.auth.getSession();
    const authUser = session?.user ?? null;

    if (authUser) {
      console.log({ authUser }, 'initial auth user found');

      lastAuthUserIdRef.current = authUser.id;
      const { data: userFromTable, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (isMounted) {
        if (!error && userFromTable) {
          setCurrentUser({ user: userFromTable });
        } else {
          console.warn("User record not found in DB", error?.message);
          setCurrentUser(null);
        }
        setLoading(false);
      }
    } else {
      if (isMounted) {
        setCurrentUser(null);
        setLoading(false);
      }
    }
  };

  initializeAuth();

  const unsubscribe = subscribeToAuthChanges(async (authUser: User | null) => {

    if (authUser) {
      if (lastAuthUserIdRef.current === authUser.id && currentUser?.user?.id === authUser.id) {
        console.log('User data already cached');
        setLoading(false);
        return;
      }

      lastAuthUserIdRef.current = authUser.id;
      const { data: userFromTable, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!error && userFromTable) {
        setCurrentUser({ user: userFromTable });
      } else {
        setCurrentUser(null);
      }
    } else {
      lastAuthUserIdRef.current = null;
      setCurrentUser(null);
    }

    setLoading(false);
  });

  unsubscribeRef.current = unsubscribe;

  return () => {
    isMounted = false;
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  };
}, []);

  const signOut = async () => {
    try {
      await performSignOut();
      setCurrentUser(null);
      lastAuthUserIdRef.current = null;
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  };

  const value = { currentUser, setCurrentUser, loading, signOut };


  
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">Checking authentication...</p>
      </div>
    ) : (
      children
    )}

    </AuthContext.Provider>
  );
}
