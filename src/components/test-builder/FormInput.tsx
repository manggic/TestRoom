// src/components/test-builder/FormInput.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { QuestionForComp } from "@/types/test";
import { toast } from "sonner";
type FormInputProps = {
    setFormData: React.Dispatch<React.SetStateAction<QuestionForComp[]>>;
    totalQuestion:any;
};

export function FormInput({ setFormData, totalQuestion }: FormInputProps) {
    const [questionAdded, setQuestionAdded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const getValue = (id: string) =>
            (document.getElementById(id) as HTMLInputElement).value;

        const question_text = getValue("question");
        const optionA = getValue("option1");
        const optionB = getValue("option2");
        const optionC = getValue("option3");
        const optionD = getValue("option4");
        const correct = getValue("correct");
        const marks = +getValue("marks");

        const options = {
            a: optionA,
            b: optionB,
            c: optionC,
            d: optionD,
        };

        // Ensure correct_answer is one of 'a' | 'b' | 'c' | 'd'
        if (!["a", "b", "c", "d"].includes(correct)) {
            alert("Correct answer must be one of a, b, c, or d.");
            return;
        }

        const correct_answer = correct as keyof typeof options;

        const question = { question_text, options, correct_answer, marks };

        
        if((totalQuestion?.length + 1) > 50){
                toast.error("Maximum only 50 questions allowed. Please remove some questions to add more.");
                return
            }

        setFormData((prev) => [...prev, question]);

        setQuestionAdded(true);
        setTimeout(() => setQuestionAdded(false), 2000);
        (e.target as HTMLFormElement).reset();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold mb-2">
                Add Question via Form
            </h3>

            <input
                id="question"
                placeholder="Enter question"
                required
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
            />

            {["Option A", "Option B", "Option C", "Option D"].map(
                (label, i) => (
                    <input
                        key={i}
                        id={`option${i + 1}`}
                        placeholder={label}
                        required
                        className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
                    />
                )
            )}

            <select
                id="correct"
                required
                defaultValue=""
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
            >
                <option value="" disabled>
                    Select Correct Answer
                </option>
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
            </select>

            <input
                id="marks"
                type="number"
                placeholder="Marks for this question"
                required
                min="1"
                max='20'
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
            />

            <Button
                type="submit"
                className="bg-zinc-900 cursor-pointer hover:bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white gap-2"
            >
                <Plus size={16} />
                Add Question
            </Button>

            {questionAdded && (
                <span className="text-green-500 text-sm">
                    ✅ Question added!
                </span>
            )}
        </form>
    );
}
