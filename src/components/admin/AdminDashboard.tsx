import { useEffect, useState } from "react";
// import { supabaseClient } from "@/supabase/config";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import type { Test } from "@/types/test";

import type { TeacherUser, StudentUser } from "@/types/adminDashboard";
import { Loader2, Trash2, User2, Plus, EyeOff, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TestCard } from "../teacher/TestCard";
import { getTests } from "@/services/testService";
import { getUsersForAdmin } from "@/services/userService";
import { useNavigate } from "react-router";
import { formatDate, validateSignUpForm } from "@/lib/utils";
import { signupUser } from "@/services/authService";
import { toast } from "sonner";

type UserForm = {
    name: string;
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
};

export type User = StudentUser | TeacherUser;
export default function AdminDashboard() {
    const [students, setStudents] = useState<StudentUser[]>([]);
    const [teachers, setTeachers] = useState<TeacherUser[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("students");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [userForm, setUserForm] = useState<UserForm>({
        name: "",
        email: "",
        password: "",
        role: "student",
    });
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateSignUpForm(userForm, setErrors, { role: true })) return;

        const response = await signupUser(userForm.email, userForm.password, {
            name: userForm.name,
            role: userForm.role,
            actionBy: "admin",
        });

        if (response.success) {
            toast.success(`${response.message}`);

            setIsDialogOpen(false);
            setUserForm({
                name: "",
                email: "",
                password: "",
                role: "student",
            });
        } else {
            toast.error(`${response.message}`);
        }
        console.log({ userForm });
    };

    // const formatDateTime = (iso: string) =>
    //     new Date(iso).toLocaleString(undefined, {
    //         dateStyle: "medium",
    //         timeStyle: "short",
    //     });

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
                                        ? `/student/result/${test.test_attempt_id}`
                                        : `/teacher/test/preview/${test.test_id}`
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
                        {user.name}
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
                                            ? `/student/result/${test.test_attempt_id}`
                                            : `/teacher/test/preview/${test.test_id}`
                                    )
                                }
                            >
                                {test.test_name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center my-4">
                🛠️ Admin Dashboard
            </h1>
            <div className="flex justify-end sm:justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 sm:w-auto mb-4 sm:mb-0">
                            <Plus size={18} /> Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Enter the user details below.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className=" items-center gap-4">
                                    <div className="grid grid-cols-4 ">
                                        <Label
                                            htmlFor="name"
                                            className="text-right"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="Full Name"
                                            className="col-span-3"
                                            value={userForm.name}
                                            onChange={(e) =>
                                                setUserForm((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="items-center gap-4">
                                    <div className="grid grid-cols-4">
                                        <Label
                                            htmlFor="email"
                                            className="text-right"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            className="col-span-3"
                                            value={userForm.email}
                                            onChange={(e) =>
                                                setUserForm((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="items-center gap-4">
                                    <div className="relative grid grid-cols-4">
                                        <Label
                                            htmlFor="password"
                                            className="text-right"
                                        >
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            className="col-span-3"
                                            value={userForm.password}
                                            onChange={(e) =>
                                                setUserForm((prev) => ({
                                                    ...prev,
                                                    password: e.target.value,
                                                }))
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-3 top-2.5 text-muted-foreground"
                                            aria-label="Toggle Password"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Role */}
                                <div className="items-center gap-4">
                                    <div className="grid grid-cols-4">
                                        <Label
                                            htmlFor="role"
                                            className="text-right"
                                        >
                                            Role
                                        </Label>
                                        <select
                                            id="role"
                                            className="col-span-3 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground"
                                            value={userForm.role}
                                            onChange={(e) =>
                                                setUserForm((prev) => ({
                                                    ...prev,
                                                    role: e.target.value as
                                                        | "admin"
                                                        | "student"
                                                        | "teacher",
                                                }))
                                            }
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="teacher">
                                                Teacher
                                            </option>
                                            <option value="student">
                                                Student
                                            </option>
                                        </select>
                                    </div>
                                    {errors.role && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.role}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="submit">Submit</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

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
