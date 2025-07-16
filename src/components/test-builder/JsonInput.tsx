import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { QuestionForComp } from "@/types/test";

type JsonInputProps = {
    setJsonData: React.Dispatch<React.SetStateAction<QuestionForComp[]>>;
};

export function JsonInput({ setJsonData }: JsonInputProps) {
    const [copyMsgVisible, setCopyMsgVisible] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);

    const handleCopySample = () => {
        const sample = `[
  {
    "question_text": "What does CPU stand for?",
    "options": {
      "a": "Central Process Unit",
      "b": "Central Processing Unit",
      "c": "Computer Personal Unit",
      "d": "Central Processor Utility"
    },
    "correct_answer": "b",
    "marks": 2
  }
]`;
        navigator.clipboard.writeText(sample).then(() => {
            setCopyMsgVisible(true);
            setTimeout(() => setCopyMsgVisible(false), 2000);
        });
    };

    const addQuestions = () => {
        try {
            const input = textRef.current?.value || "";
            const parsed = JSON.parse(input);
            if (!Array.isArray(parsed)) throw new Error("Invalid format");

            setJsonData((prev) => [...prev, ...parsed]);
            textRef.current!.value = ""; // ✅ Clear textarea
            toast.success("✅ Questions added successfully!");
        } catch {
            toast.error("❌ Invalid JSON format or missing data.");
        }
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center">
                <h3 className="sm:text-lg font-semibold">Paste JSON Questions</h3>
                <button
                    onClick={handleCopySample}
                    className="text-blue-400 text-sm hover:underline cursor-pointer"
                    title="Copy sample JSON"
                >
                    📋 Copy Sample JSON
                </button>
            </div>

            <textarea
                ref={textRef}
                id="jsonInput"
                rows={8}
                className="mt-2 w-full border rounded-md px-3 py-2 font-mono bg-white dark:bg-zinc-700"
                placeholder="Paste array of questions in JSON format..."
            ></textarea>

            {copyMsgVisible && (
                <span className="text-green-400 text-sm">✅ Copied!</span>
            )}

            <div className="mt-4">
                <Button
                    onClick={addQuestions}
                    className="bg-zinc-900 cursor-pointer hover:bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white gap-2"
                >
                    <Plus size={16} />
                    Add JSON Questions
                </Button>
            </div>
        </div>
    );
}
