import { useState } from "react";
import { supabaseClient } from "@/supabase/config";
import Navbar from "./Navbar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router";

export default function UpdatePassword() {
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const { error } = await supabaseClient.auth.updateUser({ password });

        if (error) setMessage(error.message);
        else {
            setMessage(
                "✅ Password updated successfully! You are now logged in."
            );
            setTimeout(() => {
                navigate(`/login`, { replace: true });
            }, 3000);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4 py-8">
                <Card className="w-full max-w-lg shadow-lg border border-muted backdrop-blur-md bg-white/5 rounded-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-xl text-center">
                            Update Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="h-11"
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
                            <Button className="w-full" type="submit">
                                Update Password
                            </Button>
                            {message && (
                                <p className="text-sm text-center">{message}</p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
