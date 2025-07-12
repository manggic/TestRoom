import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, TimerReset, X, AlertCircle } from "lucide-react";
// import { getTestWithQuestions, submitTestAttempt } from "@/lib/apiCalls/tests";

import jsPDF from "jspdf";
import { submitTestAttempt } from "@/services/testAttemptService";
import { getTestById } from "@/services/testService";

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

interface TestData {
    id: string;
    test_name: string;
    description: string;
    duration_minutes: number;
    total_marks: number;
    questions: Question[];
    users: {
        name: string;
    };
}

export default function TakeTest() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // Prevent duplicate loadTest calls
    const [testLoaded, setTestLoaded] = useState(false);
    const [startTime, setStartTime] = useState(null);

    // Mutex to prevent parallel loadTest/startTestAttempt

    // Auto-submit on browser/tab close with native confirm
    // useEffect(() => {
    //     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    //         if (
    //             !testSubmitted &&
    //             attemptId &&
    //             location.pathname.includes("/student/test")
    //         ) {
    //             e.preventDefault();
    //             e.returnValue =
    //                 "You have an unfinished test. Do you want to auto-submit your answers before leaving?";
    //             return e.returnValue;
    //         }
    //     };
    //     window.addEventListener("beforeunload", handleBeforeUnload);
    //     return () => {
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, [testSubmitted, attemptId, location.pathname]);

    const questionsPerPage = 5;
    const totalPages = testData
        ? Math.ceil(testData.questions.length / questionsPerPage)
        : 1;

    useEffect(() => {
        if (testId && currentUser?.user?.id && !testLoaded) {
            setTestLoaded(true);
            loadTest();
        }
        // Cleanup to allow re-attempt if testId changes
        return () => setTestLoaded(false);
    }, [testId, currentUser]);

    const loadTest = async () => {
        try {
            setLoading(true);
            const data = await getTestById(testId);

            if (data.success) {
                setTestData(data.data);
                setTimeLeft(data.data.duration_minutes * 60); // Convert to seconds
                setTimerStarted(true);

                const currentTimeStamp = new Date().toISOString();
                setStartTime(currentTimeStamp);
            }
            console.log({ data });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }

        // try {
        //     setLoading(true);
        //     setError(null);
        //     let attemptResult;
        //     try {
        //         // Start or get existing test attempt
        //         attemptResult = await startTestAttempt(testId!, currentUser!.user.id);
        //     } catch (err: any) {
        //         // If unique constraint error, fetch existing attempt
        //         if (err?.code === '23505' || (err?.message && err.message.includes('duplicate'))) {
        //             const { data: existing, error: fetchError } = await getTestAttemptByTestAndStudent(testId!, currentUser!.user.id);
        //             if (existing) {
        //                 attemptResult = { success: true, data: existing };
        //             } else {
        //                 setError('Could not fetch existing attempt.');
        //                 return;
        //             }
        //         } else {
        //             setError('Failed to start test attempt.');
        //             return;
        //         }
        //     }
        //     if (attemptResult.success) {
        //         setAttemptId(attemptResult.data.id);
        //         // Load existing answers if any
        //         if (attemptResult.data.answers) {
        //             setAnswers(attemptResult.data.answers);
        //         }
        //     }
        //     const result = await getTestWithQuestions(testId!);
        //     if (result.success) {
        //         setTestData(result.data);
        //         setTimeLeft(result.data.duration_minutes * 60); // Convert to seconds
        //         setTimerStarted(true);
        //     } else {
        //         setError("Failed to load test. Please try again.");
        //     }
        // } catch (error) {
        //     setError("An error occurred while loading the test.");
        //     console.error("Error loading test:", error);
        // } finally {
        //     setLoading(false);
        //     loadTestLock.current = false;
        // }
    };

    useEffect(() => {
        if (timerStarted && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timerStarted && timeLeft <= 0) {
            handleSubmit();
            setTimerStarted(false);
        }
    }, [timeLeft, timerStarted]);

    const handleAnswerChange = (questionIndex: number, optionKey: string) => {
        const newAnswers = { ...answers, [`q${questionIndex}`]: optionKey };
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        // if (submitting || !attemptId || testSubmitted) return;
        try {
            setSubmitting(true);
            // Calculate time taken in seconds
            const timeTakenSeconds = testData!.duration_minutes * 60 - timeLeft;

            let totalScore = 0;
            let correctAnswers = 0;

            testData.questions.forEach((question: any, index: number) => {
                const studentAnswer = answers[`q${index}`];
                if (studentAnswer === question.correct_answer) {
                    totalScore += question.marks;
                    correctAnswers++;
                }
            });
            const now = new Date().toISOString();

            let finalObj = {
                test_id: testData.id,
                student_id: currentUser.user.id,
                time_taken_seconds: timeTakenSeconds,
                total_questions: testData?.questions.length,
                answers,
                status: "completed",
                created_at: now,
                updated_at: now,
                end_time: now,
                start_time: startTime,
                testData,
                correctAnswers,
                score_achieved: totalScore,
            };

            console.log({ finalObj });

            const result = await submitTestAttempt(finalObj);
            if (result.success) {
                setShowResult(true);
                setTestSubmitted(true);
            } else {
                setError("Failed to submit test. Please try again.");
            }
        } catch (error) {
            setError("An error occurred while submitting the test.");
            console.error("Error submitting test:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeout = async () => {
        try {
            setShowResult(true);
            setTestSubmitted(true);
        } catch (error) {
            console.error("Error handling timeout:", error);
        }
    };

    useEffect(() => {
        if (timeLeft === 0 && timerStarted) {
            handleTimeout();
        }
    }, [timeLeft, timerStarted]);

    const downloadPDF = () => {
        if (!testData) return;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 40;
        let y = 60;
        let total = 0,
            obtained = 0,
            correctCount = 0;

        // Header
        doc.setFontSize(22)
            .setFont("helvetica", "bold")
            .text(`${testData.test_name} - Result Summary`, margin, y);
        y += 30;
        doc.setFontSize(12).setFont("helvetica", "normal");
        doc.text(`Student: ${currentUser?.user?.name || ""}`, margin, y);
        y += 18;
        doc.text(`Test Duration: ${testData.duration_minutes} min`, margin, y);
        y += 18;
        doc.text(`Total Questions: ${testData.questions.length}`, margin, y);
        y += 18;
        const now = new Date();
        doc.text(
            `Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            margin,
            y
        );
        y += 24;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 16;

        // Summary Section
        testData.questions.forEach((q, i) => {
            const selected = answers[`q${i}`];
            const correct = q.correct_answer;
            const marks = selected === correct ? q.marks : 0;
            total += q.marks;
            obtained += marks;
            if (selected === correct) correctCount++;
        });
        const mins = Math.floor(
            (testData.duration_minutes * 60 - timeLeft) / 60
        );
        const secs = (testData.duration_minutes * 60 - timeLeft) % 60;
        doc.setFont("helvetica", "bold");
        doc.text(`Score: ${obtained} / ${total}`, margin, y);
        doc.text(
            `Correct: ${correctCount} / ${testData.questions.length}`,
            margin + 180,
            y
        );
        doc.text(`Time: ${mins}m ${secs}s`, margin + 340, y);
        y += 24;
        doc.setFont("helvetica", "normal");
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;

        // Table header
        const colQ = margin + 2;
        const colQuestion = margin + 35;
        const colYour = margin + 230;
        const colCorrect = margin + 370;
        const colMarks = margin + 500;
        const rowHeight = 18;
        doc.setFont("helvetica", "bold");
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, y - 12, pageWidth - margin * 2, rowHeight, "F");
        doc.text("Q#", colQ, y);
        doc.text("Question", colQuestion, y);
        doc.text("Your Answer", colYour, y);
        doc.text("Correct", colCorrect, y);
        doc.text("Marks", colMarks, y);
        y += rowHeight;
        doc.setFont("helvetica", "normal");

        testData.questions.forEach((q, i) => {
            const selected = answers[`q${i}`];
            const correct = q.correct_answer;
            const marks = selected === correct ? q.marks : 0;
            let yourAns =
                selected && q.options[selected as keyof typeof q.options]
                    ? `${selected.toUpperCase()}. ${
                          q.options[selected as keyof typeof q.options]
                      }`
                    : "Not Answered";
            let correctAns =
                correct && q.options[correct as keyof typeof q.options]
                    ? `${correct.toUpperCase()}. ${
                          q.options[correct as keyof typeof q.options]
                      }`
                    : "";
            let markStr = marks > 0 ? `+${marks}` : "0";

            // Wrap question text
            const questionLines = doc.splitTextToSize(
                q.question_text,
                colYour - colQuestion - 10
            );
            const maxLines = Math.max(1, questionLines.length);
            const rowY = y;
            // Highlight row if correct/incorrect
            if (selected === correct) {
                doc.setFillColor(220, 255, 220); // light green
            } else if (selected) {
                doc.setFillColor(255, 220, 220); // light red
            } else {
                doc.setFillColor(240, 240, 240); // gray for not answered
            }
            doc.rect(
                margin,
                y - 12,
                pageWidth - margin * 2,
                rowHeight * maxLines,
                "F"
            );
            doc.setTextColor(0, 0, 0);
            doc.text(`${i + 1}`, colQ, y);
            doc.text(questionLines, colQuestion, y, {
                maxWidth: colYour - colQuestion - 10,
            });
            doc.text(
                doc.splitTextToSize(yourAns, colCorrect - colYour - 10),
                colYour,
                y,
                { maxWidth: colCorrect - colYour - 10 }
            );
            doc.text(
                doc.splitTextToSize(correctAns, colMarks - colCorrect - 10),
                colCorrect,
                y,
                { maxWidth: colMarks - colCorrect - 10 }
            );
            doc.text(markStr, colMarks, y);
            y += rowHeight * maxLines;
            // Draw border below row
            doc.setDrawColor(200);
            doc.line(margin, y - 12, pageWidth - margin, y - 12);
            // Page break if needed
            if (y > pageHeight - 80) {
                // Footer with page number
                const pageNum = doc.internal.pages.length;
                doc.setFontSize(10).setTextColor(120);
                doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 20, {
                    align: "center",
                });
                doc.addPage();
                y = 60;
                doc.setFontSize(12).setTextColor(0);
            }
        });
        y += 10;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;
        doc.setFont("helvetica", "bold");
        doc.text(`Total Marks: ${obtained} / ${total}`, margin, y);
        // Final footer with page number
        const finalPageNum = doc.internal.pages.length;
        doc.setFontSize(10).setTextColor(120);
        doc.text(`Page ${finalPageNum}`, pageWidth / 2, pageHeight - 20, {
            align: "center",
        });
        doc.save(`${testData.test_name}-Result.pdf`);
    };

    const start = (currentPage - 1) * questionsPerPage;
    const questions =
        testData?.questions.slice(start, start + questionsPerPage) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading test...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Error Loading Test
                    </h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (!testData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                        Test Not Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        The test you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <Button onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">
                        {testData.test_name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {testData.description}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <TimerReset size={20} />
                    <span className="font-medium">
                        {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                    </span>
                </div>
            </div>

            <form className="space-y-6">
                {timeLeft > 0 && !testSubmitted && (
                    <>
                        {questions.map((q, idx) => {
                            const qIndex = start + idx;
                            return (
                                <div
                                    key={q.id}
                                    className="border p-4 rounded-xl shadow-sm bg-background"
                                >
                                    <h4 className="font-medium mb-3">
                                        Q{qIndex + 1}: {q.question_text} (
                                        {q.marks} marks)
                                    </h4>
                                    {Object.entries(q.options).map(
                                        ([key, value]) => {
                                            const id = `q${qIndex}-${key}`;
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center space-x-2 mb-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        id={id}
                                                        name={`q${qIndex}`}
                                                        value={key}
                                                        checked={
                                                            answers[
                                                                `q${qIndex}`
                                                            ] === key
                                                        }
                                                        onChange={() =>
                                                            handleAnswerChange(
                                                                qIndex,
                                                                key
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={id}
                                                        className="cursor-pointer"
                                                    >
                                                        {value}
                                                    </label>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            );
                        })}

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((prev) => prev - 1)
                                    }
                                >
                                    ← Prev
                                </Button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        type="button"
                                        key={i}
                                        variant={
                                            i + 1 === currentPage
                                                ? "default"
                                                : "outline"
                                        }
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((prev) => prev + 1)
                                    }
                                >
                                    Next →
                                </Button>
                            </div>
                        )}

                        <Button
                            type="button"
                            className="mt-6"
                            onClick={() => {
                                handleSubmit();
                                setTimerStarted(false);
                            }}
                            disabled={testSubmitted || submitting}
                        >
                            Submit Test
                        </Button>
                    </>
                )}

                {/* Time's up message after auto-submit */}
                {timeLeft === 0 && !showResult && (
                    <p className="text-red-600 font-medium mt-4">
                        ⏰ Time's up! Your test has been auto-submitted.
                    </p>
                )}
            </form>

            <Sheet open={showResult} onOpenChange={setShowResult}>
                <SheetContent className="w-[400px]">
                    <SheetHeader className="text-center">
                        <SheetTitle className="text-xl font-semibold">
                            Result Summary
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-3rem)] px-2 py-4">
                        <div className="flex flex-col items-center gap-6 px-2 sm:px-4">
                            {testData?.questions.map((q, index) => {
                                const selected = answers[`q${index}`];
                                const correct = q.correct_answer;
                                const isCorrect = selected === correct;
                                const notAnswered = selected === undefined;

                                const bgColor = notAnswered
                                    ? "bg-muted/60 dark:bg-muted/30"
                                    : isCorrect
                                    ? "bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                                    : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100";

                                const icon = notAnswered
                                    ? "⚪"
                                    : isCorrect
                                    ? "✅"
                                    : "❌";

                                return (
                                    <div
                                        key={q.id}
                                        className={`w-full max-w-xl border rounded-2xl p-5 shadow-md ${bgColor}`}
                                    >
                                        <h4 className="text-lg font-semibold mb-4">
                                            Q{index + 1}: {q.question_text}
                                        </h4>

                                        <div className="space-y-3 text-sm sm:text-base">
                                            <div className="flex justify-between items-center">
                                                <span>
                                                    <span className="font-medium">
                                                        Your Answer:{" "}
                                                    </span>
                                                    <span
                                                        className={`${
                                                            notAnswered
                                                                ? "bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs dark:bg-gray-700 dark:text-gray-200"
                                                                : isCorrect
                                                                ? "text-green-700 dark:text-green-300"
                                                                : "text-red-700 dark:text-red-300"
                                                        }`}
                                                    >
                                                        {notAnswered
                                                            ? "Not Answered"
                                                            : q.options[
                                                                  selected as keyof typeof q.options
                                                              ]}
                                                    </span>
                                                </span>
                                                <span className="text-xl">
                                                    {icon}
                                                </span>
                                            </div>

                                            {/* Only show correct answer if incorrect or not answered */}
                                            {(!isCorrect || notAnswered) && (
                                                <div className="mt-1 text-xm sm:text-base flex items-center items-start gap-2">
                                                    <span className="text-blue-600 dark:text-blue-300 font-semibold whitespace-nowrap">
                                                        🎯 Correct Answer:
                                                    </span>
                                                    <span className="bg-blue-100 text-blue-800 text-sm dark:bg-blue-900/30 dark:text-blue-200 px-2 py-1 rounded-md break-words max-w-full sm:max-w-[75%]">
                                                        {
                                                            q.options[
                                                                correct as keyof typeof q.options
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            <div>
                                                <span className="font-medium">
                                                    Marks:{" "}
                                                </span>
                                                {isCorrect ? q.marks : 0}/
                                                {q.marks}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {testSubmitted && (
                <div className="flex justify-center mt-6">
                    <Button
                        onClick={downloadPDF}
                        className="shadow cursor-pointer"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download Result
                        PDF
                    </Button>
                </div>
            )}
        </div>
    );
}
