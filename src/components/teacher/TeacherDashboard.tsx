// src/pages/TeacherDashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestCard } from "@/components/teacher/TestCard";
import { Plus } from "lucide-react";

import { toast } from "sonner";

import type { Test } from "@/types/test";
import { getTests, getTestsByTeacherId } from "@/services/testService";

export default function TeacherDashboard() {
    const [allTests, setAllTests] = useState([]);
    const [myTests, setMyTests] = useState<Array<Test>>([]);
    const [isTestDataloading, setIsTestDataLoading] = useState(true);
    const { currentUser, loading } = useAuth();
    const user = currentUser?.user;
    const navigate = useNavigate();
    const [tab, setTab] = useState("my");
    const [hasLoadedAllTests, setHasLoadedAllTests] = useState(false);

    useEffect(() => {
        if (!loading && user && user.role !== "teacher") {
            navigate("/unauthorized");
        }
    }, [currentUser, loading, user, navigate]);

    useEffect(() => {
        async function loadMyTest() {
            try {
                if (user?.id) {
                    const response = await getTestsByTeacherId(user.id);
                    if (response.success) {
                        console.log("laod my test", { response });

                        const tests = response.data;

                        setMyTests(tests);
                    } else {
                        toast(response.message);
                        setMyTests([]);
                    }
                } else {
                    alert("user id is not fetched");
                }
            } catch (err) {
                console.error("Error loading tests:", err);
            } finally {
                setIsTestDataLoading(false);
            }
        }
        loadMyTest();
    }, []);

    useEffect(() => {
        const loadTests = async () => {
            try {
                setIsTestDataLoading(true);
                const result = await getTests();

                setAllTests(result?.data);
                setHasLoadedAllTests(true);
            } catch (err) {
                console.error("Error loading all tests:", err);
            } finally {
                setIsTestDataLoading(false);
            }
        };
        if (tab === "all" && !hasLoadedAllTests) {
            loadTests();
        }
    }, [tab, hasLoadedAllTests]);

    if (isTestDataloading) return <div>Loading...</div>;

    if (loading || user?.role !== "teacher") {
        return null;
    }

    return (
        <div className="min-h-screen p-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
                <Button
                    onClick={() => navigate("/teacher/create-test")}
                    className="gap-2"
                >
                    <Plus size={18} /> Create Test
                </Button>
            </div>

            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="my">My Tests</TabsTrigger>
                    <TabsTrigger value="all">All Tests</TabsTrigger>
                </TabsList>

                {/* === MY TESTS TAB === */}
                <TabsContent value="my">
                    {myTests.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">
                            You have not created any tests yet.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myTests.map((test) => (
                                <TestCard
                                    key={test.id}
                                    test={test}
                                    createdByName={test.createdByName}
                                    lastUpdatedByName={test.updatedByName}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* === ALL TESTS TAB === */}
                <TabsContent value="all">
                    {isTestDataloading && !hasLoadedAllTests ? (
                        <p>Loading All Tests...</p>
                    ) : allTests.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">
                            No tests available at the moment.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {allTests.map((test) => (
                                <TestCard
                                    key={test.id}
                                    test={test}
                                    createdByName={test.createdByName}
                                    lastUpdatedByName={test.updatedByName}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
