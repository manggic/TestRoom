// supabase/functions/verify-otp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define a reusable set of CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
    // Handle CORS preflight requests first.
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }
  
    try {
        // ONLY try to parse the body if the method is POST
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return new Response(JSON.stringify({ error: "Email and OTP are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
        );

        const { data, error } = await supabase
            .from("email_otps")
            .select("otp, expires_at")
            .eq("email", email)
            .single();

        if (error || !data) {
            // Do not reveal if the email exists, for security reasons
            throw new Error("Invalid email or OTP.");
        }

        if (new Date() > new Date(data.expires_at)) {
            throw new Error("OTP has expired.");
        }

        if (data.otp !== otp) {
            throw new Error("Invalid OTP.");
        }

        // Delete the OTP after successful verification to prevent reuse
        await supabase.from("email_otps").delete().eq("email", email);

        return new Response(JSON.stringify({ success: true, message: "Organization verified successfully." }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
