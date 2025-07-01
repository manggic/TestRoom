// src/contexts/AuthProvider.tsx

import { useEffect, useState } from "react";
import { performSignOut, subscribeToAuthChanges } from "./authUtils";
import { AuthContext } from "./AuthContext";
import type { AuthProviderProps, AuthContextUser, UserProfile } from "./types";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { User } from "firebase/auth";

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthContextUser | null>(null);
  const [loading, setLoading] = useState(true); // <- controls ProtectedRoute access

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log("✅ Firebase user detected:", firebaseUser);

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);
          let profile: UserProfile;

          if (!userDoc.exists()) {
            console.warn("Firestore profile missing, creating...");

            const defaultProfile: UserProfile = {
              name: firebaseUser.displayName || "Unnamed",
              email: firebaseUser.email || "",
              role: "student",
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userDocRef, defaultProfile);
            console.log("✅ Profile created.");

            userDoc = await getDoc(userDocRef); // ensure fresh data
          }

          profile = userDoc.data() as UserProfile;
          console.log("✅ Final profile ready:", profile);

          setCurrentUser({ firebaseUser, profile });
        } catch (err) {
          console.error("🔥 Error building current user:", err);
          setCurrentUser({ firebaseUser, profile: null });
        }
      } else {
        console.log("🟨 No user logged in.");
        setCurrentUser(null);
      }

      // ✅ Do this last — only once currentUser is ready
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

  const value = { currentUser, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
