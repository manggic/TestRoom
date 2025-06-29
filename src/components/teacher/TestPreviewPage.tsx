// src/pages/TestPreviewPage.tsx
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Timer, User, Calendar } from "lucide-react";

export default function TestPreviewPage() {
  const navigate = useNavigate();
  const [test] = useState({
    id: "1",
    name: "Sample Science Test",
    duration: 30,
    totalMarks: 10,
    createdBy: "Mr. A",
    status: "Draft",
    questions: [
      {
        question: "What does CPU stand for?",
        options: [
          "Central Process Unit",
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Processor Utility"
        ],
        correct: 1,
        marks: 2
      },
      {
        question: "Which gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correct: 1,
        marks: 2
      },
      {
        question: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        marks: 2
      },
      {
        question: "How many bones are there in the adult human body?",
        options: ["206", "201", "208", "210"],
        correct: 0,
        marks: 4
      }
    ]
  });

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

        {/* Card Wrapper */}
        <Card className="p-6 space-y-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {test.name}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Timer size={16} /> Duration: {test.duration} mins
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} /> Total Marks: {test.totalMarks || test.questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0)}
            </div>
            <div className="flex items-center gap-2">
              <User size={16} /> Created By: {test.createdBy || "You"}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} /> Status: {test.status || "Draft"}
            </div>
          </div>

          {/* Questions */}
          <ul className="space-y-6 mt-4">
            {test.questions.map((q: any, idx: number) => (
              <li
                key={idx}
                className="p-4 rounded-md border bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
              >
                <p className="font-medium mb-3">
                  Q{idx + 1}. {q.question} <span className="text-xs text-gray-500">({q.marks || 1} marks)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-800 dark:text-gray-100 break-words"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
