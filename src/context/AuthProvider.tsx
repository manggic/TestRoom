// src/contexts/AuthProvider.tsx

import { useEffect, useState } from "react";
import { performSignOut, subscribeToAuthChanges } from "./authUtils";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps, AuthContextUser } from "./types";
import { supabaseClient } from "@/supabase/config";
import type { User } from '@supabase/supabase-js';

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthContextUser | null>(null);
  const [loading, setLoading] = useState(true); // <- controls ProtectedRoute access

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authUser: User | null) => {
      if (authUser) {
        // Fetch from your users table
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
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await performSignOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("❌ Error signing out:", error);
    }
  };

  const value = { currentUser, setCurrentUser, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
