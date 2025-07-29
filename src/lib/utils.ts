import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { roles } from "./constants";
import validator from "validator";

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

// export const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//     });
// };

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return `${day} ${month} ${year}, ${time}`;
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

export const validateOrgRegistration = ({ formData }) => {
    const {
        org_name,
        org_address,
        pincode,
        state,
        city,
        contact_number,
        owner_name,
        email,
    } = formData;

    // Initialize response object
    const response = {
        isValid: true,
        message: "",
    };

    // Validate each field
    if (
        !org_name ||
        typeof org_name !== "string" ||
        org_name.trim().length === 0
    ) {
        response.isValid = false;
        response.message = "Organization name is required";
        return response;
    }

    if (
        !org_address ||
        typeof org_address !== "string" ||
        org_address.trim().length === 0
    ) {
        response.isValid = false;
        response.message = "Organization address is required";
        return response;
    }

    if (
        !pincode ||
        typeof pincode !== "number" ||
        !validator.isPostalCode(String(pincode), "IN")
    ) {
        response.isValid = false;
        response.message = "Invalid pincode";
        return response;
    }

    if (!state || typeof state !== "string" || state.trim().length === 0) {
        response.isValid = false;
        response.message = "State is required";
        return response;
    }

    if (!city || typeof city !== "string" || city.trim().length === 0) {
        response.isValid = false;
        response.message = "City is required";
        return response;
    }

    if (!contact_number || !validator.isMobilePhone(contact_number, "en-IN")) {
        response.isValid = false;
        response.message = "Invalid phone number";
        return response;
    }

    if (
        !owner_name ||
        typeof owner_name !== "string" ||
        owner_name.trim().length === 0
    ) {
        response.isValid = false;
        response.message = "Owner name is required";
        return response;
    }

    if (!email || !validator.isEmail(email)) {
        response.isValid = false;
        response.message = "Invalid email address";
        return response;
    }

    // All validations passed
    return response;
};

// TODO: Replace all Firestore logic with Supabase equivalents if needed.
