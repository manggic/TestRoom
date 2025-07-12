import { useEffect, useState } from "react";
import { supabaseClient } from "@/supabase/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TestCard } from "../teacher/TestCard";
import { getTests } from "@/services/testService";
import { getUsers } from "@/services/userService";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    attemptedTests: number;
    isActive: boolean;
    attempted_test_names?: string[];
    created_test_names?: string[];
}

interface TestData {
    id: string;
    test_name: string;
    duration_minutes: number;
    total_marks: number;
    attempts: number;
    highest_score: number;
    status: string;
    created_by: string;
    updated_by?: string;
    created_by_name?: string;
    updated_by_name?: string;
}

export default function AdminDashboard() {
    const [students, setStudents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [tests, setTests] = useState<TestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("students");

    const fetchUsers = async () => {
        const response = await getUsers();

        if (response.success) {
            setStudents(
                response.data.filter((u: User) => u.role === "student")
            );
            setTeachers(
                response.data.filter((u: User) => u.role === "teacher")
            );
        }
    };

    const fetchTests = async () => {
        const response = await getTests();
        if (response.success) {
            setTests(response.data);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUsers().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (activeTab === "tests" && tests.length === 0) {
            fetchTests();
        }
    }, [activeTab]);

    const handleDelete = async () => {
        if (!selectedUser) return;
        const { error } = await supabaseClient
            .from("users")
            .delete()
            .eq("id", selectedUser.id);

        if (!error) {
            setStudents((prev) =>
                prev.filter((user) => user.id !== selectedUser.id)
            );
            setTeachers((prev) =>
                prev.filter((user) => user.id !== selectedUser.id)
            );
            setSelectedUser(null);
        } else {
            console.error("Delete error:", error);
        }
    };

    const formatDateTime = (iso: string) =>
        new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });

    const renderUserRow = (user: User) => (
        <Card key={user.id} className="p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-sm">
                <div className="font-medium flex items-center gap-2 truncate">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    {user.name}
                </div>

                <div className="text-muted-foreground break-all truncate">
                    {user.email}
                </div>

                <div className="text-sm text-muted-foreground truncate">
                    {formatDateTime(user.created_at)}
                </div>

                <div className="flex flex-wrap gap-1">
                    {(user.role === "student"
                        ? user.attempted_test_names
                        : user.created_test_names
                    )?.map((testName, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                            {testName}
                        </Badge>
                    )) || (
                        <span className="text-muted-foreground text-xs">
                            None
                        </span>
                    )}
                </div>

                <div className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete {user.name}?
                                </AlertDialogTitle>
                            </AlertDialogHeader>
                            <p className="text-sm text-muted-foreground">
                                This action is permanent and cannot be undone.
                            </p>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Yes, Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                🛠️ Admin Dashboard
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                </div>
            ) : (
                <Tabs
                    defaultValue="students"
                    className="w-full"
                    onValueChange={setActiveTab}
                >
                    <TabsList className="mb-4 flex justify-center flex-wrap gap-2">
                        <TabsTrigger value="students">
                            Students ({students.length})
                        </TabsTrigger>
                        <TabsTrigger value="teachers">
                            Teachers ({teachers.length})
                        </TabsTrigger>
                        <TabsTrigger value="tests">
                            Tests ({tests.length})
                        </TabsTrigger>
                    </TabsList>

                    {activeTab !== "tests" && (
                        <div className="hidden sm:grid grid-cols-5 px-2 mb-2 text-sm font-medium text-muted-foreground">
                            <div>Name</div>
                            <div>Email</div>
                            <div>Joined</div>
                            <div>
                                {activeTab === "students"
                                    ? "Attempted Tests"
                                    : "Created Tests"}
                            </div>
                            <div className="text-right">Actions</div>
                        </div>
                    )}

                    <TabsContent value="students" className="space-y-2">
                        {students.length > 0 ? (
                            students.map(renderUserRow)
                        ) : (
                            <p className="text-muted-foreground text-center">
                                No students found.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="teachers" className="space-y-2">
                        {teachers.length > 0 ? (
                            teachers.map(renderUserRow)
                        ) : (
                            <p className="text-muted-foreground text-center">
                                No teachers found.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent
                        value="tests"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {tests.length > 0 ? (
                            tests.map((test) => (
                                <TestCard
                                    key={test.id}
                                    test={test}
                                    createdByName={test.created_by_name}
                                    lastUpdatedByName={test.updated_by_name}
                                />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center col-span-full">
                                No tests available.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
