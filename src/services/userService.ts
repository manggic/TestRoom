import { errorHandler, handleResponse } from "@/lib/utils";
import { supabaseClient } from "@/supabase/config";

// Get all users
export async function getUsers() {
    try {
        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });
        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}

// Get user by user Id
export async function getUserById(id: string) {
    try {
        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", id)
            .order("created_at", { ascending: false });

        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}


// delete user