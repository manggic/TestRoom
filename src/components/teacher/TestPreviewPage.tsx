// src/pages/TestPreviewPage.tsx
import { useNavigate, useLocation, useParams } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabaseClient } from '@/supabase/config';
import { useAuth } from "@/context/useAuth";

import { ArrowLeft, FileText, Timer, User, Calendar } from "lucide-react";

export default function TestPreviewPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { testId } = useParams();
    const { currentUser } = useAuth();
    const [test, setTest] = useState<any>(state?.test || null);
    const [questions, setQuestions] = useState<any[]>(state?.test?.questions || []);
    const [creatorName, setCreatorName] = useState<string>("");
    const [lastUpdatedByName, setLastUpdatedByName] = useState<string>("");
    const [loading, setLoading] = useState(!state?.test);

    useEffect(() => {
        const fetchTestAndQuestions = async () => {
            setLoading(true);
            // Fetch test from Supabase
            const { data: testData, error: testError } = await supabaseClient
                .from('tests')
                .select('*')
                .eq('id', testId)
                .single();
            if (testError || !testData) {
                setTest(null);
                setLoading(false);
                return;
            }
            setTest(testData);
            // Fetch questions for this test
            const { data: questionsData, error: questionsError } = await supabaseClient
                .from('questions')
                .select('*')
                .eq('test_id', testId);
            setQuestions(questionsData || []);
            // Fetch creator name
            if (testData.created_by) {
                if (currentUser?.user?.id === testData.created_by) {
                    setCreatorName("You");
                } else {
                    const { data: userData, error: userError } = await supabaseClient
                        .from('users')
                        .select('name')
                        .eq('id', testData.created_by)
                        .single();
                    setCreatorName(userData?.name || testData.created_by);
                }
            }
            // Fetch last updated by name
            if (testData.last_updated_by) {
                if (currentUser?.user?.id === testData.last_updated_by) {
                    setLastUpdatedByName("You");
                } else {
                    const { data: userData, error: userError } = await supabaseClient
                        .from('users')
                        .select('name')
                        .eq('id', testData.last_updated_by)
                        .single();
                    setLastUpdatedByName(userData?.name || testData.last_updated_by);
                }
            } else {
                setLastUpdatedByName("");
            }
            setLoading(false);
        };
        if (!state?.test && testId) {
            fetchTestAndQuestions();
        } else if (state?.test) {            
            setTest(state.test);
            setQuestions(state.test.questions || []);
            if (currentUser?.user?.id === (state.test.created_by || state.test.createdBy?.id)) {
                setCreatorName("You");
            } else {
                setCreatorName(state.test.createdByName || state.test.created_by || "");
            }
            if (state.test.last_updated_by) {
                if (currentUser?.user?.id === state.test.last_updated_by) {
                    setLastUpdatedByName("You");
                } else {
                    setLastUpdatedByName(state.test.lastUpdatedByName || state.test.last_updated_by || "");
                }
            } else {
                setLastUpdatedByName("");
            }
            setLoading(false);
        }
    }, [state, testId, currentUser]);

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
                        <ArrowLeft size={20} /> Back
                    </Button>
                </div>

                {/* Card Wrapper */}
                <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {test.test_name}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Timer size={20} /> Duration: {test.duration_minutes} mins
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText size={20} /> Total Marks: {test.total_marks}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={20} /> Created By: {creatorName || "Unknown"}
                        </div>
                        {lastUpdatedByName && lastUpdatedByName !== creatorName && (
                          <div className="flex items-center gap-2">
                            <User size={20} /> Last Updated By: {lastUpdatedByName}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={20} /> Status: {test.status || "draft"}
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
                                        Q{idx + 1}. {q.question_text} {" "}
                                        <span className="text-xs text-gray-500">
                                            ({q.marks || 1} marks)
                                        </span>
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {["a", "b", "c", "d"].map((key) => {
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
                                                    {q.options[key]}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                    ✅ Correct Answer: {" "}
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
