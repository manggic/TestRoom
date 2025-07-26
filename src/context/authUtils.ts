// src/contexts/authUtils.ts
import { supabaseClient } from "@/supabase/config";
import type { Session, User } from "@supabase/supabase-js";
// TODO: Replace Firebase auth logic with Supabase auth logic below.

let lastAuthUserId: string | null = null;

export const subscribeToAuthChanges = (
    callback: (user: User | null) => void
) => {
    // Listen to auth state changes
    const {
        data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {

        const currentUserId = session?.user?.id ?? null;

        // Only trigger callback if the user ID actually changed
        if (currentUserId !== lastAuthUserId) {
            console.log(
                "Auth state changed:",
                event,
                "User ID:",
                currentUserId,
                "Previous:",
                lastAuthUserId
            );
            lastAuthUserId = currentUserId;
            callback(session?.user ?? null);
        } else {
            console.log(
                "Auth state event ignored - same user ID:",
                currentUserId
            );
            // callback(null)
        }
    });

    // Return unsubscribe function
    return () => {
        console.log("Unsubscribing from auth changes");
        subscription.unsubscribe();
    };
};

export const performSignOut = async () => {
    await supabaseClient.auth.signOut();
};
