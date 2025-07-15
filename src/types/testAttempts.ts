

export type TestAttemptWithJoins = {
  id: string;
  test_id: string;
  student_id: string;
  status: "completed" | "in_progress" | string;
  score_achieved: number;
  correct_answer_count: number;
  time_taken_seconds: number;
  total_questions: number;
  answers: Record<string, string>; // example: { q0: "a", q1: "c" }
  start_time: string; // ISO timestamp
  end_time: string;   // ISO timestamp
  created_at: string;
  updated_at: string;

  // joined from users!test_attempts_student_id_fkey
  users: {
    name: string;
    email: string;
  };

  // joined from tests!test_attempts_test_id_fkey
  tests: {
    test_name: string;
    total_marks: number;
  };
};
