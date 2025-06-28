// src/components/test-builder/QuestionPreview.tsx
import { useEffect, useState } from "react";

export function QuestionPreview() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const form = JSON.parse(localStorage.getItem("mcq_form") || "[]");
    const json = JSON.parse(localStorage.getItem("mcq_json") || "[]");
    setQuestions([...form, ...json]);
  }, []);

  if (!questions.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mt-6 mb-2">Questions Preview:</h3>
      <ul className="list-decimal pl-6 space-y-1 text-sm">
        {questions.map((q, idx) => (
          <li key={idx}>
            Q{idx + 1}: {q.question} ({q.marks} marks)
          </li>
        ))}
      </ul>
    </div>
  );
}
