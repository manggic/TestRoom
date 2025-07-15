import { errorHandler, handleResponse } from "@/lib/utils";
import { supabaseClient } from "@/supabase/config";

export async function submitTestAttempt(testAttemptDataObj) {
    try {
        const {
            test_id,
            student_id,
            correctAnswers,
            start_time,
            end_time,
            total_questions,
            time_taken_seconds,
            status,
            score_achieved,
            created_at,
            updated_at,
            answers,
            testData,
        } = testAttemptDataObj;

        // 1. Insert the test attempt
        const { data: attempt, error: attemptError } = await supabaseClient
            .from("test_attempts")
            .insert({
                test_id,
                student_id,
                start_time,
                end_time,
                status,
                score_achieved,
                answers,
                created_at,
                updated_at,
                total_questions,
                time_taken_seconds,
                correct_answer_count: correctAnswers,
            })
            .select()
            .single();

        if (attemptError) throw attemptError;

        // 2. Update the test stats
        const { error: updateError } = await supabaseClient
            .from("tests")
            .update({
                attempts: testData.attempts + 1,
                highest_score: Math.max(testData.highest_score, score_achieved),
            })
            .eq("id", test_id);

        if (updateError) throw updateError;

        // 3. Increment user's attemptedTests
        const { data: user, error: fetchUserError } = await supabaseClient
            .from("users")
            .select("attempted_tests_count")
            .eq("id", student_id)
            .single();

        if (fetchUserError) throw fetchUserError;

        const currentAttempts = user?.attempted_tests_count || 0;

        const { error: updateUserError } = await supabaseClient
            .from("users")
            .update({ attempted_tests_count: currentAttempts + 1 })
            .eq("id", student_id);

        if (updateUserError) throw updateUserError;

        // ✅ Success Response
        return {
            success: true,
            message: "Test submitted successfully!",
            data: {
                attempt,
                score: score_achieved,
                totalMarks: testData.total_marks,
                correctAnswers,
                totalQuestions: total_questions,
            },
        };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTestAttemptsByTestId(testId: string) {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select(
                `
                *,
                tests!test_id(
                    *,
                    users!fk_tests_created_by(name),
                    questions(*)
                ),
                users(name)
            `
            )
            // .select("*, users(name)") // join with users table
            .eq("test_id", testId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return handleResponse(data, error);
    } catch (error) {
        return { data: null, error };
    }
}

export async function getTestAttemptById(id: string) {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select(
                `
                *,
                tests!test_id(
                    *,
                    users!created_by(name),
                    questions(*)
                )
            `
            )
            .eq("id", id)
            .single(); // ensures you get a single object, not an array

        if (error) throw error;
        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTestAttempts() {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select("*, users(name)") // join with users table
            .order("created_at", { ascending: false });

        if (error) throw error;
        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTestAttemptsByStudentId(studentId: string) {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            // .select("*, users(name)") // join with users table

            .select(
                `
                id,
                score_achieved,
                total_questions,
                time_taken_seconds,
                created_at,
                status,
                tests!test_id(
                    id,
                    test_name,
                    description,
                    duration_minutes,
                    total_marks,
                    created_by,
                    users!created_by(name)
                ),
                users(name)
            `
            )

            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTestAttemptsByTestIdAndStudentId(
    testId: string,
    studentId: string
) {
    try {
        // Prefer in_progress, else latest
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select("*")
            .eq("test_id", testId)
            .eq("student_id", studentId)
            .order("created_at", { ascending: false })
            .limit(1);
        if (error) throw error;
        return handleResponse(data, error);
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getUnattemptedTestsOfStudentId(studentId: string) {
    try {
        // Get all published tests
        const { data: tests, error: testsError } = await supabaseClient
            .from("tests")
            .select(
                `
                *,
                users!created_by(name)
            `
            )
            .eq("status", "published");
        if (testsError) throw testsError;

        // Get tests that the student has attempted
        const { data: attempts, error: attemptsError } = await supabaseClient
            .from("test_attempts")
            .select("test_id")
            .eq("student_id", studentId);
        if (attemptsError) throw attemptsError;

        const attemptedTestIds = new Set(attempts?.map((a) => a.test_id) || []);

        // Filter out tests that student has already attempted
        const unattemptedTests =
            tests?.filter((test) => !attemptedTestIds.has(test.id)) || [];

        return {
            success: true,
            data: unattemptedTests,
        };
    } catch (error) {
        return errorHandler(error);
    }
}

// sample
export async function getAttemptsListing(testId: string) {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select(
                `
                *,
                users!test_attempts_student_id_fkey(name, email),
                tests!test_attempts_test_id_fkey(test_name, total_marks)
            `
            )
            .eq("test_id", testId)
            .order("created_at", { ascending: false });

        console.log("all test attempted based on testId", data);
        return handleResponse(data, error);

        // call all testAttempt based in testId

        // loop through prepare data such as
        // student name ,
    } catch (error) {
        return errorHandler(error);
    }
}

// sample
// export async function sample() {
//     try {
//     } catch (error) {
//         return errorHandler(error);
//     }
// }
