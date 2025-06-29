// src/components/test-builder/QuestionPreview.tsx
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function QuestionPreview() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const form = JSON.parse(localStorage.getItem("mcq_form") || "[]");
    const json = JSON.parse(localStorage.getItem("mcq_json") || "[]");
    setQuestions([...form, ...json]);
  }, []);

  if (!questions.length) return null;

  return (
    <div className="bg-slate-50 dark:bg-zinc-700 rounded-md p-4 border border-gray-300 dark:border-zinc-600">
      <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
        📋 Preview of Questions
      </h3>
      <ScrollArea className="max-h-72 pr-2">
        <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-200">
          {questions.map((q, idx) => (
            <li
              key={idx}
              className="p-3 rounded-md bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600"
            >
              <p className="font-medium">
                Q{idx + 1}: {q.question}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Marks: {q.marks}
              </p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
