// import type { User } from '@supabase/supabase-js';

export type UserProfile = {
    name: string;
    email: string;
    role: "teacher" | "student" | "admin";
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
};

export type AuthContextUser = {
    user: any; // Supabase user object
};

export type AuthContextType = {
    currentUser: AuthContextUser | null;
    setCurrentUser: (user: AuthContextUser | null) => void;
    loading: boolean;
    signOut: () => Promise<void>;
};

export type AuthProviderProps = {
    children: React.ReactNode;
};
