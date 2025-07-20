import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { roles } from "./constants";

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

export function handleResponse(data, error) {
    if (error) {
        return {
            success: false,
            message: error,
            data: [],
        };
    } else {
        return {
            success: true,
            data,
        };
    }
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const validateSignUpForm = (
    formData,
    setErrors,
    additionChecks = { role: false }
) => {
    const newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (!formData.name.trim()) {
        newErrors.name = "Name is required";
        isValid = false;
    }

    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        isValid = false;
    } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
        newErrors.email = "Invalid email address";
        isValid = false;
    }

    if (!formData.password) {
        newErrors.password = "Password is required";
        isValid = false;
    } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        isValid = false;
    }

    if (additionChecks.role) {
        if (!formData.role || !roles.includes(formData.role)) {
            newErrors.password = "Role is invalid";
            isValid = false;
        }
    }

    setErrors(newErrors);
    return isValid;
};

// TODO: Replace all Firestore logic with Supabase equivalents if needed.
