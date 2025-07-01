import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp, serverTimestamp } from "firebase/firestore";

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


export function normalizeCreatedAt(createdAt: any) {
  if (
    createdAt?.seconds != null &&
    createdAt?.nanoseconds != null
  ) {
    return Timestamp.fromMillis(
      new Timestamp(
        createdAt.seconds,
        createdAt.nanoseconds
      ).toMillis()
    );
  }
  return serverTimestamp();
}