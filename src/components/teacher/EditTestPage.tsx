// src/pages/EditTestPage.tsx
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash, ChevronLeft, ChevronRight } from "lucide-react";

export default function EditTestPage() {
  const navigate = useNavigate();
  const [test, setTest] = useState({
    name: "Sample Science Test",
    duration: 30,
    questions: Array.from({ length: 10 }).map((_, i) => ({
      question: `Sample Question ${i + 1}?`,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correct: 0,
      marks: 2
    }))
  });

  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 10;
  const totalPages = Math.ceil(test.questions.length / questionsPerPage);

  const handleInputChange = (index: number, field: string, value: string | number) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setTest({ ...test, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setTest({ ...test, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions.splice(index, 1);
    setTest({ ...test, questions: updatedQuestions });
    if ((currentPage + 1) * questionsPerPage > updatedQuestions.length && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "New Question?",
      options: ["", "", "", ""],
      correct: 0,
      marks: 1
    };
    setTest({ ...test, questions: [...test.questions, newQuestion] });
    setCurrentPage(Math.floor((test.questions.length) / questionsPerPage));
  };

  const start = currentPage * questionsPerPage;
  const paginatedQuestions = test.questions.slice(start, start + questionsPerPage);

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto p-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Back
          </Button>
        </div>

        {/* Card */}
        <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Name</label>
            <input
              type="text"
              className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
              value={test.name}
              onChange={(e) => setTest({ ...test, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Test Duration (minutes)</label>
            <input
              type="number"
              className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
              value={test.duration}
              onChange={(e) => setTest({ ...test, duration: +e.target.value })}
            />
          </div>

          {/* Editable Questions */}
          <ul className="space-y-6 mt-4">
            {paginatedQuestions.map((q, qIndex) => (
              <li
                key={qIndex + start}
                className="p-4 rounded-md border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Question {qIndex + 1 + start}</label>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(qIndex + start)}>
                    <Trash size={16} className="text-red-500" />
                  </Button>
                </div>
                <input
                  type="text"
                  className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                  value={q.question}
                  onChange={(e) => handleInputChange(qIndex + start, "question", e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => (
                    <input
                      key={optIndex}
                      type="text"
                      className="rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex + start, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                    />
                  ))}
                </div>

                <div className="flex gap-4">
                  <div className="w-full">
                    <label className="text-sm font-medium">Correct Answer (Index)</label>
                    <input
                      type="number"
                      className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                      value={q.correct}
                      onChange={(e) => handleInputChange(qIndex + start, "correct", +e.target.value)}
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-sm font-medium">Marks</label>
                    <input
                      type="number"
                      className="w-full rounded-md px-3 py-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600"
                      value={q.marks}
                      onChange={(e) => handleInputChange(qIndex + start, "marks", +e.target.value)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Previous
            </Button>
            <p className="text-sm">Page {currentPage + 1} of {totalPages}</p>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-2"
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>

          {/* Controls */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <Button className="w-full sm:w-auto flex justify-center items-center gap-2">
              <Plus size={16} /> Save Changes
            </Button>
            <Button variant="outline" onClick={handleAddQuestion} className="w-full sm:w-auto gap-2">
              <Plus size={16} /> Add Question
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
