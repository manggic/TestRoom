import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type ErrorHandler<T = unknown> = {
    success: boolean;
    message: string;
    data: T;
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function errorHandler<T>(error: unknown): ErrorHandler<T> {
    const defaultError = "Something went wrong";
    let errorMessage = "";

    console.log("ERROR occurred ---------- ", error);

    if (error instanceof Error) {
        errorMessage = error.message;
    }

    return {
        success: false,
        message: errorMessage || defaultError,
        data: [] as T,
    };
}

// TODO: Replace all Firestore logic with Supabase equivalents if needed.
