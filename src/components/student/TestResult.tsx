import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Download,
    ArrowLeft,
    Trophy,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import { getTestAttemptById } from "@/services/testAttemptService";
import { formatDate } from "@/lib/utils";

interface Question {
    id: string;
    question_text: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correct_answer: string;
    marks: number;
}

interface TestAttempt {
    id: string;
    score_achieved: number;
    total_questions: number;
    time_taken_seconds: number;
    answers: { [key: string]: string };
    created_at: string;
    status: "in_progress" | "completed" | "timed_out";
    tests: {
        id: string;
        test_name: string;
        description: string;
        duration_minutes: number;
        total_marks: number;
        questions: Question[];
        users: {
            name: string;
        };
    };
    correct_answer_count: number;
}

export default function TestResult() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (attemptId) {
            loadResult();
        }
    }, [attemptId]);

    const loadResult = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getTestAttemptById(attemptId!);
            if (result.success) {
                setAttempt(result.data);
            } else {
                setError("Failed to load test result. Please try again.");
            }
        } catch (error) {
            setError("An error occurred while loading the result.");
            console.error("Error loading result:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!attempt) return;

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageHeight = doc.internal.pageSize.height;
        const margin = 40;
        let y = 60;
        let total = 0,
            obtained = 0;

        doc.setFontSize(18).text(
            `🧪 ${attempt.tests.test_name} Result`,
            margin,
            y
        );
        y += 30;
        doc.setFontSize(12);

        // Calculate correct answers
        const correctAnswers = attempt.tests.questions.filter(
            (q, i) => attempt.answers[`q${i}`] === q.correct_answer
        ).length;

        // Add summary
        doc.text(
            `Score: ${attempt.score_achieved}/${attempt.tests.total_marks}`,
            margin,
            y
        );
        y += 20;
        doc.text(
            `Correct Answers: ${correctAnswers}/${attempt.total_questions}`,
            margin,
            y
        );
        y += 20;
        const mins = Math.floor((attempt.time_taken_seconds || 0) / 60);
        const secs = (attempt.time_taken_seconds || 0) % 60;
        doc.text(`Time Taken: ${mins}m ${secs}s`, margin, y);
        y += 30;

        attempt.tests.questions.forEach((q, i) => {
            const selected = attempt.answers[`q${i}`];
            const correct = q.correct_answer;
            const marks = selected === correct ? q.marks : 0;
            total += q.marks;
            obtained += marks;

            doc.text(`${i + 1}. ${q.question_text}`, margin, y);
            y += 18;

            Object.entries(q.options).forEach(([key, value]) => {
                let label = `${key.toUpperCase()}. ${value}`;
                if (key === correct) label += " ✅";
                if (key === selected && key !== correct) label += " ❌";
                doc.text(label, margin + 20, y);
                y += 16;
            });

            doc.text(
                `Your Answer: ${
                    q.options[selected as keyof typeof q.options] ||
                    "Not Answered"
                }`.trim(),
                margin + 20,
                y
            );
            y += 16;
            doc.text(
                `Correct Answer: ${
                    q.options[correct as keyof typeof q.options]
                }`.trim(),
                margin + 20,
                y
            );
            y += 24;

            if (y > pageHeight - 100) {
                doc.addPage();
                y = 60;
            }
        });

        doc.text(`Total Marks: ${obtained}/${total}`, margin, y);
        doc.save(`${attempt.tests.test_name}-Result.pdf`);
    };

    const getScorePercentage = (score: number, totalMarks: number) => {
        return Math.round((score / totalMarks) * 100);
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return "text-green-600";
        if (percentage >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading result...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Error Loading Result
                    </h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => navigate("/")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Result Not Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        The test result you're looking for doesn't exist or has
                        been removed.
                    </p>
                    <Button onClick={() => navigate("/")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const percentage = getScorePercentage(
        attempt.score_achieved,
        attempt.tests.total_marks
    );
    const scoreColor = getScoreColor(percentage);

     console.log({attempt});
     
     
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Result Summary */}
            <Card className="mb-8">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        {attempt.tests.test_name}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                        {attempt.tests.description}
                    </p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                            </div>
                            <div className={`text-3xl font-bold ${scoreColor}`}>
                                {attempt.score_achieved}/
                                {attempt.tests.total_marks}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {percentage}% Score
                            </div>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold">
                                {attempt?.correct_answer_count}/
                                {attempt.tests.questions.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Correct Answers
                            </div>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold">
                                {(() => {
                                    const t = attempt.time_taken_seconds || 0;
                                    return `${Math.floor(t / 60)}m ${t % 60}s`;
                                })()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Time Taken
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Attempted on {formatDate(attempt.created_at)}
                    </div>
                </CardContent>
            </Card>

            {/* Questions Review */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Test Results
                    </h3>
                </div>
                {attempt.tests.questions.map((question, index) => {
                    const selected = attempt.answers[`q${index}`];
                    const correct = question.correct_answer;
                    const isCorrect = selected === correct;
                    const notAnswered = selected === undefined;

                    return (
                        <div
                            key={question.id}
                            className="border p-4 rounded-xl shadow-sm bg-background"
                        >
                            <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                                Q{index + 1}: {question.question_text} (
                                {question.marks} marks)
                            </h4>

                            <div className="space-y-2 mb-4">
                                {Object.entries(question.options).map(
                                    ([key, value]) => {
                                        const isSelected = selected === key;
                                        const isCorrectAnswer = correct === key;

                                        let optionClass =
                                            "flex items-center space-x-2 p-2 rounded";
                                        if (isCorrectAnswer) {
                                            optionClass +=
                                                " bg-green-100 border border-green-300 dark:bg-green-900/20 dark:border-green-600";
                                        } else if (
                                            isSelected &&
                                            !isCorrectAnswer
                                        ) {
                                            optionClass +=
                                                " bg-red-100 border border-red-300 dark:bg-red-900/20 dark:border-red-600";
                                        } else {
                                            optionClass +=
                                                " bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600";
                                        }

                                        return (
                                            <div
                                                key={key}
                                                className={optionClass}
                                            >
                                                <input
                                                    type="radio"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="cursor-default border-0 bg-transparent"
                                                />
                                                <label className="cursor-default text-gray-900 dark:text-white">
                                                    {key.toUpperCase()}. {value}
                                                </label>
                                                {isCorrectAnswer && (
                                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                                )}
                                                {isSelected &&
                                                    !isCorrectAnswer && (
                                                        <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                                                    )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Your Answer:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-md font-medium ${
                                            notAnswered
                                                ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                                : isCorrect
                                                ? "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                                : "bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                        }`}
                                    >
                                        {notAnswered
                                            ? "Not Answered"
                                            : question.options[
                                                  selected as keyof typeof question.options
                                              ]}
                                    </span>
                                </div>
                                {!isCorrect && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            Correct Answer:
                                        </span>
                                        <span className="bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 px-3 py-1 rounded-md font-medium">
                                            {
                                                question.options[
                                                    correct as keyof typeof question.options
                                                ]
                                            }
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        Marks:
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-md font-medium ${
                                            isCorrect
                                                ? "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                                : "bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                                        }`}
                                    >
                                        {isCorrect ? question.marks : 0}/
                                        {question.marks}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Download Button */}
            <div className="flex justify-center mt-8">
                <Button
                    onClick={downloadPDF}
                    className="shadow-lg cursor-pointer bg-blue-600 hover:bg-blue-700"
                >
                    <Download className="mr-2 h-4 w-4" /> Download Result PDF
                </Button>
            </div>
        </div>
    );
}
