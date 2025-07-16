import { useLocation, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Plus,
    Trash,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuth";
import { getTestById, updateTest } from "@/services/testService";
import type { Test, Question } from "@/types/test";

const optionKeys = ["a", "b", "c", "d"];

export default function EditTestPage() {
    const { currentUser } = useAuth();
    const { user } = currentUser || {};
    const { state } = useLocation();
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test>(state.test || null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [errors, setErrors] = useState<{ [index: number]: boolean }>({});

    const questionsPerPage = 10;

    useEffect(() => {
        const loadTest = async () => {
            try {
                if (!testId) return;
                const response = await getTestById(testId);
                if (response.success) {
                    setTest(response.data);
                }
            } catch (err) {
                console.error("Error loading test:", err);
                toast.error("Failed to load test");
            } finally {
                setLoading(false);
            }
        };

        if (state?.test) {
            setTest(state?.test);

            setLoading(false);
        } else {
            loadTest();
        }
    }, [testId, state?.test, user]);

    if (loading) return <div className="p-6 text-center">Loading test...</div>;
    if (!test)
        return (
            <div className="p-6 text-center text-red-500">Test not found.</div>
        );

    const handleInputChange = (
        index: number,
        field: string,
        value: string | number
    ) => {
        const updatedQuestions = [...test.questions];

        const newValue =
            typeof value === "string" ? value.toLowerCase().trim() : value;

        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: newValue,
        };

        // Validation for correctAnswer
        if (field === "correctAnswer") {
            const isValid = optionKeys.includes(newValue as string);

            setErrors((prev) => ({
                ...prev,
                [index]: !isValid,
            }));
        }

        setTest({ ...test, questions: updatedQuestions });
    };

    const handleOptionChange = (
        qIndex: number,
        optIndex: string,
        value: string
    ) => {
        const updatedQuestions = [...test.questions];
        updatedQuestions[qIndex].options[optIndex] = value;
        setTest({ ...test, questions: updatedQuestions });
    };

    const handleDeleteQuestion = (index: number) => {
        const updatedQuestions = [...test.questions];
        updatedQuestions.splice(index, 1);
        setTest({ ...test, questions: updatedQuestions });
        if (
            (currentPage + 1) * questionsPerPage > updatedQuestions.length &&
            currentPage > 0
        ) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            question_text: "New Question?",
            options: { a: "", b: "", c: "", d: "" },
            correct_answer: "a",
            marks: 1,
        };
        setTest({ ...test, questions: [...test.questions, newQuestion] });
        setCurrentPage(Math.floor(test.questions.length / questionsPerPage));
    };

    const handleSave = async () => {
        try {
            const invalidQuestions = Object.entries(errors)
                .filter(([_, hasError]) => hasError)
                .map(([index]) => Number(index) + 1); // human-readable 1-based index

            if (invalidQuestions.length > 0) {
                toast.error(
                    `Please fix correct answer in question(s): ${invalidQuestions.join(
                        ", "
                    )}`
                );
                return;
            }

            // Validation: Ensure all questions have non-empty questionText
            const emptyTextIndexes = test.questions
                .map((q: Question, idx: number) =>
                    !q.question_text || q.question_text.trim() === ""
                        ? idx + 1
                        : null
                )
                .filter((v: number | null) => v !== null);
            if (emptyTextIndexes.length > 0) {
                toast.error(
                    `Please enter question text for question(s): ${emptyTextIndexes.join(
                        ", "
                    )}`
                );
                return;
            }

            // const questions = test.questions.map((q: any) => ({
            //     question_text: q.question_text,
            //     options: q.options,
            //     correct_answer: q.correct_answer,
            //     marks: q.marks,
            // }));

            const updatedTestData = {
                test_name: test.test_name,
                duration_minutes: test.duration_minutes,
                description: test.description,
                questions: test.questions,
                status: "published", // or use test.status if available
                last_updated_by: user?.id,
            };

            const response = await updateTest(test.id, updatedTestData);

            if (response.success) {
                toast.success("Test updated successfully");
                navigate(`/teacher/test/preview/${test.id}`);
            } else {
                toast("Update Test Failed");
            }
        } catch (err) {
            console.error("❌ Error during test update:", err);
            toast.error("Something went wrong while updating the test!");
        }
    };

    const start = currentPage * questionsPerPage;
    const paginatedQuestions = test.questions.slice(
        start,
        start + questionsPerPage
    );
    const totalPages = Math.ceil(test.questions.length / questionsPerPage);

    return (
        <div className="min-h-screen max-h-screen overflow-y-auto p-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} /> Back
                    </Button>
                </div>

                <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    {/* Editable Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Test Name
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                value={test.test_name || ""}
                                onChange={(e) =>
                                    setTest({
                                        ...test,
                                        test_name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Test Duration (minutes)
                            </label>
                            <input
                                type="number"
                                className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                value={test.duration_minutes || ""}
                                onChange={(e) =>
                                    setTest({
                                        ...test,
                                        duration_minutes: +e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Test Description
                        </label>
                        <textarea
                            rows={2}
                            className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                            value={test.description || ""}
                            onChange={(e) =>
                                setTest({
                                    ...test,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>

                    <ul className="space-y-6 mt-4">
                        {paginatedQuestions.map(
                            (q: Question, qIndex: number) => (
                                <li
                                    key={qIndex + start}
                                    className="p-4 rounded-md border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 space-y-3"
                                >
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">
                                            Question {qIndex + 1 + start}
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDeleteQuestion(
                                                    qIndex + start
                                                )
                                            }
                                        >
                                            <Trash
                                                size={16}
                                                className="text-red-500"
                                            />
                                        </Button>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                        value={q.question_text}
                                        onChange={(e) =>
                                            handleInputChange(
                                                qIndex + start,
                                                "question_text",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(["a", "b", "c", "d"] as const).map(
                                            (key) => {
                                                return (
                                                    <div
                                                        key={key}
                                                        className="flex items-center gap-3 sm:gap-4 px-3 py-2 sm:py-3 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700"
                                                    >
                                                        <div className="font-semibold text-sm w-5 text-gray-700 dark:text-gray-300">
                                                            {key.toUpperCase()}.
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="flex-1 text-sm px-3 py-2 rounded-md bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary"
                                                            value={
                                                                q?.options?.[
                                                                    key
                                                                ]
                                                            }
                                                            onChange={(e) =>
                                                                handleOptionChange(
                                                                    qIndex +
                                                                        start,
                                                                    key,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={`Enter option ${key.toUpperCase()}`}
                                                        />
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <div className="flex gap-4 sm:flex-row flex-col">
                                        <div className="w-full">
                                            <label className="text-sm font-medium">
                                                Correct Answer (Enter one of: a,
                                                b, c, or d)
                                            </label>
                                            <input
                                                type="string"
                                                className={`w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border ${
                                                    errors[qIndex + start]
                                                        ? "border-red-500 dark:border-red-400"
                                                        : "border-gray-300 dark:border-zinc-600"
                                                }`}
                                                value={q.correct_answer}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        qIndex + start,
                                                        "correct_answer",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {errors[qIndex + start] && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    Please enter one of: a, b,
                                                    c, or d.
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-full">
                                            <label className="text-sm font-medium">
                                                Marks
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                                value={q.marks}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        qIndex + start,
                                                        "marks",
                                                        +e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </li>
                            )
                        )}
                    </ul>

                    <div className="flex justify-between items-center pt-6">
                        <Button
                            variant="outline"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft size={16} /> Previous
                        </Button>
                        <p className="text-sm">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="flex items-center gap-2"
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-4">
                        <Button
                            className="w-full sm:w-auto flex justify-center items-center gap-2"
                            onClick={handleSave}
                        >
                            <Plus size={16} /> Save Changes
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleAddQuestion}
                            className="w-full sm:w-auto gap-2"
                        >
                            <Plus size={16} /> Add Question
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
