import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router";
import { Link } from "react-router";

export default function SignUpForm() {
    const { register } = useAuth();
    const navigate = useNavigate();

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
        setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
    };

    const validateForm = () => {
        const newErrors = { name: "", email: "", password: "" };
        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
            isValid = false;
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
        ) {
            newErrors.email = "Invalid email address";
            isValid = false;
        }

        if (!form.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const newUser = {
            id: Date.now().toString(),
            name: form.name,
            email: form.email,
            password: form.password,
        };

        register(newUser);
        navigate("/");
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
                            <h2 className="text-3xl font-bold">
                                Create Account
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Sign up to access your test dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="pl-10"
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
                                className="w-full mt-2 cursor-pointer"
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
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
