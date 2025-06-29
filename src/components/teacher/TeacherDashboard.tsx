// src/pages/TeacherDashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestCard } from "@/components/teacher/TestCard";
import { Plus } from "lucide-react";

export default function TeacherDashboard() {
  const { currentUser, loading } = useAuth();
  const { profile } = currentUser || {}
  const navigate = useNavigate();
  const [tab, setTab] = useState("my");

  useEffect(() => {
    if (!loading && profile?.role !== "teacher") {
      navigate("/unauthorized");
    }
  }, [currentUser, loading]);

  const myTests = [
    {
      id: "1",
      name: "Maths Test",
      createdBy: "Mr. A",
      attempts: 20,
      highestScore: 18,
      totalMarks: 20,
      duration: 30,
      status: "Published",
    },
    {
      id: "2",
      name: "Science Test",
      createdBy: "Mr. A",
      attempts: 14,
      highestScore: 17,
      totalMarks: 20,
      duration: 25,
      status: "Draft",
    },
  ];

  const allTests = [
    ...myTests,
    {
      id: "3",
      name: "English Test",
      createdBy: "Ms. B",
      attempts: 30,
      highestScore: 20,
      totalMarks: 25,
      duration: 40,
      status: "Published",
    },
  ];

  if (loading || profile?.role !== "teacher") {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-slate-100 dark:bg-zinc-900 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Button onClick={() => navigate("/create-test")} className="gap-2">
          <Plus size={18} /> Create Test
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="my">My Tests</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}