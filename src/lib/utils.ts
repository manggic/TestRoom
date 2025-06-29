import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function apiHandler(error: unknown) {
    let message = "Something went wrong";

    if (error instanceof Error) {
        message = error.message;
    }

    return {
        success: false,
        message,
    };
}
