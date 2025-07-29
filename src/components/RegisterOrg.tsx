import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "./Navbar";
import { validateOrgRegistration } from "@/lib/utils";
import { registerOrganization } from "@/services/organizationService";
import { useNavigate } from "react-router";
const RegisterOrg = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        org_name: "",
        org_address: "",
        pincode: "",
        state: "",
        city: "",
        contact_number: "",
        owner_name: "",
        email: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        const numbers = ["pincode"];

        setFormData((prev) => ({
            ...prev,
            [name]: numbers.includes(name) ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            // Add validation or API call here

            const validationResponse = validateOrgRegistration({ formData });

            if (validationResponse.isValid) {
                // Proceed with form submission
                // RegisterOrg(formData);
                const response = await registerOrganization(formData);

                if (response.success) {
                    toast.success(
                        "Your organization request has been submitted. Once approved, we’ll send you an email with your login credentials.",
                        {
                            duration: Infinity, // Prevents auto-closing
                            closeButton: true,
                        }
                    );
                    navigate("/");
                    console.log("Submitted Data:", formData);
                } else {
                    toast.error(
                        "Failed to register organization. Please try again later."
                    );
                }
            } else {
                toast.error(validationResponse.message);
                return;
            }
        } catch (error) {
            toast.error(
                "An error occurred while submitting your organization request. Please try again later."
            );
        }
    };

    console.log({ formData });

    return (
        <div>
            <Navbar withoutAuth={true} />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4 py-8">
                <Card className="w-full max-w-3xl shadow-lg border border-muted backdrop-blur-md bg-white/5 rounded-2xl">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-xl sm:text-3xl font-bold">
                            🏢 Register Your Organization
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Create your institution and start managing tests,
                            students, and teachers in one place.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="space-y-2">
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="owner_name">
                                    Owner / Admin Name
                                </Label>
                                <Input
                                    id="owner_name"
                                    name="owner_name"
                                    value={formData.owner_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Radhika Mehta"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="e.g. Jaipur"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="e.g. Rajasthan"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
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
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. contact@wisdomschool.com"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-base mt-4 md:col-span-2"
                            >
                                🚀 Register Organization
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RegisterOrg;
