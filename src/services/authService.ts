import { errorHandler } from "@/lib/utils";
import { supabaseClient } from "@/supabase/config";

export const signupUser = async (
    email: string,
    password: string,
    additionalInfo: {
        name: string;
        role: "admin" | "student" | "teacher";
        actionBy?: string;
        organization_id: string;
    }
) => {
    try {
        // Sign up with Supabase Auth
        const signUpData = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: additionalInfo.name,
                    role: additionalInfo.role,
                    organization_id: additionalInfo.organization_id,
                },
            },
        });

        const { data, error } = signUpData || {};

        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error("No user returned from Supabase signUp");

        // Insert user into 'users' table
        const { error: userError } = await supabaseClient.from("users").insert([
            {
                id: user.id,
                name: additionalInfo.name,
                email,
                role: additionalInfo.role,
                organization_id: additionalInfo.organization_id,
                attempted_tests_count: 0,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ]);
        if (userError) {
            if (userError.code === "23505") {
                return {
                    success: false,
                    message: "User with this email already exists.",
                };
            }
            // If userError, inform the user but allow Auth signup to succeed
            return {
                success: false,
                message:
                    "Signup succeeded, but user profile could not be created. Please contact support.",
            };
        }

        return {
            success: true,
            data: user,
            message: "user created successfully",
        };
    } catch (error: any) {
        if (error.code === "23505") {
            return {
                success: false,
                message: "User with this email already exists.",
            };
        }
        return errorHandler(error);
    }
};

// Sign in with email/password
export const logInUser = async ({ email, password }) => {
    try {
        // Sign up
        // const signUpData = await supabase.auth.signUp({
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        const user = data.user;
        if (!user?.email) {
            return { success: false, message: "Something went wrong" };
        }


        // Fetch full user record from 'users' table
        let { data: userRecord, error: userFetchError } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (userFetchError) {
            return {
                success: false,
                data: null,
                message: userFetchError?.message,
            };
        }
        return { success: true, data: userRecord };
    } catch (error: any) {
        if (error.code === "23505") {
            return {
                success: false,
                message: "User with this email already exists.",
            };
        }
        return errorHandler(error);
    }
};
