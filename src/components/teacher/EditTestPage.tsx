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
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";

const optionKeys = ["a", "b", "c", "d"];

export default function EditTestPage() {
    const { state } = useLocation();
    const { testId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const questionsPerPage = 10;

    useEffect(() => {
        const loadTest = async () => {
            try {
                let testData = state?.test;

                if (!testData && testId) {
                    const docRef = doc(db, "tests", testId);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        testData = { id: snap.id, ...snap.data() };
                    } else {
                        toast.error("Test not found!");
                        return;
                    }
                }

                const questionsSnap = await getDocs(
                    collection(db, "tests", testData.id, "questions")
                );

                const formattedQuestions = questionsSnap.docs.map((doc) => {
                    const q = doc.data();
                    const optionsArray = optionKeys.map(
                        (key) => q.options?.[key] || ""
                    );

                    return {
                        question: q.questionText || "",
                        options: optionsArray,
                        correct: optionKeys.indexOf(q.correctAnswer || "a"),
                        marks: typeof q.marks === "number" ? q.marks : 1,
                    };
                });

                setTest({
                    id: testData.id,
                    testName: testData.testName || "",
                    description: testData.description || "",
                    durationMinutes: testData.durationMinutes || 30,
                    questions: formattedQuestions,
                });

                setLoading(false);
            } catch (err) {
                console.error("Error loading test:", err);
                toast.error("Failed to load test");
            }
        };

        if (state.test) {
            setTest(state.test);
            setLoading(false);
        } else {
            loadTest();
        }
    }, [testId, state?.test]);

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
        // console.log({index}, {field}, {value});
        // return

        const updatedQuestions = [...test.questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value,
        };
        setTest({ ...test, questions: updatedQuestions });
    };

    const handleOptionChange = (
        qIndex: number,
        optIndex: string,
        value: string
    ) => {
        // console.log({qIndex}, {optIndex}, {value});
        // return
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
            question: "New Question?",
            options: ["", "", "", ""],
            correct: 0,
            marks: 1,
        };
        setTest({ ...test, questions: [...test.questions, newQuestion] });
        setCurrentPage(Math.floor(test.questions.length / questionsPerPage));
    };

    const handleSave = async () => {
        let existingQuestionsData: any[] = []; // ✅ declare outside try to allow rollback

        try {
            const testRef = doc(db, "tests", test.id);
            const questionsRef = collection(testRef, "questions");

            // ✅ 1. Fetch & store all existing questions (for rollback if needed)
            const existingSnap = await getDocs(questionsRef);
            existingQuestionsData = existingSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // ✅ 2. Delete all current questions
            await Promise.all(
                existingSnap.docs.map((doc) => deleteDoc(doc.ref))
            );

            // ✅ 3. Update test metadata
            const updatedTotalMarks = test.questions.reduce(
                (acc: number, q: any) => acc + Number(q.marks || 0),
                0
            );

            await updateDoc(testRef, {
                testName: test.testName,
                description: test.description,
                durationMinutes: test.durationMinutes,
                totalMarks: updatedTotalMarks,
                updatedAt: new Date(),
            });

            // ✅ 4. Add updated questions
            for (const question of test.questions) {
                const qId = question.id || crypto.randomUUID();
                const qRef = doc(questionsRef, qId);

                await setDoc(qRef, {
                    questionText: question.questionText,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    marks: question.marks,
                    createdAt: question.createdAt || new Date(),
                    updatedAt: new Date(),
                });
            }

            toast.success("Test updated successfully");
        } catch (err) {
            console.error("❌ Error during test update:", err);
            toast.error("Something went wrong! Attempting rollback...");

            try {
                // ✅ Attempt rollback
                const testRef = doc(db, "tests", test.id);
                const questionsRef = collection(testRef, "questions");

                // Clear failed state
                const currentSnap = await getDocs(questionsRef);
                await Promise.all(
                    currentSnap.docs.map((doc) => deleteDoc(doc.ref))
                );

                // Restore previous questions
                for (const q of existingQuestionsData) {
                    const qRef = doc(questionsRef, q.id);
                    await setDoc(qRef, q);
                }

                toast.success(
                    "Rollback successful! Previous questions restored."
                );
            } catch (rollbackErr) {
                console.error("❌ Rollback failed:", rollbackErr);
                toast.error(
                    "Rollback failed! Please check test data manually."
                );
            }
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Test Name</label>
                        <input
                            type="text"
                            className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                            value={test.testName}
                            onChange={(e) =>
                                setTest({ ...test, testName: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Test Description
                        </label>
                        <textarea
                            rows={2}
                            className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                            value={test.description}
                            onChange={(e) =>
                                setTest({
                                    ...test,
                                    description: e.target.value,
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
                            value={test.durationMinutes}
                            onChange={(e) =>
                                setTest({
                                    ...test,
                                    durationMinutes: +e.target.value,
                                })
                            }
                        />
                    </div>

                    <ul className="space-y-6 mt-4">
                        {paginatedQuestions.map((q, qIndex) => (
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
                                            handleDeleteQuestion(qIndex + start)
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
                                    value={q.questionText}
                                    onChange={(e) =>
                                        handleInputChange(
                                            qIndex + start,
                                            "questionText",
                                            e.target.value
                                        )
                                    }
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(q.options).map(
                                        ([key, value], optIndex) => {
                                            return (
                                                <input
                                                    key={key}
                                                    type="text"
                                                    className="rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                                    value={value}
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            qIndex + start,
                                                            key,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={`Option ${optionKeys[
                                                        optIndex
                                                    ].toUpperCase()}`}
                                                />
                                            );
                                        }
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <label className="text-sm font-medium">
                                            Correct Answer (Index 0–3)
                                        </label>
                                        <input
                                            type="string"
                                            className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                                            value={q.options[q.correctAnswer]}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    qIndex + start,
                                                    "correctAnswer",
                                                    e.target.value
                                                )
                                            }
                                        />
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
                        ))}
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
