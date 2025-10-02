import { errorHandler } from '@/lib/utils';
import { supabaseClient } from '@/supabase/config';

export const createTest = async ({ testDataToCreate }) => {
  try {
    const {
      test_name,
      duration_minutes,
      questions,
      status,
      description,
      last_updated_by,
      created_by,
      organization_id,
    } = testDataToCreate;

    // 1️⃣ Check if a test with the same name already exists
    const { data: existingTests, error: fetchError } = await supabaseClient
      .from('tests')
      .select('id')
      .eq('test_name', test_name)
      .eq('organization_id', organization_id) // optional: restrict per organization
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingTests?.length > 0) {
      return {
        success: false,
        message: `"${test_name}" already exists!`,
      };
    }

    const total_marks = (questions || []).reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    const now = new Date().toISOString();

    // Insert test
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .insert([
        {
          test_name,
          duration_minutes,
          description: description || '',
          status,
          highest_score: 0,
          attempts: 0,
          total_marks,
          created_at: now,
          updated_at: now,
          last_updated_by,
          created_by,
          organization_id,
        },
      ])
      .select()
      .single();
    if (testError) throw testError;

    // Insert questions
    for (const q of questions || []) {
      const { error: questionError } = await supabaseClient.from('questions').insert({
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
};

export async function updateTest({ testId, testDataToUpdate, isNameChanged }) {
  try {
    const {
      test_name,
      duration_minutes,
      description,
      status,
      last_updated_by,
      questions = [],
      organization_id,
    } = testDataToUpdate;

    if (isNameChanged) {
      // 1️⃣ Check if a test with the same name already exists
      const { data: existingTests, error: fetchErr } = await supabaseClient
        .from('tests')
        .select('id')
        .eq('test_name', test_name)
        .eq('organization_id', organization_id) // optional: restrict per organization
        .limit(1);

      if (fetchErr) throw fetchErr;

      if (existingTests?.length > 0) {
        return {
          success: false,
          message: `"${test_name}" already exists!`,
        };
      }
    }

    const now = new Date().toISOString();

    const total_marks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    // Step 1: Update test metadata
    const { error: testError } = await supabaseClient
      .from('tests')
      .update({
        ...(test_name && { test_name }),
        ...(duration_minutes && { duration_minutes }),
        ...(description && { description }),
        ...(status && { status }),
        ...(last_updated_by && { last_updated_by }),
        total_marks,
        updated_at: now,
      })
      .eq('organization_id', organization_id)
      .eq('id', testId);

    if (testError) throw testError;

    // Step 2: Fetch existing question IDs
    const { data: existingQuestions, error: fetchError } = await supabaseClient
      .from('questions')
      .select('id')
      .eq('test_id', testId);

    if (fetchError) throw fetchError;

    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const incomingIds = new Set(questions.map((q) => q.id).filter(Boolean));

    // Step 3: Delete removed questions
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('questions')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) throw deleteError;
    }

    // Step 4: Update or Insert questions
    for (const q of questions) {
      if (q.id && existingIds.has(q.id)) {
        // Update existing question
        const { error: updateError } = await supabaseClient
          .from('questions')
          .update({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            marks: q.marks,
            updated_at: now,
          })
          .eq('id', q.id);

        if (updateError) throw updateError;
      } else {
        // Insert new question
        const { error: insertError } = await supabaseClient.from('questions').insert({
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
      message: 'Test and questions updated successfully!',
    };
  } catch (error) {
    return errorHandler(error);
  }
}

export async function getTestsOfOrg({ orgId }) {
  try {
    // Step 1: Fetch all tests
    const { data: tests, error: testsError } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('organization_id', orgId);
    if (testsError) throw testsError;

    // Step 2: Get all user IDs used in createdBy and updatedBy fields
    const userIds = Array.from(
      new Set(tests.flatMap((test) => [test.created_by, test.last_updated_by]).filter(Boolean))
    );

    // Step 3: Fetch only required users
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name')
      .in('id', userIds);
    if (usersError) throw usersError;

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u.name]));

    // Step 4: Fetch questions for each test and attach user names
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
          createdByName: userMap[test.created_by] || 'Unknown',
          updatedByName: userMap[test.last_updated_by] || 'Unknown',
        };
      })
    );

    return { success: true, data: allTests, message: 'success' };
  } catch (error) {
    return errorHandler(error);
  }
}

