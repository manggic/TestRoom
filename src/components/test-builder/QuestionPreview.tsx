import { Trash } from "lucide-react";

import type { QuestionForComp } from "@/types/test"; // adjust import path if needed

type QuestionPreviewProps = {
    questions: QuestionForComp[];
    onDelete?: (index: number) => void;
};

export function QuestionPreview({
    questions = [],
    onDelete,
}: QuestionPreviewProps) {
    if (!questions?.length) return null;

    return (
        <div className="bg-slate-50 dark:bg-zinc-700 rounded-md p-4 border border-gray-300 dark:border-zinc-600">
            <h3 className="sm:text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                📋 Preview of Questions
            </h3>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                {questions.map((q, idx) => (
                    <div
                        key={idx}
                        className="relative rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 pt-[40px] sm:p-3 p-3"
                    >
                        <p className="font-medium">
                            Q{idx + 1}: {q.question_text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Marks: {q.marks}
                        </p>

                        {onDelete && (
                            <button
                                onClick={() => onDelete(idx)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                title="Delete question"
                            >
                                <Trash size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
