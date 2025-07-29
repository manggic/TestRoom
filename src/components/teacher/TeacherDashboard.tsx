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
    const [allTests, setAllTests] = useState<Array<Test>>([]);
    const [myTests, setMyTests] = useState<Array<Test>>([]);
    const [isTestDataloading, setIsTestDataLoading] = useState(true);
    const { currentUser, loading } = useAuth();
    const user = currentUser?.user;
    const navigate = useNavigate();
    const [tab, setTab] = useState("my");
    const [hasLoadedAllTests, setHasLoadedAllTests] = useState(false);

    // useEffect(() => {
    //     if (!loading && user && user.role !== "teacher") {
    //         navigate("/unauthorized");
    //     }
    // }, [currentUser, loading, user, navigate]);

    useEffect(() => {
        async function loadMyTest() {
            try {
                if (user?.id) {
                    const response = await getTestsByTeacherId(user?.id);
                    if (response?.success) {
                        const tests = response?.data as Array<Test>;

                        setMyTests(tests);
                    } else {
                        toast.error(response?.message);
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

                setAllTests(result?.data as Array<Test>);
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

    // if (loading || user?.role !== "teacher") {
    //     return null;
    // }

    return (
        <div className="min-h-screen px-4 py-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
            <h1 className="text-xl sm:text-2xl font-bold my-4">
                Teacher Dashboard
            </h1>
            <div className="flex justify-end sm:justify-end">
                <Button
                    onClick={() => navigate("/teacher/create-test")}
                    className="gap-2 sm:w-auto"
                >
                    <Plus size={18} /> Create Test
                </Button>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-4 flex flex-wrap gap-2 p-1 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                    <TabsTrigger value="my" className="cursor-pointer">
                        My Tests
                    </TabsTrigger>
                    <TabsTrigger value="all" className="cursor-pointer">
                        All Tests
                    </TabsTrigger>
                </TabsList>

                {/* === MY TESTS TAB === */}
                <TabsContent value="my">
                    {myTests?.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">
                            You have not created any tests yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myTests?.map((test) => (
                                <TestCard
                                    key={test?.id}
                                    test={test}
                                    // createdByName={test?.createdByName}
                                    // lastUpdatedByName={test?.updatedByName}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* === ALL TESTS TAB === */}
                <TabsContent value="all">
                    {isTestDataloading && !hasLoadedAllTests ? (
                        <p>Loading All Tests...</p>
                    ) : allTests?.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground">
                            No tests available at the moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allTests.map((test) => (
                                <TestCard
                                    key={test?.id}
                                    test={test}
                                    // createdByName={test?.createdByName}
                                    // lastUpdatedByName={test?.updatedByName}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
