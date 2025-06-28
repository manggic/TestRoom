// src/components/test-builder/FormInput.tsx
export function FormInput() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const getValue = (id: string) =>
      (document.getElementById(id) as HTMLInputElement).value;

    const question = getValue("question");
    const options = [1, 2, 3, 4].map((i) => getValue("option" + i));
    const correct = +getValue("correct");
    const marks = +getValue("marks");

    const questions = JSON.parse(localStorage.getItem("mcq_form") || "[]");
    questions.push({ question, options, correct, marks });
    localStorage.setItem("mcq_form", JSON.stringify(questions));

    alert("✅ Question added!");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Add Question via Form</h3>

      <input
        id="question"
        placeholder="Enter question"
        required
        className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
      />

      {[1, 2, 3, 4].map((i) => (
        <input
          key={i}
          id={`option${i}`}
          placeholder={`Option ${i}`}
          required
          className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
        />
      ))}

      <select
        id="correct"
        required
        className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
      >
        <option value="" disabled selected>
          Select Correct Answer
        </option>
        {[1, 2, 3, 4].map((i) => (
          <option key={i - 1} value={i - 1}>
            Option {i}
          </option>
        ))}
      </select>

      <input
        id="marks"
        type="number"
        placeholder="Marks for this question"
        required
        className="w-full border rounded-md px-3 py-2 bg-white dark:bg-zinc-700"
      />

      <button
        type="submit"
        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
      >
        Add Question
      </button>
    </form>
  );
}
