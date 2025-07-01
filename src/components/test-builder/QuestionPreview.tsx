import { Trash } from "lucide-react";

export function QuestionPreview({ questions = [], onDelete }: any) {
    if (!questions?.length) return null;

    return (
        <div className="bg-slate-50 dark:bg-zinc-700 rounded-md p-4 border border-gray-300 dark:border-zinc-600">
            <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                📋 Preview of Questions
            </h3>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                {questions.map((q, idx) => (
                    <div
                        key={idx}
                        className="relative p-3 rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600"
                    >
                        <p className="font-medium">
                            Q{idx + 1}: {q.questionText}
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
