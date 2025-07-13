export type OptionKey = "a" | "b" | "c" | "d";

export type Question = {
    id: string;
    question_text: string;
    options: Record<OptionKey, string>;
    correct_answer: OptionKey; // 'a' | 'b' | 'c' | 'd'
    marks: number;
    createdAt: string;
    updatedAt: string;
    test_id: string;
};

export type QuestionForComp = Pick<
    Question,
    "question_text" | "options" | "correct_answer" | "marks"
>;

export type Test = {
    id: string;
    test_name: string;
    description: string;
    duration_minutes: number;
    status: "draft" | "published" | "archived"; // Adjust enum as per app logic
    created_by: string;
    createdByName: string;
    last_updated_by: string;
    updatedByName: string;
    created_at: string; // or use Date if you convert it
    updated_at: string;
    total_marks: number;
    highest_score: number;
    attempts: number;
    questions: Question[];
};
