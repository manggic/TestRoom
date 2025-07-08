import { useState } from "react";
import { FormInput } from "./test-builder/FormInput";
import { QuestionPreview } from "./test-builder/QuestionPreview";
import { Controls } from "./test-builder/Controls";
import { JsonInput } from "./test-builder/JsonInput";
import { BackButton } from "./BackButton";
import { toast } from "sonner";
import { createTest } from "@/lib/apiCalls/tests";
import { useAuth } from "@/context/useAuth";
import { errorHandler } from "@/lib/utils";

export default function CreateTest() {
    const { currentUser } = useAuth();


    const [testName, setTestName] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number | undefined>(
        undefined
    );
    // const [description, setDescription] = useState("");

    const [jsonData, setJsonData] = useState([]);
    const [formData, setFormData] = useState([]);

    const [useJSON, setUseJSON] = useState(true);

    const handleSave = async (status: "draft" | "published") => {
        try {
            if (!testName) return toast.error("Please enter test name");
            if (!durationMinutes) return toast.error("Please enter duration");
            if (jsonData.length === 0 && formData.length === 0)
                return toast.error("Please add questions");

            const questions = [...jsonData, ...formData].map((q) => ({
                question_text: q.questionText,
                options: q.options,
                correct_answer: q.correctAnswer,
                marks: q.marks,
            }));

            if (!currentUser?.user?.id) {
                return toast.error("User is not logged in");
            }

            const response = await createTest({
                test_name: testName,
                duration_minutes: durationMinutes,
                questions,
                created_by: currentUser.user.id,
                status: status.toLowerCase(),
            });

            if (response.success) {
                toast.success(`✅ Test saved as ${status}`);
            } else {
                toast('Create Test Failed');
            }
        } catch (error) {
            toast(errorHandler(error).message);
        }
    };

    return (
        <div className="min-h-screen px-4 py-10 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button + Header */}
                <div className="flex items-center justify-between">
                    <BackButton />
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-6 space-y-6 border border-gray-200 dark:border-zinc-700">
                    {/* Title */}
                    <div className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-zinc-700">
                        <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                            📝 Create New MCQ Test
                        </h2>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="test-name-input"
                                className="block text-sm font-medium mb-1"
                            >
                                Test Name
                            </label>
                            <input
                                type="text"
                                id="test-name-input"
                                className="w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Science Test"
                                value={testName}
                                required
                                onChange={(e) => setTestName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="duration"
                                className="block text-sm font-medium mb-1"
                            >
                                Total Test Time (minutes)
                            </label>
                            <input
                                type="number"
                                id="duration"
                                className="w-full border border-gray-300 dark:border-zinc-600 rounded-md px-3 py-2 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. 10"
                                required
                                value={durationMinutes}
                                onChange={(e) =>
                                    setDurationMinutes(parseInt(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-4 pt-2">
                        <span className="text-sm font-medium">JSON Mode</span>
                        <button
                            type="button"
                            onClick={() => setUseJSON((prev) => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                useJSON ? "bg-gray-400" : "bg-blue-600"
                            }`}
                            role="switch"
                            aria-checked={!useJSON}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    useJSON ? "translate-x-1" : "translate-x-6"
                                }`}
                            />
                        </button>
                        <span className="text-sm font-medium">Form Mode</span>
                    </div>

                    {/* Input Mode (JSON or Form) */}
                    <div className="pt-2">
                        {useJSON ? (
                            <JsonInput setJsonData={setJsonData} />
                        ) : (
                            <FormInput setFormData={setFormData} />
                        )}
                    </div>

                    {/* Preview */}
                    {/* Preview */}
                    <div className="pt-2">
                        <QuestionPreview
                            questions={[...jsonData, ...formData]}
                            onDelete={(indexToDelete) => {
                                const total = [...jsonData, ...formData];
                                const fromJson =
                                    indexToDelete < jsonData.length;
                                if (fromJson) {
                                    const updated = jsonData.filter(
                                        (_, idx) => idx !== indexToDelete
                                    );
                                    setJsonData(updated);
                                } else {
                                    const offset =
                                        indexToDelete - jsonData.length;
                                    const updated = formData.filter(
                                        (_, idx) => idx !== offset
                                    );
                                    setFormData(updated);
                                }
                                toast.success("🗑️ Question deleted.");
                            }}
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 border-t border-gray-200 dark:border-zinc-700">
                        <Controls handleSave={handleSave} />
                    </div>
                </div>
            </div>
        </div>
    );
}
