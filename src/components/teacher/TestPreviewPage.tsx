// src/pages/TestPreviewPage.tsx
import { useLocation, useParams } from "react-router";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import type { Test, Question, OptionKey } from "@/types/test";

import { FileText, Timer, User, Calendar, CalendarFold } from "lucide-react";
import { getTestById } from "@/services/testService";
import { errorHandler, formatDate } from "@/lib/utils";
import { BackButton } from "../BackButton";

export default function TestPreviewPage() {
    const { state } = useLocation();
    const { testId } = useParams();
    const { currentUser } = useAuth();
    const [test, setTest] = useState<Test>(state?.test || null);

    const [loading, setLoading] = useState(!state?.test);

    useEffect(() => {
        async function testData() {
            if (!testId) return; // ✅ TypeScript now knows testId is string below
            try {
                const response = await getTestById({ testId });

                if (response.success) {
                    setTest(response.data);
                }
            } catch (error) {
                errorHandler(error);
            } finally {
                setLoading(false);
            }
        }

        if (!state?.test && testId) {
            testData();
        }
    }, [state, testId, currentUser]);

    if (loading) return <div className="p-6 text-center">Loading test...</div>;
    if (!test)
        return (
            <div className="p-6 text-center text-red-500">Test not found.</div>
        );

    return (
        <div className="min-h-screen max-h-screen px-4 py-10 overflow-y-auto   bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="max-w-5xl mx-auto space-y-6">
                <BackButton />

                {/* Card Wrapper */}
                <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {test?.test_name}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Timer size={20} /> Duration:{" "}
                            {test?.duration_minutes} mins
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText size={20} /> Total Marks:{" "}
                            {test?.total_marks}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={20} /> Created By:{" "}
                            {test?.createdByName || "Unknown"}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarFold size={20} /> Created At:{" "}
                            {formatDate(test?.created_at) || "Unknown"}
                        </div>
                        {test.updatedByName &&
                            test.updatedByName !== test?.createdByName && (
                                <div className="flex items-center gap-2">
                                    <User size={20} /> Last Updated By:{" "}
                                    {test.updatedByName}
                                </div>
                            )}
                        <div className="flex items-center gap-2">
                            <Calendar size={20} /> Status:{" "}
                            {test.status || "draft"}
                        </div>
                    </div>

                    {/* Questions */}
                    <ul className="space-y-6 mt-4">
                        {test?.questions?.map((q: Question, idx: number) => (
                            <li
                                key={idx}
                                className="p-4 rounded-md border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 space-y-4"
                            >
                                <div>
                                    <p className="font-medium mb-2">
                                        Q{idx + 1}. {q.question_text}{" "}
                                        <span className="text-xs text-gray-500">
                                            ({q.marks || 1} marks)
                                        </span>
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(["a", "b", "c", "d"] as const).map(
                                            (key: OptionKey) => {
                                                const isCorrect =
                                                    q.correct_answer === key;
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`px-4 py-2 rounded-md border ${
                                                            isCorrect
                                                                ? "border-green-500 bg-green-50 dark:bg-green-900"
                                                                : "border-gray-300 dark:border-zinc-600"
                                                        } text-sm break-words text-gray-800 dark:text-gray-100`}
                                                    >
                                                        <strong className="mr-1">
                                                            {key.toUpperCase()}.
                                                        </strong>{" "}
                                                        {q.options?.[key] || (
                                                            <span className="text-red-400 italic">
                                                                Missing option
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✅ Correct Answer:{" "}
                                    <span className="inline-block bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded">
                                        {q.correct_answer?.toUpperCase()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}
