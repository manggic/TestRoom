import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card } from "@/components/ui/card";
import {
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn, errorHandler, formatDate } from "@/lib/utils";
import { getAttemptsListing } from "@/services/testAttemptService";

import type { TestAttemptWithJoins } from "@/types/testAttempts";

const ITEMS_PER_PAGE = 10;

// const formatDateTime = (iso: string) =>
//     new Date(iso).toLocaleString(undefined, {
//         dateStyle: "medium",
//         timeStyle: "short",
//     });

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
    const [attempts, setAttempts] = useState<TestAttemptWithJoins[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const totalPages = Math.ceil(attempts.length / ITEMS_PER_PAGE);
    const paginatedAttempts = attempts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        async function callTestAttempts() {
            if (!testId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await getAttemptsListing(testId);

                if (response.success) {
                    setAttempts(response.data);
                }
            } catch (error) {
                errorHandler(error);
            } finally {
                setLoading(false);
            }
        }

        callTestAttempts();
    }, [testId]);

    return (
        <div className="p-3 sm:p-6 max-w-5xl mx-auto">
            <div className="mb-6 text-center">
                <h1 className="text-lg sm:text-2xl font-semibold flex items-center justify-center gap-2">
                    🧾 Attempts for{" "}
                    <span className="text-primary truncate max-w-[180px] sm:max-w-none">
                        {attempts?.[0]?.tests?.test_name}
                    </span>
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
                    <div className="hidden sm:grid text-sm grid-cols-6 font-semibold text-muted-foreground px-2">
                        <div>Student</div>
                        <div>Score</div>
                        <div>Correct</div>
                        <div>Time</div>
                        <div>Attempted On</div>
                        <div>Actions</div>
                    </div>

                    {/* Rows */}
                    {paginatedAttempts.map((attempt) => {
                        const total_marks = attempt?.tests?.total_marks;
                        const percentage = total_marks
                            ? Math.round(
                                  (attempt.score_achieved / total_marks) * 100
                              )
                            : 0;
                        const badgeVariant:
                            | "default"
                            | "destructive"
                            | "secondary" =
                            percentage >= 80
                                ? "default" // 👍 green-like neutral
                                : percentage >= 60
                                ? "secondary" // ⚠️ neutral gray
                                : "destructive"; // ❌ red

                        return (
                            <Card
                                key={attempt.id}
                                className="p-4 rounded-lg shadow-sm"
                            >
                                {/* Mobile view (visible only on mobile) */}
                                <div className="sm:hidden space-y-2 text-sm">
                                    <div>
                                        <strong>Student:</strong>{" "}
                                        {attempt.users?.name ||
                                            `ID: ${attempt.student_id}`}
                                    </div>
                                    <div>
                                        <strong>Score:</strong>{" "}
                                        <span
                                            className={cn(
                                                getScoreColor(
                                                    attempt.score_achieved,
                                                    total_marks
                                                )
                                            )}
                                        >
                                            {attempt.score_achieved}/
                                            {total_marks}
                                        </span>{" "}
                                        <Badge
                                            variant={badgeVariant}
                                            className="ml-2 text-xs font-semibold"
                                        >
                                            {percentage}%
                                        </Badge>
                                    </div>
                                    <div>
                                        <strong>Correct:</strong>{" "}
                                        {attempt.correct_answer_count}/
                                        {attempt.total_questions}
                                    </div>
                                    <div>
                                        <strong>Time Taken:</strong>{" "}
                                        {formatDuration(
                                            attempt.time_taken_seconds
                                        )}
                                    </div>
                                    <div>
                                        <strong>Attempted On:</strong>{" "}
                                        {formatDate(attempt.created_at)}
                                    </div>
                                    <div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                                navigate(
                                                    `/student/result/${attempt.id}`
                                                )
                                            }
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Result
                                        </Button>
                                    </div>
                                </div>

                                {/* Desktop view (hidden on mobile) */}
                                <div className="hidden sm:grid grid-cols-6 gap-3 sm:gap-4 items-center text-sm">
                                    <div className="font-medium">
                                        {attempt.users?.name ||
                                            `Student ID: ${attempt.student_id}`}
                                    </div>
                                    <div className="font-medium flex items-center justify-center gap-2">
                                        <span
                                            className={cn(
                                                getScoreColor(
                                                    attempt.score_achieved,
                                                    total_marks
                                                )
                                            )}
                                        >
                                            {attempt.score_achieved}/
                                            {total_marks}
                                        </span>
                                        <Badge
                                            variant={badgeVariant}
                                            className="text-xs font-semibold"
                                        >
                                            {percentage}%
                                        </Badge>
                                    </div>
                                    <div className="font-medium">
                                        {attempt.correct_answer_count}/
                                        {attempt.total_questions}
                                    </div>
                                    <div className="font-medium">
                                        {formatDuration(
                                            attempt.time_taken_seconds
                                        )}
                                    </div>
                                    <div className="font-medium text-right">
                                        {formatDate(attempt.created_at)}
                                    </div>
                                    <div className="flex justify-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                navigate(
                                                    `/student/result/${attempt.id}`
                                                )
                                            }
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center mt-6 gap-3 text-sm">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Prev
                    </Button>
                    <span className="text-muted-foreground">
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
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
