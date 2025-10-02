import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { QuestionForComp } from '@/types/test';
import { validateQuestions } from '@/lib/utils';

type JsonInputProps = {
  setJsonData: React.Dispatch<React.SetStateAction<QuestionForComp[]>>;
  totalQuestion: any;
};

export function JsonInput({ setJsonData, totalQuestion }: JsonInputProps) {
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
      const input = textRef.current?.value || '';
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) throw new Error('Invalid format');

      // Validate marks
      // for (let i = 0; i < parsed.length; i++) {
      //   const q = parsed[i];
      //   const questionText = q.question_text || `Question ${i + 1}`;

      //   if (typeof q.marks !== 'number') {
      //     toast.error(`"${questionText}" has invalid marks. Please enter a number.`);
      //     return;
      //   }

      //   if (q.marks < 1 || q.marks > 20) {
      //     toast.error(`"${questionText}" marks must be between 1 and 20.`);
      //     return;
      //   }
      // }

      const validateData = validateQuestions(parsed);

      if (!validateData.valid) {
        toast.error(`${validateData.error}`);
        return;
      }

      if (totalQuestion.concat(parsed).length > 50) {
        toast.error('Maximum only 50 questions allowed. Please remove some questions to add more.');
        return;
      }

      setJsonData((prev) => [...prev, ...parsed]);
      textRef.current!.value = ''; // ✅ Clear textarea
      toast.success('✅ Questions added successfully!');
    } catch {
      toast.error('❌ Invalid JSON format or missing data.');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="sm:text-lg font-semibold">
          Paste JSON Questions <span className="text-gray-500 text-sm">( max 50 )</span>
        </h3>
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

      {copyMsgVisible && <span className="text-green-400 text-sm">✅ Copied!</span>}

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
