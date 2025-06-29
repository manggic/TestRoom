import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { apiHandler } from "@/lib/utils";

export const signupUser = async (
    email: string,
    password: string,
    additionalInfo: any
) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        try {
            await setDoc(doc(db, "users", user.uid), {
                email,
                ...additionalInfo,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isActive: true,
            });
        } catch (firestoreError) {
            console.error(
                "⚠️ Firestore document creation failed:",
                firestoreError
            );
            // Optionally: mark user for cleanup or notify admin
            return {
                success: false,
                message:
                    "Auth success, but user profile failed to save. Please contact support.",
            };
        }

        return { success: true, data: user };
    } catch (error: unknown) {
        return apiHandler(error);
    }
};

// Sign in with email/password
export const logInUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        console.log("user response of login attempt", { user });

        if (user?.email) {
            return { success: true, data: user };
        } else {
            return { success: false, message: "Something went wrong" };
        }
    } catch (error: unknown) {
        return apiHandler(error);
    }
};
