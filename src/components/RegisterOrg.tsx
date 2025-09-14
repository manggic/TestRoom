import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isEmail } from "validator";
import Navbar from "./Navbar";
import { Eye, EyeOff } from "lucide-react";

import { validateOrgRegistration } from "@/lib/utils";
import { checkIfAlreadyRegistered } from "@/services/organizationService";
import { useNavigate } from "react-router";
// import { Textarea } from "@/components/ui/textarea";
// import { indiaStatesAndCities } from "@/lib/constants";
import { Label } from "@/components/ui/label";

// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const RegisterOrg = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"start" | "verify" | "form">("start");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0);
    const [onFly, setOnFly] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

    const [formData, setFormData] = useState<any>({
        // org_name: "",
        // org_address: "",
        // pincode: "",
        // state: "",
        // city: "",
        // contact_number: "",
        owner_name: "",
        password: "",
        email: "",
    });
    // const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const id = setTimeout(() => setTimer((t) => t - 1), 1000);
            return () => clearTimeout(id);
        }
    }, [timer]);

    // Handle State change
    // const handleStateChange = (state: string) => {
    //     setFormData((prev: any) => ({ ...prev, state, city: "" })); // Reset city
    //     setCities(indiaStatesAndCities[state] || []);
    // };

    // // Handle City change
    // const handleCityChange = (city: string) => {
    //     setFormData((prev: any) => ({ ...prev, city }));
    // };

    // Load cities if state already has a value (edit mode)
    // useEffect(() => {
    //     if (formData.state) {
    //         setCities(indiaStatesAndCities[formData.state] || []);
    //     }
    // }, [formData.state]);

    const validatePassword = (value: string) => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!strongPasswordRegex.test(value)) {
            setPasswordErrorMsg(
                "Password must be at least 8 characters long and include at least one uppercase (A–Z), one lowercase (a–z), one number (0–9), and one special character (@ $ ! % * ? &)."
            );
        } else {
            setPasswordErrorMsg("");
        }
    };

    const handleSendOtp = async () => {
        try {
            if (!isEmail(email))
                return toast.error("Please enter a valid email");

            const orgAlreadyRegistered = await checkIfAlreadyRegistered({
                email,
            });
            if (
                orgAlreadyRegistered?.error ||
                orgAlreadyRegistered?.isAlreadyRegistered
            ) {
                return toast.error("Please check proper details");
            }

            setOnFly(true);
            // const res = await fetch("/functions/v1/send-otp", {
            //   method: "POST",
            //   headers: { "Content-Type": "application/json" },
            //   body: JSON.stringify({ email })
            // });

            const response = await fetch(
                `${VITE_SUPABASE_URL}/functions/v1/send-otp`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${VITE_SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Something went wrong on the server."
                );
            }

            const data = await response.json();

            // The 'data' object will contain the success message from the Edge Function
            console.log(data); // Log the success message

            // Handle successful response
            toast.success("OTP sent! Check your inbox.");
            setTimer(60);
            setStep("verify");
        } catch (err: any) {
            toast.error("Failed to send OTP: " + err.message);
        } finally {
            setOnFly(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!/^[0-9]{6}$/.test(otp)) {
            return toast.error("OTP must be exactly 6 digits");
        }

        try {
            setOnFly(true);
            // Use the full URL to the Supabase Edge Function to avoid CORS errors
            const response = await fetch(
                `${VITE_SUPABASE_URL}/functions/v1/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${VITE_SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp }),
                }
            );

            // The fetch API does not throw an error for bad status codes (e.g., 400 or 500).
            // We must check if the response was successful manually.
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Something went wrong on the server."
                );
            }

            // The 'data' object will contain the success message from the Edge Function
            const data = await response.json();
            console.log(data); // Log the success message

            toast.success("Email verified successfully!");
            setFormData((p) => ({ ...p, email }));
            setStep("form");
        } catch (err) {
            console.error("Error verifying OTP:", err);
            toast.error(
                "Verification failed: " +
                    (err.message || "An unknown error occurred.")
            );
        } finally {
            setOnFly(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: name === "pincode" ? Number(value) : value,
        }));
    };

    const notifyMe = async ({orgEmail, orgOwner }) => {
        try {
            await fetch(`${VITE_SUPABASE_URL}/functions/v1/send-email`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${VITE_SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ orgEmail, orgOwner }),
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setOnFly(true);
            const { isValid, message } = validateOrgRegistration({
                formData: { ...formData, email },
            });
            if (!isValid) return toast.error(message);

            // const resp = await registerOrganization({ ...formData, email });

            const resp = await fetch(
                `${VITE_SUPABASE_URL}/functions/v1/register-organization`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${VITE_SUPABASE_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...formData, email }),
                }
            );

            if (resp.ok) {
                toast.success(
                    "Registration successful"
                );
                notifyMe({
                    // orgName: formData?.org_name,
                    orgEmail: email,
                    orgOwner: formData?.owner_name,
                });
                navigate("/");
            } else {
                toast.error("Submit failed: " + resp.error);
            }
        } catch {
            toast.error("Unexpected error during submission");
        } finally {
            setOnFly(false);
        }
    };

    return (
        <div>
            <Navbar withoutAuth />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4 py-8">
                <Card className="w-full max-w-lg shadow-lg border border-muted backdrop-blur-md bg-white/5 rounded-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-xl sm:text-3xl font-bold">
                            🏢 Register Form
                        </CardTitle>
                        {/* <p className="text-muted-foreground text-sm">
                            {step === "start"
                                ? "Enter your organization email to get started."
                                : step === "verify"
                                ? "Verify the OTP sent to your email."
                                : "Fill in your details."}
                        </p> */}
                    </CardHeader>
                    <CardContent>
                        {step === "start" && (
                            <>
                                <Label htmlFor="email" className="pb-3">
                                    Enter Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contact@org.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Button
                                    className="w-full mt-4"
                                    onClick={handleSendOtp}
                                    disabled={onFly}
                                >
                                    Send OTP
                                </Button>
                            </>
                        )}
                        {step === "verify" && (
                            <>
                                <Label htmlFor="otp" className="pb-3">
                                    Enter OTP
                                </Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    pattern="\\d{6}"
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="text-center text-lg tracking-widest mb-3"
                                    required
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <Button
                                        onClick={handleVerifyOtp}
                                        className="flex-1 mr-2"
                                        disabled={onFly}
                                    >
                                        Verify OTP
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        disabled={timer > 0}
                                        onClick={handleSendOtp}
                                    >
                                        {timer > 0
                                            ? `Resend in ${timer}s`
                                            : "Resend"}
                                    </Button>
                                </div>
                            </>
                        )}
                        {step === "form" && (
                            <form
                                onSubmit={handleSubmitForm}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {/* <div className="space-y-2">
                                    <Label htmlFor="org_name">
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="org_name"
                                        value={formData.org_name}
                                        name="org_name"
                                        onChange={handleChange}
                                        placeholder="e.g. Wisdom International School"
                                        required
                                    />
                                </div> */}

                                {/* <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="org_address">Address</Label>
                                    <Textarea
                                        id="org_address"
                                        name="org_address"
                                        value={formData.org_address}
                                        onChange={handleChange}
                                        placeholder="123 Main Street, Near Clock Tower"
                                        rows={2}
                                        required
                                    />
                                </div> */}

                                {/* State Dropdown */}
                                {/* <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Select
                                        value={formData.state}
                                        onValueChange={handleStateChange}
                                    >
                                        <SelectTrigger
                                            id="state"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(
                                                indiaStatesAndCities
                                            ).map((state) => (
                                                <SelectItem
                                                    key={state}
                                                    value={state}
                                                >
                                                    {state}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div> */}

                                {/* City Dropdown */}
                                {/* <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Select
                                        value={formData.city}
                                        onValueChange={handleCityChange}
                                        disabled={!formData.state}
                                    >
                                        <SelectTrigger
                                            id="city"
                                            className="w-full"
                                        >
                                            <SelectValue
                                                placeholder={
                                                    formData.state
                                                        ? "Select City"
                                                        : "Select State First"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem
                                                    key={city}
                                                    value={city}
                                                >
                                                    {city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div> */}
                                {/* <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input
                                        id="pincode"
                                        type="number"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="e.g. 400001"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_phone">
                                        Contact Phone
                                    </Label>
                                    <Input
                                        id="contact_phone"
                                        type="tel"
                                        name="contact_number"
                                        value={formData.contact_number}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 9876543210"
                                        required
                                    />
                                </div> */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="owner_name">
                                        Owner / Admin Name
                                    </Label>
                                    <Input
                                        id="owner_name"
                                        name="owner_name"
                                        value={formData?.owner_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Radhika Mehta"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={handleChange}
                                        placeholder="e.g. contact@wisdomschool.com"
                                        required
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={formData?.password}
                                            onChange={(e) => {
                                                handleChange(e);
                                                validatePassword(
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="e.g. ********"
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
                                    {passwordErrorMsg && (
                                        <p className="text-red-500 text-sm">
                                            {passwordErrorMsg}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-base mt-4 md:col-span-2"
                                    disabled={onFly}
                                >
                                    🚀 Register
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterOrg;
