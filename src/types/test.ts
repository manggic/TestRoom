export type Question = {
    id:string;
    questionText: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correctAnswer: keyof Question["options"]; // 'a' | 'b' | 'c' | 'd'
    marks: number;
    createdAt: string;
    updatedAt: string;
};

export type Test = {
    testName: string;
    description: string;
    questions: Array<Question>
    durationMinutes: number;
    createdBy: {
        id: string;
        name: string;
    };
    status: "draft" | "published";
    highestScore: number;
    attempts: number;
    totalMarks: number;
    createdAt: string;
    updatedAt: string;
    lastUpdatedBy: {
        id: string;
        name: string;
    };
};
