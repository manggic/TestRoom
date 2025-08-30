// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Interface for request body
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  organization_id: string;
}

// CORS headers for response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, name, role, organization_id }: CreateUserRequest = await req.json();

    // Validate required fields
    if (!email || !password || !name || !role || !organization_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1️⃣ Create Auth user with app_metadata
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role, organization_id },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ success: false, message: `Auth error: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authUser.user.id;

    // 2️⃣ Insert user into your `users` table
    const { error: userError } = await supabaseAdmin.from("users").insert([
      {
        id: userId,
        name,
        email,
        role,
        organization_id,
        attempted_tests_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (userError) {
      // Cleanup auth user if inserting in `users` fails
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return new Response(
        JSON.stringify({
          success: false,
          message: `User profile creation failed: ${userError.message}`,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: authUser.user }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: `Internal server error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});