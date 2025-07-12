import { supabaseClient } from '../supabase/config';
// TODO: Replace all Firebase auth logic with Supabase equivalents.

import { errorHandler } from '@/lib/utils';

export const signupUser = async (
    email: string,
    password: string,
    additionalInfo: { name: string; role: 'admin' | 'student' | 'teacher' }
) => {
    try {
        // Sign up with Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { name: additionalInfo.name, role: additionalInfo.role }
            }
        });
        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error('No user returned from Supabase signUp');

        // Insert user into 'users' table
        const { error: userError } = await supabaseClient
            .from('users')
            .insert([{
                id: user.id,
                name: additionalInfo.name,
                email,
                role: additionalInfo.role,
                attempted_tests: 0,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }]);
        if (userError) {
            if (userError.code === '23505') {
                return { success: false, message: 'User with this email already exists.' };
            }
            // If userError, inform the user but allow Auth signup to succeed
            return { success: false, message: 'Signup succeeded, but user profile could not be created. Please contact support.' };
        }

        return { success: true, data: user };
    } catch (error: any) {
        if (error.code === '23505') {
            return { success: false, message: 'User with this email already exists.' };
        }
        return errorHandler(error);
    }
};

// Sign in with email/password
export const logInUser = async (email: string, password: string) => {
    try {
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
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        if (userFetchError && userFetchError.code === 'PGRST116') {
            // User not found in users table, insert now
            const { data: insertedUser, error: insertError } = await supabaseClient
                .from('users')
                .insert([{
                    id: user.id,
                    name: user.user_metadata?.name || '',
                    email: user.email,
                    role: user.user_metadata?.role || 'student',
                    attempted_tests: 0,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }])
                .select()
                .single();
            if (insertError) {
                return { success: false, message: 'Login succeeded, but user profile could not be created. Please contact support.' };
            }
            userRecord = insertedUser;
        } else if (userFetchError) {
            throw userFetchError;
        }
        return { success: true, data: userRecord };
    } catch (error: any) {
        if (error.code === '23505') {
            return { success: false, message: 'User with this email already exists.' };
        }
        return errorHandler(error);
    }
};
