import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    FileText,
    User,
    Calendar,
    Trophy,
    BarChart2,
    Timer,
} from "lucide-react";

import { useNavigate } from "react-router";
import {
    getTestAttemptsByStudentId,
    getUnattemptedTestsOfStudentId,
} from "@/services/testAttemptService";

interface Test {
    id: string;
    test_name: string;
    description: string;
    duration_minutes: number;
    total_marks: number;
    created_at: string;
    users: {
        name: string;
    };
}

interface TestAttempt {
    id: string;
    score_achieved: number;
    total_questions: number;
    time_taken_seconds: number;
    created_at: string;
    status: "in_progress" | "completed" | "timed_out";
    tests: Test;
}

export default function StudentDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [unattemptedTests, setUnattemptedTests] = useState<Test[]>([]);
    const [attemptedTests, setAttemptedTests] = useState<TestAttempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.user?.id) {
            loadTests();
        }
    }, [currentUser]);

    const loadTests = async () => {
        try {
            setLoading(true);
            const studentId = currentUser?.user?.id;

            // Load unattempted tests
            const unattemptedResult = await getUnattemptedTestsOfStudentId(
                studentId
            );
            if (unattemptedResult.success) {
                setUnattemptedTests(unattemptedResult.data as Test[]);
            }

            // Load attempted tests
            const attemptedResult = await getTestAttemptsByStudentId(studentId);
            if (attemptedResult.success) {
                console.log("Attempted tests data:", attemptedResult.data);
                setAttemptedTests(attemptedResult.data as TestAttempt[]);
            }
        } catch (error) {
            console.error("Failed to load tests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId: string) => {
        navigate(`/student/test/${testId}`);
    };

    const handleViewResult = (attemptId: string) => {
        navigate(`/student/result/${attemptId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getScorePercentage = (score: number, totalMarks: number) => {
        return Math.round((score / totalMarks) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Loading your tests...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Student Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Welcome back! Here are your tests and results.
                </p>
            </div>

            <Tabs defaultValue="unattempted" className="w-full">
                <TabsList className="w-full flex sm:grid sm:grid-cols-2 gap-2 sm:gap-0 overflow-x-auto sm:overflow-visible no-scrollbar p-1 bg-muted rounded-md">
                    <TabsTrigger
                        value="unattempted"
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap
               data-[state=active]:bg-primary data-[state=active]:text-white transition"
                    >
                        <FileText className="h-4 w-4" />
                        Unattempted ({unattemptedTests.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="attempted"
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap
               data-[state=active]:bg-primary data-[state=active]:text-white transition"
                    >
                        <Trophy className="h-4 w-4" />
                        Attempted ({attemptedTests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unattempted" className="mt-6">
                    {unattemptedTests.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No Tests Available
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    There are no unattempted tests available at
                                    the moment.
                                    <br />
                                    Check back later for new tests!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {unattemptedTests.map((test) => (
                                <Card
                                    key={test.id}
                                    className="hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                                            {test.test_name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {test.description}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4" />
                                                <span>
                                                    Total Marks:{" "}
                                                    {test.total_marks}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    Duration:{" "}
                                                    {test.duration_minutes} min
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>
                                                    Created by:{" "}
                                                    {test.users?.name ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Created:{" "}
                                                    {formatDate(
                                                        test.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() =>
                                                handleStartTest(test.id)
                                            }
                                            className="w-full mt-4"
                                        >
                                            Start Test
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="attempted" className="mt-6">
                    {attemptedTests.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No Attempted Tests
                                </h3>
                                <p className="text-muted-foreground text-center">
                                    You haven't attempted any tests yet.
                                    <br />
                                    Start with the unattempted tests to see your
                                    results here!
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {attemptedTests.map((attempt) => {
                                const percentage = getScorePercentage(
                                    attempt.score_achieved || 0,
                                    attempt.tests.total_marks || 1
                                );

                                return (
                                    <Card
                                        key={attempt.id}
                                        className="hover:shadow-lg transition-shadow"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                                                        {
                                                            attempt.tests
                                                                .test_name
                                                        }
                                                    </CardTitle>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {
                                                            attempt.tests
                                                                .description
                                                        }
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        percentage >= 80
                                                            ? "default"
                                                            : percentage >= 60
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {percentage}%
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-4 w-4" />
                                                    <span>
                                                        Score:{" "}
                                                        {attempt.score_achieved ||
                                                            0}
                                                        /
                                                        {attempt.tests
                                                            .total_marks || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <BarChart2 className="h-4 w-4" />
                                                    <span>
                                                        Percentage: {percentage}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        Time Taken:{" "}
                                                        {(() => {
                                                            const t =
                                                                attempt.time_taken_seconds ||
                                                                0;
                                                            return `${Math.floor(
                                                                t / 60
                                                            )}m ${t % 60}s`;
                                                        })()}{" "}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Timer className="h-4 w-4" />
                                                    <span>
                                                        Duration:{" "}
                                                        {attempt.tests
                                                            .duration_minutes ||
                                                            0}{" "}
                                                        min
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    <span>
                                                        Created by:{" "}
                                                        {attempt.tests.users
                                                            ?.name || "Unknown"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Attempted:{" "}
                                                        {formatDate(
                                                            attempt.created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleViewResult(attempt.id)
                                                }
                                                variant="outline"
                                                className="w-full mt-4"
                                            >
                                                View Result
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
