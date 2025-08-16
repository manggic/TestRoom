import { useState, useEffect } from "react";
import type { TeacherUser, StudentUser } from "@/types/adminDashboard";
import type { Test } from "@/types/test";
import { getTestsOfOrg } from "@/services/testService";
import { getStudentsOfOrg, getTeachersOfOrg } from "@/services/userService";
import { useAuth } from "@/context/useAuth";
import { useParams } from "react-router";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestCard } from "../teacher/TestCard";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, User2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

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
import { getAdminsOfOrg, getOrgById } from "@/services/organizationService";
import { BackButton } from "../BackButton";

export type User = StudentUser | TeacherUser;

export default function OrgDetails() {
    const { orgId } = useParams();
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [teachers, setTeachers] = useState<TeacherUser[]>([]);
    const [admins, setAdmins] = useState<TeacherUser[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("admins");

    const [orgDetails, setOrgDetails] = useState(null);

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await getStudentsOfOrg({
                orgId,
            });

            setStudents(response.data || []);
        } catch (error) {
            toast("failed to fetch students ", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await getTeachersOfOrg({
                orgId,
            });

            setTeachers(response.data || []);
        } catch (error) {
            toast("failed to fetch teachers ", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await getTestsOfOrg({
                orgId,
            });

            if (response.success) {
                setTests(response.data);
            }
        } catch (error) {
            toast("failed to fetch tests ", error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            setLoading(true);

            const response = await getAdminsOfOrg({ orgId });
            setAdmins(response.data || []);
        } catch (error) {
            toast("failed to fetch tests ", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        return;
        // if (!selectedUser) return;
        // const { error } = await supabaseClient
        //     .from("users")
        //     .delete()
        //     .eq("id", selectedUser.id);

        // if (!error) {
        //     setStudents((prev) =>
        //         prev.filter((user) => user.id !== selectedUser.id)
        //     );
        //     setTeachers((prev) =>
        //         prev.filter((user) => user.id !== selectedUser.id)
        //     );
        //     setSelectedUser(null);
        // } else {
        //     console.error("Delete error:", error);
        // }
    };

    // useEffect(() => {
    //     fetchStudents();
    // }, []);

    useEffect(() => {
        if (activeTab === "tests" && tests.length === 0) {
            fetchTests();
        } else if (activeTab === "teachers" && !teachers.length) {
            fetchTeachers();
        } else if (activeTab === "students" && !students.length) {
            fetchStudents();
        } else if (activeTab === "admins" && !admins.length) {
            fetchAdmins();
        }
    }, [activeTab]);

    useEffect(() => {
        const getOrg = async () => {
            const response = await getOrgById({ orgId });
            console.log({ response });
            if (response?.success) {
                setOrgDetails(response?.data);
            }
        };
        getOrg();
    }, []);

    const renderUserRow = (user: User) => (
        <Card
            key={user.id}
            className="p-4 rounded-lg shadow-sm relative text-sm"
        >
            {/* 🖥️ Desktop layout */}
            <div className="hidden sm:grid sm:grid-cols-5 sm:items-center sm:gap-3">
                <div className="font-medium flex items-center gap-2 truncate">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    {user.name}
                </div>

                <div className="text-muted-foreground break-all truncate">
                    {user.email}
                </div>

                <div className="text-muted-foreground truncate">
                    {formatDate(user.created_at)}
                    {/* {formatDateTime(user.created_at)} */}
                </div>

                <div className="flex flex-wrap gap-1">
                    {(user.role === "student"
                        ? user.attempted_tests
                        : user.created_tests
                    )?.map((test, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="text-xs cursor-pointer text-white bg-[cadetblue]"
                            onClick={() =>
                                navigate(
                                    user.role === "student"
                                        ? `/student/result/${test?.test_attempt_id}`
                                        : `/teacher/test/preview/${test?.test_id}`
                                )
                            }
                        >
                            {test.test_name}
                        </Badge>
                    ))}
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

            {/* 📱 Mobile layout */}
            <div className="block sm:hidden space-y-2 relative">
                {/* Delete Button (Top Right) */}
                {/* <div className="absolute top-3 right-3">
                        
                    </div> */}

                <div className="flex items-center justify-between font-medium">
                    <div className="flex gap-2">
                        <User2 className="h-4 w-4 text-muted-foreground" />
                        {user?.name}
                    </div>

                    <div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete {user.name}?
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <p className="text-sm text-muted-foreground">
                                    This action is permanent and cannot be
                                    undone.
                                </p>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>
                                        Yes, Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">Email: </span>
                    {user.email}
                </div>

                <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                        Joined:{" "}
                    </span>
                    {formatDate(user.created_at)}
                </div>

                <div>
                    <span className="font-medium text-foreground">
                        {user.role === "student"
                            ? "Attempted Tests:"
                            : "Created Tests:"}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {(user?.role === "student"
                            ? user?.attempted_tests
                            : user?.created_tests
                        )?.map((test, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="text-xs cursor-pointer text-white bg-[cadetblue]"
                                onClick={() =>
                                    navigate(
                                        user.role === "student"
                                            ? `/student/result/${test?.test_attempt_id}`
                                            : `/teacher/test/preview/${test?.test_id}`
                                    )
                                }
                            >
                                {test?.test_name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <BackButton />
            <h1 className="text-2xl md:text-3xl font-bold text-center my-4">
                🛠️ {orgDetails?.org_name || "Organization "} Details
            </h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
                </div>
            ) : (
                <Tabs
                    value={activeTab} // controlled instead of defaultValue
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="mb-4 flex justify-center md:justify-center flex-nowrap overflow-x-auto gap-2 px-2 scrollbar-hide">
                        <TabsTrigger
                            value="admins"
                            type="button"
                            className="cursor-pointer"
                        >
                            Admins{" "}
                            {admins.length === 0 ? "" : `(${admins.length})`}
                        </TabsTrigger>
                        <TabsTrigger
                            value="students"
                            type="button"
                            className="cursor-pointer"
                        >
                            Students{" "}
                            {students.length === 0
                                ? ""
                                : `(${students.length})`}
                        </TabsTrigger>
                        <TabsTrigger
                            type="button"
                            value="teachers"
                            className="cursor-pointer"
                        >
                            Teachers{" "}
                            {teachers.length === 0
                                ? ""
                                : `(${teachers.length})`}
                        </TabsTrigger>
                        <TabsTrigger
                            type="button"
                            value="tests"
                            className="cursor-pointer"
                        >
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
                    <TabsContent value="admins" className="space-y-2">
                        {admins.length > 0 ? (
                            admins.map(renderUserRow)
                        ) : (
                            <p className="text-muted-foreground text-center">
                                No admins found.
                            </p>
                        )}
                    </TabsContent>

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
