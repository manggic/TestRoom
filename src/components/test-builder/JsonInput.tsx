import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function JsonInput() {
  const [copyMsgVisible, setCopyMsgVisible] = useState(false);

  const handleCopySample = () => {
    const sample = `[
  {
    "question": "What does CPU stand for?",
    "options": [
      "Central Process Unit",
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Processor Utility"
    ],
    "correct": 1,
    "marks": 2
  }
]`;
    navigator.clipboard.writeText(sample).then(() => {
      setCopyMsgVisible(true);
      setTimeout(() => setCopyMsgVisible(false), 2000);
    });
  };

  const addQuestions = () => {
    const input = (document.getElementById("jsonInput") as HTMLTextAreaElement)
      .value;
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      localStorage.setItem("mcq_json", JSON.stringify(parsed));
      alert("✅ Questions added successfully!");
    } catch {
      alert("❌ Invalid JSON format or missing data.");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Paste JSON Questions</h3>
        <button
          onClick={handleCopySample}
          className="text-blue-400 text-sm hover:underline cursor-pointer"
          title="Copy sample JSON"
        >
          📋 Copy Sample JSON
        </button>
      </div>

      <textarea
        id="jsonInput"
        rows={8}
        className="mt-2 w-full border rounded-md px-3 py-2 font-mono bg-white dark:bg-zinc-700"
        placeholder={`[\n  {\n    "question": "What does CPU stand for?",\n    "options": [...],\n    "correct": 1,\n    "marks": 2\n  }\n]`}
      ></textarea>

      {copyMsgVisible && (
        <span className="text-green-400 text-sm">✅ Copied!</span>
      )}

      <div className="mt-4">
        <Button
          onClick={addQuestions}
          className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white gap-2"
        >
          <Plus size={16} />
          Add JSON Questions
        </Button>
      </div>
    </div>
  );
}
