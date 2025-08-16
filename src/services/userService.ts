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

export async function getUsersOfOrg({ orgId }) {
    try {
        // Step 1: Get all users
        const { data: users, error: usersError } = await supabaseClient
            .from("users")
            .select("*")
            .eq("organization_id", orgId);

        if (usersError) throw usersError;

        // Step 2: Enrich each user
        const enrichedUsers = await Promise.all(
            (users || []).map(async (user) => {
                if (user.role === "student") {
                    // Fetch all test attempts by this student
                    const { data: attempts, error: attemptsError } =
                        await supabaseClient
                            .from("test_attempts")
                            .select("id, test_id")
                            .eq("organization_id", orgId)
                            .eq("student_id", user.id);

                    if (attemptsError) throw attemptsError;

                    const uniqueTestIds = Array.from(
                        new Set((attempts || []).map((a) => a.test_id))
                    );

                    let testNamesMap: Record<string, string> = {};
                    if (uniqueTestIds.length > 0) {
                        const { data: tests, error: testsError } =
                            await supabaseClient
                                .from("tests")
                                .select("id, test_name")
                                .in("id", uniqueTestIds);

                        if (testsError) throw testsError;

                        testNamesMap = Object.fromEntries(
                            (tests || []).map((t) => [t.id, t.test_name])
                        );
                    }

                    const attempted_tests = (attempts || []).map((attempt) => ({
                        test_attempt_id: attempt.id,
                        test_id: attempt.test_id,
                        test_name:
                            testNamesMap[attempt.test_id] || "Unknown Test",
                    }));

                    return {
                        ...user,
                        attempted_tests,
                    };
                }

                if (user.role === "teacher") {
                    const { data: createdTests, error: createdTestsError } =
                        await supabaseClient
                            .from("tests")
                            .select("id, test_name")
                            .eq("organization_id", orgId)
                            .eq("created_by", user.id);

                    if (createdTestsError) throw createdTestsError;

                    const created_tests = (createdTests || []).map((test) => ({
                        test_id: test.id,
                        test_name: test.test_name,
                    }));

                    return {
                        ...user,
                        created_tests,
                    };
                }

                // For admin or other roles
                return user;
            })
        );

        return { success: true, data: enrichedUsers };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getStudentsOfOrg({ orgId }) {
    try {
        const { data: students, error: studentsError } = await supabaseClient
            .from("users")
            .select("*")
            .eq("organization_id", orgId)
            .eq("role", "student");

        if (studentsError) throw studentsError;

        const enrichedStudents = await Promise.all(
            (students || []).map(async (student) => {
                const { data: attempts, error: attemptsError } =
                    await supabaseClient
                        .from("test_attempts")
                        .select("id, test_id")
                        .eq("organization_id", orgId)
                        .eq("student_id", student.id);

                if (attemptsError) throw attemptsError;

                const uniqueTestIds = Array.from(
                    new Set((attempts || []).map((a) => a.test_id))
                );

                let testNamesMap: Record<string, string> = {};
                if (uniqueTestIds.length > 0) {
                    const { data: tests, error: testsError } =
                        await supabaseClient
                            .from("tests")
                            .select("id, test_name")
                            .in("id", uniqueTestIds);

                    if (testsError) throw testsError;

                    testNamesMap = Object.fromEntries(
                        (tests || []).map((t) => [t.id, t.test_name])
                    );
                }

                const attempted_tests = (attempts || []).map((attempt) => ({
                    test_attempt_id: attempt.id,
                    test_id: attempt.test_id,
                    test_name: testNamesMap[attempt.test_id] || "Unknown Test",
                }));

                return {
                    ...student,
                    attempted_tests,
                };
            })
        );

        return { success: true, data: enrichedStudents };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTeachersOfOrg({ orgId }) {
    try {
        const { data: teachers, error: teachersError } = await supabaseClient
            .from("users")
            .select("*")
            .eq("organization_id", orgId)
            .eq("role", "teacher");

        if (teachersError) throw teachersError;

        const enrichedTeachers = await Promise.all(
            (teachers || []).map(async (teacher) => {
                const { data: createdTests, error: createdTestsError } =
                    await supabaseClient
                        .from("tests")
                        .select("id, test_name")
                        .eq("organization_id", orgId)
                        .eq("created_by", teacher.id);

                if (createdTestsError) throw createdTestsError;

                const created_tests = (createdTests || []).map((test) => ({
                    test_id: test.id,
                    test_name: test.test_name,
                }));

                return {
                    ...teacher,
                    created_tests,
                };
            })
        );

        return { success: true, data: enrichedTeachers };
    } catch (error) {
        return errorHandler(error);
    }
}
