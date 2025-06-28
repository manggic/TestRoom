import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, TimerReset, X } from "lucide-react";
import jsPDF from "jspdf";

interface Question {
    question: string;
    options: string[];
    correct: number;
    marks: number;
}

interface TestData {
    duration: number;
    questions: Question[];
}

export default function TestPaper() {
    const [testData, setTestData] = useState<TestData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerStarted, setTimerStarted] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);

    const questionsPerPage = 10;
    const totalPages = testData
        ? Math.ceil(testData.questions.length / questionsPerPage)
        : 1;

    useEffect(() => {
        fetch("https://pass-json-default-rtdb.firebaseio.com/data.json")
            .then((res) => res.json())
            .then((data: TestData) => {
                setTestData(data);
                setTimeLeft(data.duration * 3);
                setTimerStarted(true); // Add this
            });
    }, []);

    useEffect(() => {
        if (timerStarted && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (timerStarted && timeLeft <= 0) {
            handleSubmit();
            setTimerStarted(false); // ✅ prevents repeated submission
        }
    }, [timeLeft, timerStarted]);

    const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
        setAnswers({ ...answers, ["q" + questionIndex]: optionIndex });
    };

    const handleSubmit = () => {
        setShowResult(true);
        setTestSubmitted(true);
    };

    const downloadPDF = () => {
        if (!testData) return;
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageHeight = doc.internal.pageSize.height;
        const margin = 40;
        let y = 60;
        let total = 0,
            obtained = 0;

        doc.setFontSize(18).text("🧪 Computer Science Test Summary", margin, y);
        y += 30;
        doc.setFontSize(12);

        testData.questions.forEach((q, i) => {
            const selected = answers["q" + i];
            const correct = q.correct;
            const marks = selected === correct ? q.marks : 0;
            total += q.marks;
            obtained += marks;

            doc.text(`${i + 1}. ${q.question}`, margin, y);
            y += 18;

            q.options.forEach((opt, idx) => {
                let label = `${String.fromCharCode(65 + idx)}. ${opt}`;
                if (idx === correct) label += " ✅";
                if (idx === selected && idx !== correct) label += " ❌";
                doc.text(label, margin + 20, y);
                y += 16;
            });

            doc.text(
                `Your Answer: ${q.options[selected] || "Not Answered"}`.trim(),
                margin + 20,
                y
            );
            y += 16;
            doc.text(
                `Correct Answer: ${q.options[correct]}`.trim(),
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
        doc.save("Computer-Science-Test-Summary.pdf");
    };

    const start = (currentPage - 1) * questionsPerPage;
    const questions =
        testData?.questions.slice(start, start + questionsPerPage) || [];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                    Computer Science MCQ Test
                </h2>
                <div className="flex gap-3 items-center">
                    <TimerReset size={20} />
                    <span className="font-medium">
                        {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                    </span>
                </div>
            </div>

            <form className="space-y-6">
                {timeLeft > 0 && (
                    <>
                        {questions.map((q, idx) => {
                            const qIndex = start + idx;
                            return (
                                <div
                                    key={qIndex}
                                    className="border p-4 rounded-xl shadow-sm bg-background"
                                >
                                    <h4 className="font-medium mb-3">
                                        Q{qIndex + 1}: {q.question} ({q.marks}{" "}
                                        marks)
                                    </h4>
                                    {q.options.map((opt, optIdx) => {
                                        const id = `q${qIndex}-opt${optIdx}`;
                                        return (
                                            <div
                                                key={id}
                                                className="flex items-center space-x-2 mb-2"
                                            >
                                                <input
                                                    type="radio"
                                                    id={id}
                                                    name={`q${qIndex}`}
                                                    value={optIdx}
                                                    checked={
                                                        answers[
                                                            `q${qIndex}`
                                                        ] === optIdx
                                                    }
                                                    onChange={() =>
                                                        handleAnswerChange(
                                                            qIndex,
                                                            optIdx
                                                        )
                                                    }
                                                />
                                                <label
                                                    htmlFor={id}
                                                    className="cursor-pointer"
                                                >
                                                    {opt}
                                                </label>
                                            </div>
                                        );
                                    })}
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
                        >
                            Submit Test
                        </Button>
                    </>
                )}

                {/* Time's up message after auto-submit */}
                {timeLeft === 0 && !showResult && (
                    <p className="text-red-600 font-medium mt-4">
                        ⏰ Time’s up! Your test has been auto-submitted.
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
                                const selected = answers["q" + index];
                                const correct = q.correct;
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
                                        key={index}
                                        className={`w-full max-w-xl border rounded-2xl p-5 shadow-md ${bgColor}`}
                                    >
                                        <h4 className="text-lg font-semibold mb-4">
                                            Q{index + 1}: {q.question}
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
                                                                  selected
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
                                                        {q.options[correct]}
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
                <div className="flex  justify-center mt-6">
                    <Button
                        onClick={downloadPDF}
                        className="shadow cursor-pointer"
                    >
                        <Download className="mr-2 h-4 w-4 " /> Download Result
                        PDF
                    </Button>
                </div>
            )}
        </div>
    );
}
