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

export async function getUsersForAdmin() {
    try {
        // Step 1: Get all users
        const { data: users, error: usersError } = await supabaseClient
            .from("users")
            .select("*");

        if (usersError) throw usersError;

        // Step 2: Enrich each user
        const enrichedUsers = await Promise.all(
            (users || []).map(async (user) => {
                let testData: any[] = [];

                if (user.role === "student") {
                    // Fetch all test attempts by this student
                    const { data: attempts, error: attemptsError } =
                        await supabaseClient
                            .from("test_attempts")
                            .select("test_id")
                            .eq("student_id", user.id);

                    if (attemptsError) throw attemptsError;

                    const uniqueTestIds = Array.from(
                        new Set((attempts || []).map((a) => a.test_id))
                    );

                    if (uniqueTestIds.length > 0) {
                        const { data: attemptedTests, error: testsError } =
                            await supabaseClient
                                .from("tests")
                                .select("id, test_name")
                                .in("id", uniqueTestIds);

                        if (testsError) throw testsError;

                        testData = attemptedTests || [];
                    }

                    return {
                        ...user,
                        attempted_tests: testData,
                    };
                }

                if (user.role === "teacher") {
                    const { data: createdTests, error: createdTestsError } =
                        await supabaseClient
                            .from("tests")
                            .select("id, test_name")
                            .eq("created_by", user.id);

                    if (createdTestsError) throw createdTestsError;

                    return {
                        ...user,
                        created_tests: createdTests || [],
                    };
                }

                // For admin or others
                return user;
            })
        );

        return { success: true, data: enrichedUsers };
    } catch (error) {
        return errorHandler(error);
    }
}

// delete user
