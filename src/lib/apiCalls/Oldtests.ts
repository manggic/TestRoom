import { supabaseClient } from "@/supabase/config";
import { errorHandler } from "@/lib/utils";
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
    status: "draft" | "published";
    questions: Question[];
    last_updated_by?: string; // add this line
};

export async function createTest(testDataToCreate: TEST_DATA_TO_CREATE) {
    try {
        const {
            test_name,
            duration_minutes,
            created_by,
            questions,
            status,
            description,
        } = testDataToCreate;
        const total_marks = (questions || []).reduce(
            (sum, q) => sum + (Number(q.marks) || 0),
            0
        );
        const now = new Date().toISOString();

        // Insert test
        const { data: test, error: testError } = await supabaseClient
            .from("tests")
            .insert([
                {
                    test_name,
                    duration_minutes,
                    description: description || "",
                    created_by,
                    status,
                    highest_score: 0,
                    attempts: 0,
                    total_marks,
                    created_at: now,
                    updated_at: now,
                    last_updated_by: created_by,
                },
            ])
            .select()
            .single();
        if (testError) throw testError;

        // Insert questions
        for (const q of questions || []) {
            const { error: questionError } = await supabaseClient
                .from("questions")
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
            message: "Test and questions added successfully!",
            data: test,
        };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function updateTest(
  testId: string,
  testDataToUpdate: Partial<TEST_DATA_TO_CREATE>
) {
  try {
    const {
      test_name,
      duration_minutes,
      description,
      status,
      last_updated_by,
      questions = [],
    } = testDataToUpdate;

    const now = new Date().toISOString();

    const total_marks = questions.reduce(
      (sum, q) => sum + (Number(q.marks) || 0),
      0
    );

    // Step 1: Update test metadata
    const { error: testError } = await supabaseClient
      .from("tests")
      .update({
        ...(test_name && { test_name }),
        ...(duration_minutes && { duration_minutes }),
        ...(description && { description }),
        ...(status && { status }),
        ...(last_updated_by && { last_updated_by }),
        total_marks,
        updated_at: now,
      })
      .eq("id", testId);

    if (testError) throw testError;

    // Step 2: Fetch existing question IDs
    const { data: existingQuestions, error: fetchError } = await supabaseClient
      .from("questions")
      .select("id")
      .eq("test_id", testId);

    if (fetchError) throw fetchError;

    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const incomingIds = new Set(questions.map((q) => q.id).filter(Boolean));

    // Step 3: Delete removed questions
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from("questions")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;
    }

    // Step 4: Update or Insert questions
    for (const q of questions) {
      if (q.id && existingIds.has(q.id)) {
        // Update existing question
        const { error: updateError } = await supabaseClient
          .from("questions")
          .update({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            marks: q.marks,
            updated_at: now,
          })
          .eq("id", q.id);

        if (updateError) throw updateError;
      } else {
        // Insert new question
        const { error: insertError } = await supabaseClient
          .from("questions")
          .insert({
            test_id: testId,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            marks: q.marks,
            created_at: now,
            updated_at: now,
          });

        if (insertError) throw insertError;
      }
    }

    return {
      success: true,
      message: "Test and questions updated successfully!",
    };
  } catch (error) {
    console.error("Update test error:", error);
    return {
      success: false,
      message: "An error occurred while updating the test.",
      error,
    };
  }
}


export async function getAllTests() {
    try {
        // Fetch all tests
        const { data: tests, error: testsError } = await supabaseClient
            .from("tests")
            .select("*");
        if (testsError) throw testsError;

        // For each test, fetch its questions
        const allTests = await Promise.all(
            (tests || []).map(async (test) => {
                const { data: questions, error: questionsError } =
                    await supabaseClient
                        .from("questions")
                        .select("*")
                        .eq("test_id", test.id);
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
            .from("tests")
            .select("*")
            .eq("created_by", teacherId);
        if (testsError) throw testsError;

        // For each test, fetch its questions
        const teacherTests = await Promise.all(
            (tests || []).map(async (test) => {
                const { data: questions, error: questionsError } =
                    await supabaseClient
                        .from("questions")
                        .select("*")
                        .eq("test_id", test.id);
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

// Student dashboard functions
export async function getUnattemptedTests(studentId: string) {
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

export async function getAttemptedTests(studentId: string) {
    try {
        // Get all completed tests that the student has attempted
        const { data: attempts, error: attemptsError } = await supabaseClient
            .from("test_attempts")
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
                )
            `
            )
            .eq("student_id", studentId)
            .eq("status", "completed") // Only show completed attempts
            .order("created_at", { ascending: false });
        if (attemptsError) throw attemptsError;

        // Remove duplicates by test_id (keep the latest attempt for each test)
        const uniqueAttempts =
            attempts?.reduce((acc: any[], attempt: any) => {
                const existingIdx = acc.findIndex(
                    (a) => a.tests.id === attempt.tests.id
                );
                if (existingIdx === -1) {
                    acc.push(attempt);
                } else if (
                    new Date(attempt.created_at) >
                    new Date(acc[existingIdx].created_at)
                ) {
                    // Replace with newer attempt
                    acc[existingIdx] = attempt;
                }
                return acc;
            }, []) || [];

        return {
            success: true,
            data: uniqueAttempts,
        };
    } catch (error) {
        return errorHandler(error);
    }
}

export async function getTestWithQuestions(testId: string) {
    try {
        // Get test details
        const { data: test, error: testError } = await supabaseClient
            .from("tests")
            .select(
                `
                *,
                users!created_by(name)
            `
            )
            .eq("id", testId)
            .single();
        if (testError) throw testError;

        // Get questions for this test
        const { data: questions, error: questionsError } = await supabaseClient
            .from("questions")
            .select("*")
            .eq("test_id", testId);
        if (questionsError) throw questionsError;

        return {
            success: true,
            data: {
                ...test,
                questions: questions || [],
            },
        };
    } catch (error) {
        return errorHandler(error);
    }
}



export async function getTestAttempt(attemptId: string) {
    try {
        const { data: attempt, error: attemptError } = await supabaseClient
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
            .eq("id", attemptId)
            .single();
        if (attemptError) throw attemptError;

        return {
            success: true,
            data: attempt,
        };
    } catch (error) {
        return errorHandler(error);
    }
}

// Utility: Get latest attempt for a test/student, prefer in_progress
export async function getTestAttemptByTestAndStudent(
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
        return { data: data && data[0], error: null };
    } catch (error) {
        return { data: null, error };
    }
}


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
      .select("attemptedTests")
      .eq("id", student_id)
      .single();

    if (fetchUserError) throw fetchUserError;

    const currentAttempts = user?.attemptedTests || 0;

    const { error: updateUserError } = await supabaseClient
      .from("users")
      .update({ attemptedTests: currentAttempts + 1 })
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



export async function getTestById(testId: string) {
  try {
    const { data, error } = await supabaseClient
      .from("tests")
      // Select both test_name and total_marks
      .select("test_name, total_marks")
      .eq("id", testId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getTestAttemptsByTestId(testId: string) {
    try {
        const { data, error } = await supabaseClient
            .from("test_attempts")
            .select("*, users(name)") // join with users table
            .eq("test_id", testId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}
