import type { User } from "firebase/auth";

export type UserProfile = {
    name: string;
    email: string;
    role: "teacher" | "student" | "admin";
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
};

export type AuthContextUser = {
    firebaseUser: User;
    profile: UserProfile | null;
};

export type AuthContextType = {
    currentUser: AuthContextUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

export type AuthProviderProps = {
    children: React.ReactNode;
};
