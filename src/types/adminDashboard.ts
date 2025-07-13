// A test a user has attempted
export type AttemptedTest = {
  test_attempt_id: string;
  test_id: string;
  test_name: string;
};

// A test a teacher has created
export type CreatedTest = {
  test_id: string;
  test_name: string;
};



export type BaseUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin"; // extend if needed
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


export type StudentUser = BaseUser & {
  role: "student"; // narrowed role
  attempted_tests: AttemptedTest[];
  attempted_tests_count: number;
};


export type TeacherUser = BaseUser & {
  role: "teacher"; // narrowed role
  created_tests: CreatedTest[];
  attempted_tests_count?: number; // optional, based on your data
};
