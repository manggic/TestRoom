// supabase/functions/send-otp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer";

// Define a reusable set of CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    // Handle CORS preflight requests first.
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    // Now handle the actual POST request.
    if (req.method === "POST") {
        try {
            // ONLY try to parse the body if the method is POST
            const { email } = await req.json();

            if (!email) {
                return new Response(
                    JSON.stringify({ error: "Email is required" }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            // Supabase client
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            // ✅ Check if email already exists in organizations table
            const { data: existingOrg, error: orgCheckError } = await supabase
                .from("organizations")
                .select("id") // only need id, lightweight query
                .eq("email", email)
                .single();

            if (orgCheckError && orgCheckError.code !== "PGRST116") {
                // If error is not "no rows found"
                throw new Error(orgCheckError.message);
            }

            if (existingOrg) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message:
                            "Please check your inputs.",
                    }),
                    {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            await supabase.from("email_otps").delete().eq("email", email);

            // Generate OTP & expiry
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expires_at = new Date(
                Date.now() + 10 * 60 * 1000
            ).toISOString();

            // Upsert OTP in DB
            const { error: upsertError } = await supabase
                .from("email_otps")
                .upsert(
                    { email, otp, expires_at, isEmailVerified: false },
                    { onConflict: "email" }
                );

            if (upsertError) throw new Error(upsertError.message);

            // Nodemailer transporter (Gmail example)
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: Deno.env.get("EMAIL_USER"),
                    pass: Deno.env.get("EMAIL_PASS"), // Use App Password for Gmail
                },
            });

            // Send email
            await transporter.sendMail({
                from: Deno.env.get("EMAIL_USER"),
                to: email,
                subject: "Your Organization Verification Code",
                html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "OTP sent successfully.",
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }
    }

    // Handle any other methods (e.g., GET) with a not found response
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
});
