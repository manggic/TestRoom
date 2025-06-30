import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { logInUser } from "@/services/auth";
import { useAuth } from "@/context/useAuth";

export default function LoginForm() {
    const { currentUser } = useAuth();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
    if (currentUser && currentUser.profile?.email) {
      // ✅ Safe to navigate now
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

    // useEffect(() => {
    //     if (currentUser) {
    //         navigate("/");
    //     }
    // }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await logInUser(form.email, form.password);        

        if (res.success) {
            toast("Login successful");
            // navigate("/", { replace: true });
        } else {
            toast("Login failed" + " Invalid credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="rounded-2xl shadow-xl border-none">
                    <CardContent className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold">Welcome Back</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Enter your credentials to login
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        className="pl-10"
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
                                        className="pl-10 pr-10"
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

                            <Button
                                type="submit"
                                className="w-full mt-2 cursor-pointer"
                            >
                                Login
                            </Button>
                            <p className="text-sm text-center text-muted-foreground mt-4">
                                Not registered yet?{" "}
                                <Link
                                    to="/register"
                                    className="text-primary font-medium hover:underline"
                                >
                                    Create an account
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
