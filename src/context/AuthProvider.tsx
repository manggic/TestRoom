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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        console.log({ firebaseUser });

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          let userDoc = await getDoc(userDocRef);

          // 👇 If Firestore profile doesn't exist, create it
          if (!userDoc.exists()) {
            console.warn("User profile not found in Firestore. Creating...");

            const defaultProfile: UserProfile = {
              name: firebaseUser.displayName || "Unnamed",
              email: firebaseUser.email || "",
              role: "student", // default role
              isActive: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            try {
              await setDoc(userDocRef, defaultProfile);
              console.log("✅ User profile created in Firestore.");
              userDoc = await getDoc(userDocRef); // Re-fetch after creation
            } catch (setDocError) {
              console.error("🔥 Failed to create Firestore profile:", setDocError);
              setCurrentUser({ firebaseUser, profile: null });
              setLoading(false);
              return;
            }
          }

          const profile = userDoc.data() as UserProfile;

          setCurrentUser({
            firebaseUser,
            profile,
          });
        } catch (error) {
          console.error("🔥 Error fetching Firestore user profile:", error);
          setCurrentUser({
            firebaseUser,
            profile: null,
          });
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
      console.error("Error signing out:", error);
    }
  };

  const value = {
    currentUser,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
