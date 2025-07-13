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

import type { Test } from "@/types/test";

import type { TeacherUser, StudentUser } from "@/types/adminDashboard";
import { Loader2, Trash2, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TestCard } from "../teacher/TestCard";
import { getTests } from "@/services/testService";
import { getUsersForAdmin } from "@/services/userService";
import { useNavigate } from "react-router";

export type User = StudentUser | TeacherUser;
export default function AdminDashboard() {
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [teachers, setTeachers] = useState<TeacherUser[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("students");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        const response = await getUsersForAdmin();


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
        return;
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
                    {user.role === "student" ? (
                        user.attempted_tests.length > 0 ? (
                            user.attempted_tests.map((test, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        navigate(
                                            `/student/result/${test.test_attempt_id}`
                                        )
                                    }
                                >
                                    <Badge
                                        variant="outline"
                                        className="text-xs cursor-pointer"
                                    >
                                        {test.test_name}
                                    </Badge>
                                </button>
                            ))
                        ) : (
                            <span className="text-muted-foreground text-xs">
                                None
                            </span>
                        )
                    ) : user.created_tests.length > 0 ? (
                        user.created_tests.map((test, i) => (
                            <button
                                key={i}
                                onClick={() =>
                                    navigate(
                                        `/teacher/test/preview/${test.test_id}`
                                    )
                                }
                            >
                                <Badge
                                    variant="outline"
                                    className="text-xs cursor-pointer"
                                >
                                    {test.test_name}
                                </Badge>
                            </button>
                        ))
                    ) : (
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
                        <TabsTrigger
                            value="students"
                            className="cursor-pointer"
                        >
                            Students ({students.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="teachers"
                            className="cursor-pointer"
                        >
                            Teachers ({teachers.length})
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="cursor-pointer">
                            Tests{" "}
                            {tests.length === 0 ? "" : `(${tests.length})`}
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
                                    // createdByName={test.createdByName}
                                    // lastUpdatedByName={test.updatedByName}
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
