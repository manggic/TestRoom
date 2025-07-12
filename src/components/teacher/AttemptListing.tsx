import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { getTestAttemptsByTestId, getTestById } from "@/lib/apiCalls/tests";

import { cn } from "@/lib/utils";
import { getTestById } from "@/services/testService";
import { getTestAttemptsByTestId } from "@/services/testAttemptService";



const ITEMS_PER_PAGE = 10;

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

const getScoreColor = (score: number, total: number) => {
    if (total === 0) return "text-muted";
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-500";
};

export default function AttemptListing() {
    const { testId } = useParams<{ testId: string }>();
    const [testName, setTestName] = useState("");
    const [totalMarks, setTotalMarks] = useState(0);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate()

    const totalPages = Math.ceil(attempts.length / ITEMS_PER_PAGE);
    const paginatedAttempts = attempts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        if (!testId) return;

        setLoading(true);
        setError(null);

        Promise.all([getTestAttemptsByTestId(testId), getTestById(testId)])
            .then(([attemptRes, testRes]) => {
                if (attemptRes.error || testRes.error) {
                    throw new Error("Failed to fetch attempts or test data.");
                }               

                setAttempts(attemptRes.data || []);
                setTestName(testRes.data?.test_name || "Untitled Test");
                setTotalMarks(testRes.data?.total_marks || 0);
            })
            .catch((err: any) => setError(err.message))
            .finally(() => setLoading(false));
    }, [testId]);

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <div className="mb-6 text-center">
                <h1 className="text-xl md:text-2xl font-semibold flex items-center justify-center gap-2">
                    🧾 Attempts for{" "}
                    <span className="text-primary">{testName}</span>
                </h1>
            </div>

            {loading && (
                <div className="flex justify-center items-center gap-2 text-muted-foreground py-8">
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Loading attempts...</span>
                </div>
            )}

            {error && (
                <div className="flex justify-center items-center gap-2 text-red-500 py-8">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && attempts.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    No attempts found for this test yet.
                </p>
            )}

            {!loading && !error && paginatedAttempts.length > 0 && (
                <div className="space-y-2">
                    {/* Header row */}
                    <div className="hidden sm:grid text-md grid-cols-6  font-semibold text-muted-foreground px-2">
                        <div>Student</div>
                        <div>Score</div>
                        <div>Correct Answer</div>
                        <div>Time Taken</div>
                        <div className="">Attempted On</div>
                        <div className="">Actions</div>
                    </div>

                    {/* Rows */}
                    {paginatedAttempts.map((attempt) => {
                        const attemptedQuestions = attempt.answers
                            ? Object.keys(attempt.answers).length
                            : 0;
                        const percentage = totalMarks
                            ? Math.round(
                                  (attempt.score_achieved / totalMarks) * 100
                              )
                            : 0;
                        const badgeVariant =
                            percentage >= 80
                                ? "success"
                                : percentage >= 60
                                ? "warning"
                                : "destructive";


                                const correctAnswers = attempt.tests.questions.filter((q, i) => 
        attempt.answers[`q${i}`] === q.correct_answer
    ).length;
                        return (
                            <Card
                                key={attempt.id}
                                className="p-4 rounded-lg shadow-sm"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-4 items-center text-sm">
                                    <div className="font-medium">
                                        {attempt.users?.name ||
                                            `Student ID: ${attempt.student_id}`}
                                    </div>
                                    <div className="font-medium flex items-center justify-center gap-2">
                                        <span
                                            className={cn(
                                                getScoreColor(
                                                    attempt.score_achieved,
                                                    totalMarks
                                                )
                                            )}
                                        >
                                            {attempt.score_achieved}/
                                            {totalMarks}
                                        </span>
                                        <Badge
                                            variant={badgeVariant}
                                            className="text-xs font-semibold"
                                        >
                                            {percentage}%
                                        </Badge>
                                    </div>
                                    <div className="font-medium">
                                        {correctAnswers}/
                                        {attempt.total_questions}
                                    </div>
                                    <div className="font-medium">
                                        {formatDuration(
                                            attempt.time_taken_seconds
                                        )}
                                    </div>
                                    <div className="font-medium text-right">
                                        {formatDateTime(attempt.created_at)}
                                    </div>
                                    <button onClick={()=> navigate(`/student/result/${attempt.id}`)}  className="flex justify-center">
                                      <Eye />
                                    </button>
                                    
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
