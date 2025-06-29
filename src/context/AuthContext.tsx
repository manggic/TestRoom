// src/contexts/AuthContext.ts
import { createContext } from "react";
import type { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    signOut: async () => {},
});
