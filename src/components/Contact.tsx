import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Contact() {
    const [contactData, setContactData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        toast.success("Message sent successfully! We will get back to you soon.");
        setContactData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background px-4 py-8">
            <Card className="w-full max-w-2xl backdrop-blur-md bg-white/5 border border-muted shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">
                        📬 Get in Touch
                    </CardTitle>
                    <p className="text-muted-foreground text-center text-sm mt-2">
                        Have a question or feedback? We'd love to hear from you!
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder="👤 Your Name"
                                required
                                value={contactData.name}
                                onChange={(e) =>
                                    setContactData({
                                        ...contactData,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <Input
                                type="email"
                                placeholder="✉️ Your Email"
                                required
                                value={contactData.email}
                                onChange={(e) =>
                                    setContactData({
                                        ...contactData,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <Input
                            type="text"
                            placeholder="📌 Subject"
                            required
                            value={contactData.subject}
                            onChange={(e) =>
                                setContactData({
                                    ...contactData,
                                    subject: e.target.value,
                                })
                            }
                        />
                        <Textarea
                            placeholder="📝 Your Message"
                            rows={6}
                            required
                            value={contactData.message}
                            onChange={(e) =>
                                setContactData({
                                    ...contactData,
                                    message: e.target.value,
                                })
                            }
                        />
                        <Button type="submit" className="w-full text-base">
                            🚀 Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
