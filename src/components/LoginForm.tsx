import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";

import { logInUser } from "@/services/authService";
import { useAuth } from "@/context/useAuth";

export default function LoginForm() {
    const { currentUser } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        if (currentUser?.user?.email && location.pathname !== "/") {
            navigate(`/${currentUser?.user?.role}`, { replace: true });
        }
    }, [currentUser, navigate, location.pathname]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await logInUser({
            email: form.email,
            password: form.password,
        });

        if (res.success) {
            toast.success("Login successful");
            navigate(`/${res?.data?.role}`, { replace: true });
        } else {
            toast.error("Login failed: Invalid credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-2xl shadow-lg border-none">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Enter your credentials to login
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="pl-10 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 h-11"
                                        required
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
                            </div>

                            <Button type="submit" className="w-full h-11 mt-2">
                                Login
                            </Button>

                            <div className="flex justify-center gap-3 mt-4">
                                {/* Visit Home */}
                                <a
                                    href="/"
                                    className="
      flex items-center justify-center gap-2
      px-5 py-2.5 rounded-full font-semibold text-sm
      text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100
      border border-blue-200 shadow-sm
      hover:shadow-md hover:scale-105 hover:from-blue-100 hover:to-blue-200
      transition-all duration-300 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
    "
                                >
                                    Visit Home
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
