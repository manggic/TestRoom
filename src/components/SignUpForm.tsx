import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { toast } from "sonner";
import { signupUser } from "@/services/authService";
import { useAuth } from "@/context/useAuth";
import { validateSignUpForm } from "@/lib/utils";

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;


export default function SignUpForm() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateSignUpForm(form, setErrors)) return;


       
const res = await fetch(
                `${VITE_SUPABASE_URL}/functions/v1/create-user`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${VITE_SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email:form.email,
                        password:form.password,
                        name:form.name,
                        role:"student"
                     }),
                }
            );

        // const res = await signupUser(form.email, form.password, {
        //     name: form.name,
        //     role: "student",
        // });

        if (res.success) {
            setCurrentUser({ user: res.user });
            navigate("/");
        } else {
            toast.error(
                "message" in res ? res.message : "Something went wrong"
            );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-2 sm:px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm sm:max-w-md"
            >
                <Card className="rounded-2xl shadow-xl border-none">
                    <CardContent className="px-5 py-6 sm:px-8 sm:py-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold">
                                Create Account
                            </h2>
                            <p className="text-muted-foreground text-sm sm:text-base mt-1">
                                Sign up to access your test dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="name"
                                    className="text-sm sm:text-base"
                                >
                                    Name
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="pl-10 py-2.5 text-sm sm:text-base"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="email"
                                    className="text-sm sm:text-base"
                                >
                                    Email
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="pl-10 py-2.5 text-sm sm:text-base"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="password"
                                    className="text-sm sm:text-base"
                                >
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 py-2.5 text-sm sm:text-base"
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

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full mt-2 py-2.5 text-sm sm:text-base"
                            >
                                Sign Up
                            </Button>

                            <p className="text-sm text-center text-muted-foreground mt-4">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>

                            <a
                                href="/"
                                className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                                Visit Home
                            </a>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
