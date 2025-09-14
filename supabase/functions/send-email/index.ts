// supabase/functions/send-org-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";

// Define reusable CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const { orgEmail, orgOwner } = await req.json();

      // if (!orgName) {
      //   return new Response(
      //     JSON.stringify({ error: "Organization name is required" }),
      //     {
      //       status: 400,
      //       headers: { ...corsHeaders, "Content-Type": "application/json" },
      //     }
      //   );
      // }

      // Setup Nodemailer transporter (Gmail example)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: Deno.env.get("EMAIL_USER"),
          pass: Deno.env.get("EMAIL_PASS"), // Use Gmail App Password
        },
      });

      // Send notification email to yourself
      await transporter.sendMail({
        from: Deno.env.get("EMAIL_USER"),
        to: Deno.env.get("EMAIL_USER"),
        subject: "🚀 New Organization Registered",
        html: `
          <h2>New Organization Registered</h2>
          <p><strong>Org Email:</strong> ${orgEmail || "N/A"}</p>
          <p><strong>Owner Name:</strong> ${orgOwner || "N/A"}</p>
        `,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification email sent successfully.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