export async function getTests() {
  try {
    // Step 1: Fetch all tests
    const { data: tests, error: testsError } = await supabaseClient.from('tests').select('*');
    if (testsError) throw testsError;

    // Step 2: Get all user IDs used in createdBy and updatedBy fields
    const userIds = Array.from(
      new Set(tests.flatMap((test) => [test.created_by, test.last_updated_by]).filter(Boolean))
    );

    // Step 3: Fetch only required users
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name')
      .in('id', userIds);
    if (usersError) throw usersError;

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u.name]));

    // Step 4: Fetch questions for each test and attach user names
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
          createdByName: userMap[test.created_by] || 'Unknown',
          updatedByName: userMap[test.last_updated_by] || 'Unknown',
        };
      })
    );

    return { success: true, data: allTests, message: 'success' };
  } catch (error) {
    return errorHandler(error);
  }
}

export async function getTestById({ testId }) {
  try {
    // Step 1: Fetch the test by ID
    const { data: test, error: testError } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single(); // ensures you get a single object, not an array

    if (testError) throw testError;
    if (!test) return { success: false, message: 'Test not found' };

    // Step 2: Fetch the questions for the test
    const { data: questions, error: questionsError } = await supabaseClient
      .from('questions')
      .select('*')
      .eq('test_id', test.id);

    if (questionsError) throw questionsError;

    // Step 3: Fetch the createdBy and updatedBy user names
    const userIds = [test.created_by, test.last_updated_by].filter(Boolean);

    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name')
      .in('id', userIds);

    if (usersError) throw usersError;

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u.name]));

    // Step 4: Return the enriched test object
    return {
      success: true,
      data: {
        ...test,
        questions: questions || [],
        createdByName: userMap[test.created_by] || 'Unknown',
        updatedByName: userMap[test.last_updated_by] || 'Unknown',
      },
    };
  } catch (error) {
    return errorHandler(error);
  }
}

export async function getTestsByTeacherId({ userId, orgId }) {
  try {
    // Step 1: Fetch all tests created by the given user
    const { data: tests, error: testsError } = await supabaseClient
      .from('tests')
      .select('*')
      .eq('organization_id', orgId)
      .eq('created_by', userId);

    if (testsError) throw testsError;

    if (!tests || tests.length === 0) {
      return { success: true, data: [], message: 'data is empty' }; // no tests found
    }

    // Step 2: Extract all unique user IDs (created_by and last_updated_by)
    const userIds = Array.from(
      new Set(tests.flatMap((test) => [test.created_by, test.last_updated_by]).filter(Boolean))
    );

    // Step 3: Fetch user details for those user IDs
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, name')
      .eq('organization_id', orgId)
      .in('id', userIds);

    if (usersError) throw usersError;

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u.name]));

    // Step 4: Fetch questions for each test and enrich the test data
    const allTests = await Promise.all(
      tests.map(async (test) => {
        const { data: questions, error: questionsError } = await supabaseClient
          .from('questions')
          .select('*')
          .eq('test_id', test.id);

        if (questionsError) throw questionsError;

        return {
          ...test,
          questions: questions || [],
          createdByName: userMap[test.created_by] || 'Unknown',
          updatedByName: userMap[test.last_updated_by] || 'Unknown',
        };
      })
    );

    return { success: true, data: allTests, message: 'success' };
  } catch (error) {
    return errorHandler(error);
  }
}
