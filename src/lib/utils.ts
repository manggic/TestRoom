import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp, serverTimestamp } from "firebase/firestore";

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

export function normalizeCreatedAt(createdAt: any) {
    if (createdAt?.seconds != null && createdAt?.nanoseconds != null) {
        return Timestamp.fromMillis(
            new Timestamp(createdAt.seconds, createdAt.nanoseconds).toMillis()
        );
    }
    return serverTimestamp();
}
