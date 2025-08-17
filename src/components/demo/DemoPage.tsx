import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, GraduationCap } from "lucide-react";
import { logInUser } from "@/services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const STUDENT_EMAIL = import.meta.env.VITE_STUDENT_EMAIL;
const STUDENT_PASSWORD = import.meta.env.VITE_STUDENT_PASSWORD;

const TEACHER_EMAIL = import.meta.env.VITE_TEACHER_EMAIL;
const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD;

export default function DemoPage() {
    const navigate = useNavigate();
    const handleDemoLogin = async (role: string) => {
        // Replace this with your real demo login logic
        console.log(`Logging in as ${role} (demo)`);
        let response = null;
        if (role === "Admin") {
            response = await logInUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            });
        } else if (role === "Student") {
            response =await logInUser({
                email: STUDENT_EMAIL,
                password: STUDENT_PASSWORD,
            });
        } else {
            response = await logInUser({
                email: TEACHER_EMAIL,
                password: TEACHER_PASSWORD,
            });
        }

        
        if (response.success) {
            toast.success("Login successful");
            navigate(`/${response?.data?.role}`, { replace: true });
        } else {
            toast.error("Login failed: Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">
                        Demo Login
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Try admin, teacher, and student views with sample data.
                        No signup needed.
                    </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => handleDemoLogin("Admin")}
                    >
                        <Shield className="w-4 h-4" /> Try Admin Demo
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => handleDemoLogin("Teacher")}
                    >
                        <GraduationCap className="w-4 h-4" /> Try Teacher Demo
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={() => handleDemoLogin("Student")}
                    >
                        <User className="w-4 h-4" /> Try Student Demo
                    </Button>

                    {/* <Alert className="mt-4 border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        <Info className="h-4 w-4" />
                        <AlertTitle>You are in Demo Mode</AlertTitle>
                    </Alert> */}
                </CardContent>
            </Card>
        </div>
    );
}
