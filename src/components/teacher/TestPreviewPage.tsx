// src/pages/TestPreviewPage.tsx
import { useNavigate, useLocation, useParams } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import { ArrowLeft, FileText, Timer, User, Calendar } from "lucide-react";

export default function TestPreviewPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { testId } = useParams();
    const [test, setTest] = useState<any>(state?.test || null);
    const [loading, setLoading] = useState(!state?.test);

    const {
        testName,
        durationMinutes,
        totalMarks,
        status,
        createdBy,
        questions,
    } = test || {};


    useEffect(() => {
        if (!test && testId) {
            const fetchTest = async () => {
                setLoading(true);
                const docRef = doc(db, "tests", testId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTest({ id: docSnap.id, ...docSnap.data() });
                }
                setLoading(false);
            };
            fetchTest();
        }
    }, [test, testId]);

    if (loading) return <div className="p-6 text-center">Loading test...</div>;
    if (!test)
        return (
            <div className="p-6 text-center text-red-500">Test not found.</div>
        );

    return (
        <div className="min-h-screen max-h-screen overflow-y-auto p-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} /> Back
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {testName}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Timer size={16} /> Duration: {durationMinutes} mins
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText size={16} /> Total Marks: {totalMarks}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} /> Created By:{" "}
                            {createdBy?.name || "You"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} /> Status: {status || "Draft"}
                        </div>
                    </div>

                    {/* Questions */}
                    <ul className="space-y-6 mt-4">
                        {questions?.map((q: any, idx: number) => (
                            <li
                                key={idx}
                                className="p-4 rounded-md border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 space-y-4"
                            >
                                <div>
                                    <p className="font-medium mb-2">
                                        Q{idx + 1}. {q.questionText}{" "}
                                        <span className="text-xs text-gray-500">
                                            ({q.marks || 1} marks)
                                        </span>
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {["a", "b", "c", "d"].map((key) => {
                                            const isCorrect =
                                                q.correctAnswer === key;
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
                                                    {q.options[key]}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✅ Correct Answer:{" "}
                                    <span className="inline-block bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded">
                                        {q.correctAnswer?.toUpperCase()}
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
