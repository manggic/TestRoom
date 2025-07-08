import { supabaseClient } from '@/supabase/config';
import { errorHandler } from '@/lib/utils';
// TODO: Replace all Firestore logic with Supabase equivalents.

// types.ts or inside the same file above createTest()
export type Question = {
    question_text: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correct_answer: string;
    marks: number;
};

export type TEST_DATA_TO_CREATE = {
    test_name: string;
    duration_minutes: number;
    description?: string;
    created_by: string; // user id
    status: 'draft' | 'published';
    questions: Question[];
};

export async function createTest(testDataToCreate: TEST_DATA_TO_CREATE) {
    try {
        const { test_name, duration_minutes, created_by, questions, status, description } = testDataToCreate;
        const total_marks = (questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
        const now = new Date().toISOString();

        // Insert test
        const { data: test, error: testError } = await supabaseClient
            .from('tests')
            .insert([{
                test_name,
                duration_minutes,
                description: description || '',
                created_by,
                status,
                highest_score: 0,
                attempts: 0,
                total_marks,
                created_at: now,
                updated_at: now,
                last_updated_by: created_by,
            }])
            .select()
            .single();
        if (testError) throw testError;

        // Insert questions
        for (const q of questions || []) {
            const { error: questionError } = await supabaseClient
                .from('questions')
                .insert({
                    test_id: test.id,
                    question_text: q.question_text,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    marks: q.marks,
                    created_at: now,
                    updated_at: now,
                });
            if (questionError) throw questionError;
        }

        return {
            success: true,
            message: 'Test and questions added successfully!',
            data: test,
        };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function updateTest(testId: string, testDataToUpdate: Partial<TEST_DATA_TO_CREATE>) {
    try {
        const { test_name, duration_minutes, created_by, questions, status, description } = testDataToUpdate;
        const total_marks = (questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
        const now = new Date().toISOString();

        // Update test
        const { error: testError } = await supabaseClient
            .from('tests')
            .update({
                ...(test_name && { test_name }),
                ...(duration_minutes && { duration_minutes }),
                ...(description && { description }),
                ...(created_by && { created_by }),
                ...(status && { status }),
                total_marks,
                updated_at: now,
            })
            .eq('id', testId);
        if (testError) throw testError;

        // Delete existing questions for this test
        if (questions) {
            const { error: deleteError } = await supabaseClient
                .from('questions')
                .delete()
                .eq('test_id', testId);
            if (deleteError) throw deleteError;

            // Insert updated questions
            for (const q of questions) {
                const { error: questionError } = await supabaseClient
                    .from('questions')
                    .insert({
                        test_id: testId,
                        question_text: q.question_text,
                        options: q.options,
                        correct_answer: q.correct_answer,
                        marks: q.marks,
                        created_at: now,
                        updated_at: now,
                    });
                if (questionError) throw questionError;
            }
        }

        return {
            success: true,
            message: 'Test and questions updated successfully!',
        };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getAllTests() {
    try {
        // Fetch all tests
        const { data: tests, error: testsError } = await supabaseClient
            .from('tests')
            .select('*');
        if (testsError) throw testsError;

        // For each test, fetch its questions
        const allTests = await Promise.all(
            (tests || []).map(async (test) => {
                const { data: questions, error: questionsError } = await supabaseClient
                    .from('questions')
                    .select('*')
                    .eq('test_id', test.id);
                if (questionsError) throw questionsError;
                return {
                    ...test,
                    questions: questions || [],
                };
            })
        );

        return allTests;
    } catch (error) {
        console.error("🔥 Failed to fetch all tests with questions:", error);
        return [];
    }
}

export async function getMyTest(teacherId: string) {
    try {
        // Fetch tests created by this teacher
        const { data: tests, error: testsError } = await supabaseClient
            .from('tests')
            .select('*')
            .eq('created_by', teacherId);
        if (testsError) throw testsError;

        // For each test, fetch its questions
        const teacherTests = await Promise.all(
            (tests || []).map(async (test) => {
                const { data: questions, error: questionsError } = await supabaseClient
                    .from('questions')
                    .select('*')
                    .eq('test_id', test.id);
                if (questionsError) throw questionsError;
                return {
                    ...test,
                    questions: questions || [],
                };
            })
        );

        return {
            success: true,
            message: "fetch test successful",
            data: teacherTests || [],
        };
    } catch (error) {
        return errorHandler(error);
    }
}
