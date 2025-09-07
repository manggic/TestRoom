// supabase/functions/register-organization/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import validator from "npm:validator";

// 🔹 India States & Cities mapping
const indiaStatesAndCities: Record<string, string[]> = {
    "Andhra Pradesh": [
        "Visakhapatnam",
        "Vijayawada",
        "Guntur",
        "Nellore",
        "Tirupati",
    ],
    "Arunachal Pradesh": [
        "Itanagar",
        "Naharlagun",
        "Tawang",
        "Pasighat",
        "Ziro",
    ],
    Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    Kerala: [
        "Thiruvananthapuram",
        "Kochi",
        "Kozhikode",
        "Thrissur",
        "Alappuzha",
    ],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    Manipur: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul"],
    Meghalaya: ["Shillong", "Tura", "Nongpoh", "Jowai", "Baghmara"],
    Mizoram: ["Aizawl", "Lunglei", "Serchhip", "Champhai", "Kolasib"],
    Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"],
    Punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    Sikkim: ["Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo"],
    "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Salem",
        "Tiruchirappalli",
    ],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
    Tripura: ["Agartala", "Udaipur", "Kailashahar", "Dharmanagar", "Belonia"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"],
    Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Nainital"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
    Delhi: ["New Delhi", "Dwarka", "Saket", "Rohini", "Karol Bagh"],
    Chandigarh: ["Chandigarh"],
    "Jammu and Kashmir": [
        "Srinagar",
        "Jammu",
        "Anantnag",
        "Baramulla",
        "Kathua",
    ],
    Ladakh: ["Leh", "Kargil"],
    Lakshadweep: ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott"],
    Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Andaman and Nicobar Islands": [
        "Port Blair",
        "Havelock Island",
        "Neil Island",
        "Diglipur",
        "Rangat",
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
        "Daman",
        "Diu",
        "Silvassa",
        "Naroli",
        "Amli",
    ],
};

// 🔹 Supabase client
const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role key needed for inserts
);

// 🔹 Validation
function validateOrgRegistration(formData: Record<string, any>) {
    const {
        org_name,
        org_address,
        pincode,
        state,
        city,
        contact_number,
        owner_name,
        email,
    } = formData;

    if (!org_name?.trim())
        return { isValid: false, message: "Organization name is required" };
    if (!org_address?.trim())
        return { isValid: false, message: "Organization address is required" };

    if (!pincode || !validator.isPostalCode(String(pincode), "IN"))
        return { isValid: false, message: "Invalid pincode" };

    if (!state || !indiaStatesAndCities[state])
        return { isValid: false, message: "Invalid state" };

    if (!city || !indiaStatesAndCities[state].includes(city))
        return { isValid: false, message: `Invalid city for state ${state}` };

    if (!contact_number || !validator.isMobilePhone(contact_number, "en-IN"))
        return { isValid: false, message: "Invalid phone number" };

    if (!owner_name?.trim())
        return { isValid: false, message: "Owner name is required" };
    if (!email || !validator.isEmail(email))
        return { isValid: false, message: "Invalid email address" };

    return { isValid: true, message: "Validation passed" };
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 🔹 Edge Function handler
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method === "POST") {
        try {
            const formData = await req.json();

            // 1️⃣ Check OTP record
            const { data: otpRow, error: otpErr } = await supabase
                .from("email_otps")
                .select("isEmailVerified")
                .eq("email", formData?.email)
                .single();

            if (otpErr || !otpRow) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "No verified OTP found for this email",
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

            // 2️⃣ Ensure verified
            if (!otpRow.isEmailVerified) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: "Email not verified yet",
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
            const validation = validateOrgRegistration(formData);

            if (!validation.isValid) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: validation.message,
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

            const { data, error } = await supabase
                .from("organizations")
                .insert([
                    {
                        request_status: "pending",
                        org_name: formData.org_name,
                        org_address: formData.org_address,
                        pincode: formData.pincode,
                        state: formData.state,
                        city: formData.city,
                        contact_number: formData.contact_number,
                        owner_name: formData.owner_name,
                        email: formData.email,
                    },
                ])
                .select();

            // 4️⃣ Delete OTP row after success
            await supabase
                .from("email_otps")
                .delete()
                .eq("email", formData?.email);

            if (error) {
                return new Response(
                    JSON.stringify({ success: false, error: error.message }),
                   {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            return new Response(JSON.stringify({ success: true, data }), {
                        status: 200,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    });
        } catch (err) {
            return new Response(
                JSON.stringify({ success: false, error: err.message }),
                {
                        status: 400,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    }
            );
        }
    }

    // Handle any other methods (e.g., GET) with a not found response
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
});
