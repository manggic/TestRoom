// src/components/TestCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Timer, User, FileText, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router";
import type { Test } from "@/types/test";
import { toast } from "sonner";

export function TestCard({ test }: { test: Test }) {
    const navigate = useNavigate();
    const {
        duration_minutes,
        total_marks,
        attempts,
        highest_score,
        status,
        test_name,
        createdByName,
        updatedByName,
    } = test || {};

    return (
        <Card className="bg-white dark:bg-zinc-800 shadow-md hover:shadow-xl transition-all p-5 flex flex-col justify-between">
            {/* Title */}
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {test_name}
            </h2>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800 dark:text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                    <Timer size={20} /> Duration: {duration_minutes} mins
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={20} /> Total Marks: {total_marks}
                </div>
                <div className="flex items-center gap-2">
                    <BarChart2 size={20} /> Attempts: {attempts}
                </div>
                <div className="flex items-center gap-2">
                    <BarChart2 size={20} /> Highest Score: {highest_score}
                </div>
                <div className="flex items-center gap-2">
                    <User size={20} />
                    <span
                        className="truncate whitespace-nowrap overflow-hidden max-w-[180px]"
                        title={createdByName}
                    >
                        Created By: {createdByName}
                    </span>
                </div>
                {updatedByName && updatedByName !== createdByName && (
                    <div className="flex items-center gap-2">
                        <User size={20} />
                        <span
                            className="truncate whitespace-nowrap overflow-hidden max-w-[180px]"
                            title={updatedByName}
                        >
                            Last Updated By: {updatedByName}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar size={20} /> Status: {status}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
                <div className="flex gap-3">
                    <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                            if (attempts === 0) {
                                navigate(
                                    `/teacher/test/edit/${
                                        test.id
                                    }?zzzfff=${crypto.randomUUID()}`,
                                    {
                                        state: { test },
                                    }
                                );
                            } else {
                                toast("Not allowed to edit attempted test");
                            }
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() =>
                            navigate(
                                `/teacher/test/preview/${
                                    test.id
                                }?zzzfff=${crypto.randomUUID()}`,
                                {
                                    state: { test },
                                }
                            )
                        }
                    >
                        Preview
                    </Button>
                </div>

                {attempts > 0 && (
                    <Button
                        size="sm"
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() =>
                            navigate(
                                `/teacher/test/attempts/${
                                    test.id
                                }?zzzfff=${crypto.randomUUID()}`,
                                {
                                    state: { test },
                                }
                            )
                        }
                    >
                        Check Attempts
                    </Button>
                )}
            </div>
        </Card>
    );
}
