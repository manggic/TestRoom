// src/components/TestCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Timer, User, FileText, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router";
export function TestCard({ test }: { test: any }) {
    const navigate = useNavigate();

    return (
        <Card className="bg-white dark:bg-zinc-800 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between">
            {/* Title */}
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {test.name}
            </h2>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800 dark:text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                    <Timer size={16} /> Duration: {test.duration} mins
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={16} /> Total Marks: {test.totalMarks}
                </div>
                <div className="flex items-center gap-2">
                    <BarChart2 size={16} /> Attempts: {test.attempts}
                </div>
                <div className="flex items-center gap-2">
                    <BarChart2 size={16} /> Highest Score: {test.highestScore}
                </div>
                <div className="flex items-center gap-2">
                    <User size={16} /> Created By: {test.createdBy}
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={16} /> Status: {test.status}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
                <Button
                    size="sm"
                    onClick={() => navigate("/testpaper/maths/edit")}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/testpaper/maths/preview")}
                >
                    Preview
                </Button>
            </div>
        </Card>
    );
}
